#!/usr/bin/python

import os
import time
import subprocess
from string import Template

DEVELOPMENT = True

NUM_FRONTEND_SERVERS = 2
NUM_BACKEND_SERVERS = 4
NUM_NAS = 3

NAS_IP = ["10.1.3.21", "10.1.3.22", "10.1.3.23"] # IP de NAS en LAN3
NAGIOS_IP = {
    "lb": "10.1.10.2",
    "frontend_servers": "10.1.10.3", # .31, .32
    "db": "10.1.10.30",
    "backend_servers": "10.1.10.1", # .11, .12, etc.
    "nas": "10.1.10.2" # .21, .22, etc.
}

LB_IP = "10.1.1.1"

FRONTEND_IP = "10.1.4.3" # .31, .32
BACKEND_IP = "10.1.2.1" # .11, .12, etc.


def run(machine, command, background=False):
    args = ["sudo", "lxc-attach", "-n", machine, "--"] + command
    if not background and subprocess.call(args) != 0:
        print "ERROR when running command: " + str(args)
    elif background:
        subprocess.Popen(args)

def download_scenario():
    subprocess.call(["wget", "http://idefix.dit.upm.es/download/cdps/p7/p7.tgz"])
    subprocess.call(["tar", "xfvz", "p7.tgz"])
    subprocess.call(["ln", "-s", "../p7full.xml", "p7/p7full.xml"])
    subprocess.call(["rm", "p7.tgz"])

def load_scenario():
    subprocess.call(["p7/bin/prepare-p7-vm"])
    print("prepare")
    subprocess.call(["sudo", "vnx", "-f", "p7/p7full.xml", "-v", "--create"])
    print("vnx")

def config_glusterfs():
    # Configurar los servidores de disco (NAS)
    run("nas1", ["gluster", "peer", "probe", NAS_IP[0]])
    run("nas1", ["gluster", "peer", "probe", NAS_IP[1]])
    run("nas1", ["gluster", "peer", "probe", NAS_IP[2]])
    run("nas1", ["gluster", "volume", "create", "nas", "replica", "3", NAS_IP[0] + ":/nas", NAS_IP[1] + ":/nas", NAS_IP[2] + ":/nas", "force"])
    run("nas1", ["gluster", "volume", "start", "nas"])
    run("nas1", ["gluster", "volume", "info"])

    # Configurar los servidores web (WWW)
    for i in range(NUM_BACKEND_SERVERS):
        name = "s" + str(i + 1)
        run(name, ["mkdir", "/mnt/nas"])
        run(name, ["mount", "-t", "glusterfs", NAS_IP[0] + ":/nas", "/mnt/nas"])

def config_nagios_server():
    if not DEVELOPMENT:
        run("nagios", ["sudo", "apt-get", "install", "-y", "nagios3"])

    machines = list()
    # Servidores REST backend
    for k in range(NUM_BACKEND_SERVERS):
        ip_backend_server = NAGIOS_IP["backend_servers"] + str(k+1)
        name_backend_server = "s" + str(k+1)
        machines.append({"name": name_backend_server, "IP": ip_backend_server})
    # Servidor BD
    machines.append({"name": "db", "IP": NAGIOS_IP["db"]})
    # Discos NAS
    for k in range(NUM_NAS):
        ip_nas = NAGIOS_IP["nas"] + str(k+1)
        name_nas = "nas" + str(k+1)
        machines.append({"name": name_nas, "IP": ip_nas})
    # Balanceador
    machines.append({"name": "lb", "IP": NAGIOS_IP["lb"] })
    # Servidores frontend
    for k in range(NUM_FRONTEND_SERVERS):
        ip_frontend_server = NAGIOS_IP["frontend_servers"] + str(k+1)
        name_frontend_server = "www" + str(k+1)
        machines.append({"name": name_frontend_server, "IP": ip_frontend_server})

    machine_names = "localhost"
    for dic in machines:
        machine_names += "," + dic["name"]

    copy_path = "/var/lib/lxc/nagios/rootfs/etc/nagios3/conf.d/"

    # Creacion de los archivos machineName_nagios2.cfg
    for dic in machines:
        ip = dic["IP"]
        name = dic["name"]
        lines = list()
        with open('./nagios/machine_nagios2.cfg', 'r') as f:
            for line in f.readlines():
                a = line.replace("localhost", name)
                b = a.replace("127.0.0.1", ip)
                lines.append(b)
        output_name = name + "_nagios2.cfg"
        with open(output_name, 'w') as f:
            for line in lines:
                f.write(line)
        subprocess.call(["sudo", "mv", output_name, copy_path + output_name])

    # Creacion del archivo hostgroups_nagios2.cfg
    output_name = "hostgroups_nagios2.cfg"
    with open('./nagios/default.cfg', 'r') as f:
        template = Template(f.read())
        values = {
            "DEBIAN_SERVERS": machine_names,
            "WEB_SERVERS": "s1,s2,s3,s4,www1,www2",
            "SSH_SERVERS": machine_names
        }
        with open(output_name, 'w') as output_file:
            output_file.write(template.substitute(values))

    subprocess.call(["sudo", "mv", output_name, copy_path + output_name])
    run("nagios", ["service", "apache2", "start"])
    run("nagios", ["service", "nagios3", "restart"])

def config_database():
    run("db", ["sudo", "apt-get", "install", "-y", "postgresql", "postgresql-contrib"])

    subprocess.call("sudo bash -c \"echo -e host\tall\tall\t10.1.5.0/24\ttrust >> /var/lib/lxc/db/rootfs/etc/postgresql/9.3/main/pg_hba.conf\"", shell=True)
    subprocess.call("sudo sed -i \"s/#listen_addresses = 'localhost'/listen_addresses = '*'/g\" /var/lib/lxc/db/rootfs/etc/postgresql/9.3/main/postgresql.conf", shell=True)

    run("db", ["service", "postgresql", "restart"])

def config_frontend_servers():
    for k in map(str, range(1, NUM_FRONTEND_SERVERS+1)):
        if not DEVELOPMENT:
            run("www" + k, ["curl", "-sL", "https://deb.nodesource.com/setup_4.x", "|", "sudo", "-E", "bash", "-"])
            run("www" + k, ["sudo", "apt-get", "install", "-y", "nodejs"])
        subprocess.call(["sudo", "cp", "-r", "server", "/var/lib/lxc/www" + k + "/rootfs/root"])
        run("www" + k, ["npm", "install", "/root/server/"])
        #run("www" + k, ["source", "/root/server/.env"])
        #run("www" + k, ["node", "/root/server/bin/www"], background=True)

        subprocess.call("sudo bash -c \"echo \# BEGIN cdpsfy >> /var/lib/lxc/www" + k + "/rootfs/etc/hosts\"",
                    shell=True)
        subprocess.call("sudo bash -c \"echo -e " + \
            LB_IP + "\ttracks.cdpsfy.es >> /var/lib/lxc/www" + k + "/rootfs/etc/hosts\"",
                    shell=True)
        subprocess.call("sudo bash -c \"echo \# END cdpsfy >> /var/lib/lxc/www" + k + "/rootfs/etc/hosts\"",
                    shell=True)

def config_backend_servers():
    if not DEVELOPMENT:
        run("www", ["curl", "-sL", "https://deb.nodesource.com/setup_4.x", "|", "sudo", "-E", "bash", "-"])
        run("www", ["sudo", "apt-get", "install", "-y", "nodejs"])

    for k in map(str, range(1, NUM_BACKEND_SERVERS+1)):
        subprocess.call(["sudo", "cp", "-r", "tracks", "/var/lib/lxc/s" + k + "/rootfs/root"])
        run("s" + k, ["npm", "install", "/root/tracks/"])
        run("s" + k, ["node", "/root/tracks/rest_server.js"], background=True)

def config_lb():
    run("lb", ["apt-get", "install", "-y", "crossroads"])
    run("lb", ["xr", "--verbose", "--server", "http:0:80", "-dr", "--host-match", "tracks.cdpsfy.es", "--backend", BACKEND_IP + "1:8000", "--backend", BACKEND_IP + "2:8000", "--backend", BACKEND_IP + "3:8000", "--backend", BACKEND_IP + "4:8000", "-df", "--host-match", "www.cdpsfy.es", "--backend", FRONTEND_IP + "1:8080", "--backend", FRONTEND_IP + "2:8080", "--web-interface", "0:8001"])

def config_clients():
    for client in ["c1", "c2"]:
        path = "/var/lib/lxc/" + client + "/rootfs/etc/hosts"
        subprocess.call("sudo bash -c \"echo \# BEGIN cdpsfy >> " + path + "\"", shell=True)
        subprocess.call("sudo bash -c \"echo " + LB_IP + "\twww.cdpsfy.es >> " + path + "\"",
                        shell=True)
        subprocess.call("sudo bash -c \"echo " + LB_IP + "\ttracks.cdpsfy.es >> " + path + "\"",
                        shell=True)
        subprocess.call("sudo bash -c \"echo \# END cdpsfy >> " + path + "\"", shell=True)

    # Configurar DNS del Host
    subprocess.call("sudo bash -c \"echo \# BEGIN cdpsfy >> /etc/hosts\"",
                    shell=True)
    subprocess.call("sudo bash -c \"echo " + \
        LB_IP + "\twww.cdpsfy.es >> /etc/hosts\"",
                    shell=True)
    subprocess.call("sudo bash -c \"echo " + \
        LB_IP + "\ttracks.cdpsfy.es >> /etc/hosts\"",
                    shell=True)
    subprocess.call("sudo bash -c \"echo \# END cdpsfy >> /etc/hosts\"",
                    shell=True)

def main():
    #download_scenario()
    load_scenario()
    time.sleep(2)
    config_glusterfs()
    config_nagios_server()
    config_database()
    config_frontend_servers()
    config_backend_servers()
    config_clients()

if __name__ == "__main__":
    main()