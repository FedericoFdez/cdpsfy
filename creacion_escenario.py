import subprocess
import time

NUM_SERVIDORES = 4

def run(machine, command):
    args = ["sudo", "lxc-attach", "-n", machine, "--"] + command
    if subprocess.call(args) != 0:
        print "ERROR when running command: " + ''.join(args)

def main():
    #Arrancar el escenario
    subprocess.call(["bin/prepare-p7-vm"])
    subprocess.call(["sudo", "vnx", "-f", "p7.xml", "-v", "--create"])
    time.sleep(2)
    #Configurar los servidores de disco (NAS)
    run("nas1", ["gluster", "peer", "probe", "10.1.3.21"])
    run("nas1", ["gluster", "peer", "probe", "10.1.3.22"])
    run("nas1", ["gluster", "peer", "probe", "10.1.3.23"])
    run("nas1", ["gluster", "volume", "create", "nas", "replica", "3", "10.1.3.21:/nas", "10.1.3.22:/nas", "10.1.3.23:/nas", "force"])
    run("nas1", ["gluster", "volume", "start", "nas"])
    run("nas1", ["gluster", "volume", "info"])

    #Configurar los servidores web (WWW)
    for i in range(NUM_SERVIDORES):
        name = "s" + str(i + 1)
        run(name, ["mkdir", "/mnt/nas"])
        run(name, ["mkdir", "mount", "-t", "glusterfs", "10.1.3.21:/nas", "/mnt/nas"])

if __name__ == "__main__":
    main()