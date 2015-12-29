import subprocess

#Arrancar el escenario
subprocess.call(["bin/prepare-p7-vm"])
subprocess.call(["sudo", "vnx", "-f", "p7.xml", "-v", "--create"])

#Configuracion de servidores de disco (nas)
subprocess.call(["sudo", "lxc-attach", "-n", "nas1", "--", "gluster", "peer", "probe", "10.1.3.21"])
subprocess.call(["sudo", "lxc-attach", "-n", "nas1", "--","gluster", "peer", "probe", "10.1.3.22"])
subprocess.call(["sudo", "lxc-attach", "-n", "nas1", "--","gluster", "peer", "probe", "10.1.3.23"])
subprocess.call(["sudo", "lxc-attach", "-n", "nas1", "--","gluster", "volume", "create", "nas", "replica", "3", "10.1.3.21:/nas", "10.1.3.22:/nas", "10.1.3.23:/nas", "force"])
subprocess.call(["sudo", "lxc-attach", "-n", "nas1", "--","gluster", "volume", "start", "nas"])
subprocess.call(["sudo", "lxc-attach", "-n", "nas1", "--","gluster", "volume", "info"])

#Configuracion del montaje desde servidores web (www)
num_servidores = 4
for i in range(num_servidores):
	name = "s" + str(i + 1)
	subprocess.call(["sudo", "lxc-attach", "-n", name, "--", "mkdir", "/mnt/nas"])
	subprocess.call(["sudo", "lxc-attach", "-n", name, "--", "mount", "-t", "glusterfs", "10.1.3.21:/nas", "/mnt/nas"])