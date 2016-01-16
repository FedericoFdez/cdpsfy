# Dockerfile to create a container running load balancer (lb)
# MULTI CONTAINER APP
#
# Federico A. Fernández Moreno
# Rodrigo Barbado Esteban

FROM ubuntu:14.04

RUN sudo apt-get update; \
    sudo apt-get install -y openssh-server crossroads

RUN sudo service ssh restart

RUN sudo sed -i s/#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/g '/etc/sysctl.conf'

EXPOSE 8001
EXPOSE 80
EXPOSE 7
EXPOSE 22

CMD	service ssh start; \
	xr --verbose --server tcp:0:80 --backend s1:3000 --backend s2:3000 --backend s3:3000 --backend s4:3000 --web-interface 0:8001