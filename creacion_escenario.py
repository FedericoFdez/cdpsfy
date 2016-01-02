import subprocess
import time

NUM_BACKEND_SERVERS = 4
NUM_NAS = 3

NAS_IP = ["10.1.4.21", "10.1.4.22", "10.1.4.23"] # IP de NAS en LAN3
NAGIOS_IP = {
    "lb": "10.1.10.3",
    "frontend_server": "10.1.10.2",
    "backend_servers": "10.1.10.1", # .11, .12, etc.
    "nas": "10.1.10.2" # .21, .22, etc.
}


def run(machine, command):
    args = ["sudo", "lxc-attach", "-n", machine, "--"] + command
    if subprocess.call(args) != 0:
        print "ERROR when running command: " + str(args)

def load_scenario():
    subprocess.call(["bin/prepare-p7-vm"])
    subprocess.call(["sudo", "vnx", "-f", "p7full.xml", "-v", "--create"])

def config_glusterfs():
    #Configurar los servidores de disco (NAS)
    run("nas1", ["gluster", "peer", "probe", NAS_IP[0]])
    run("nas1", ["gluster", "peer", "probe", NAS_IP[1]])
    run("nas1", ["gluster", "peer", "probe", NAS_IP[2]])
    run("nas1", ["gluster", "volume", "create", "nas", "replica", "3", NAS_IP[0] + ":/nas", NAS_IP[1] + ":/nas", NAS_IP[2] + ":/nas", "force"])
    run("nas1", ["gluster", "volume", "start", "nas"])
    run("nas1", ["gluster", "volume", "info"])

    #Configurar los servidores web (WWW)
    for i in range(NUM_BACKEND_SERVERS):
        name = "s" + str(i + 1)
        run(name, ["mkdir", "/mnt/nas"])
        run(name, ["mount", "-t", "glusterfs", NAS_IP[0] + ":/nas", "/mnt/nas"])

def get_machines():
    machines = list()

    #Servidores REST backend
    for k in range(NUM_BACKEND_SERVERS):
        ip_backend_server = NAGIOS_IP["backend_servers"] + str(k+1)
        name_backend_server = "s" + str(k+1)
        machines.append({"name": name_backend_server, "IP": ip_backend_server})
    #Discos NAS
    for k in range(NUM_NAS):
        ip_nas = NAGIOS_IP["nas"] + str(k+1)
        name_nas = "nas" + str(k+1)
        machines.append({"name": name_nas, "IP": ip_nas})
    #Balanceador
    machines.append({"name": "lb", "IP": NAGIOS_IP["lb"] })
    #Servidor frontend
    machines.append({"name": "server-cdpsfy-es", "IP": NAGIOS_IP["frontend_server"] })

    return machines

def config_nagios():
    machines = get_machines()

    #Creacion de los archivos machineName_nagios2.cfg
    for dic in machines:
        ip = dic["IP"]
        name = dic["name"]
        lines = list()
        with open('machine_nagios2.cfg', 'r') as f:
            for line in f.readlines():
                a = line.replace("localhost", name)
                b = a.replace("127.0.0.1", ip)
                lines.append(b)
        output_name = name + "_nagios2.cfg"
        with open(output_name, 'w') as f2:
            for line in lines:
                f2.write(line)
        copy_path = "/var/lib/lxc/nagios/rootfs/etc/nagios3/conf.d/" + output_name
        subprocess.call(["sudo","mv", output_name, copy_path])

    #Creacion del archivo hostgroups_nagios2.cfg
    machine_names = "localhost"
    lines2 = list()
    for dic in machines:
        machine_names += "," + dic["name"]
    print machine_names
    with open('default.cfg', 'r') as f3:
        for line in f3.readlines():
            a = line.replace("localhost", machine_names)
            lines2.append(a)
    output_name_2 = "hostgroups_nagios2.cfg"
    with open(output_name_2, 'w') as f4:
        for line in lines2:
            f4.write(line)
    copy_path2 = "/var/lib/lxc/nagios/rootfs/etc/nagios3/conf.d/" + output_name_2
    subprocess.call(["sudo","mv",output_name_2, copy_path2 ])
    run("nagios", ["service","apache2","start"])
    run("nagios", ["service","nagios3","restart"])

def main():
    load_scenario()
    time.sleep(2)

    config_glusterfs()
    config_nagios()

if __name__ == "__main__":
    main()