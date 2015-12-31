import subprocess
import time
machines = list() # Lista de diccionarios con nombre e ip de cada maquina
num_rest_servers = 4
num_nas = 3

#num_node_servers = 1
#num_lb = 1

#Servidores rest
for k in range(num_rest_servers):
	ip_rest_server = "10.1.10.1" + str(k+1)
	name_rest_server = "s" + str(k+1)
	machines.append({"name": name_rest_server, "ip": ip_rest_server})
#Discos nas
for k in range(num_nas):
	ip_nas = "10.1.10.2" + str(k+1)
	name_nas = "nas" + str(k+1)
	machines.append({"name": name_nas, "ip": ip_nas})
#Balanceador
machines.append({"name": "lb", "ip": "10.1.10.3"})
#Servidor node
machines.append({"name": "server-cdpsfy-es", "ip": "10.1.10.2"})

#Creacion de los archivos machineName_nagios2.cfg
for dic in machines:
	ip = dic["ip"]
	name = dic["name"]
	lines = list()
	f = open('machine_nagios2.cfg', 'r')
	for line in f.readlines():
		a = line.replace("localhost", name)
		b = a.replace("127.0.0.1", ip)
		lines.append(b)
	f.close()
	output_name = name + "_nagios2.cfg"
	f2= open(output_name, 'w')
	for line in lines:
		f2.write(line)
	f2.close()
	copy_path = "/var/lib/lxc/s1/rootfs/etc/nagios3/conf.d/" + output_name
	subprocess.call(["sudo","mv", output_name, copy_path])

#Creacion del archivo hostgroups_nagios2.cfg
machine_names = "localhost"
lines2 = list()
for dic in machines:
	machine_names += "," + dic["name"]
print(machine_names)
f3 = open('default.cfg', 'r')
for line in f3.readlines():
	a = line.replace("localhost", machine_names)
	lines2.append(a)
f3.close()
output_name_2 = "hostgroups_nagios2.cfg"
f4= open(output_name_2, 'w')
for line in lines2:
	f4.write(line)
f4.close()
copy_path2 = "/var/lib/lxc/s1/rootfs/etc/nagios3/conf.d/" + output_name_2
subprocess.call(["sudo","mv",output_name_2, copy_path2 ])
subprocess.call(["sudo", "lxc-attach", "-n", "s1","--","service","apache2","start"])
subprocess.call(["sudo", "lxc-attach", "-n", "s1","--","service","nagios3","restart"])