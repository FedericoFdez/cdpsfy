# Dockerfile to create a container running server-cdpsfy
# MULTI CONTAINER APP
#
# Federico A. Fernández Moreno
# Rodrigo Barbado Esteban

FROM ubuntu:14.04

RUN sudo apt-get update

RUN sudo apt-get install -y curl;\
    curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -;\
    sudo apt-get install -y nodejs git

# To be removed when git repo is public
RUN mkdir -p /root/.ssh
COPY ssh/ /root/.ssh/
RUN chmod 600 /root/.ssh/*
RUN ssh-keyscan github.com > /root/.ssh/known_hosts

RUN git clone git@github.com:FedericoFdez/cdpsfy.git

WORKDIR cdpsfy/server
RUN npm install

EXPOSE 3000
EXPOSE 7
EXPOSE 22

CMD npm start
