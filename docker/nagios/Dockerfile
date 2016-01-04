# Dockerfile to create a container running nagios
# MULTI CONTAINER APP
#
# Federico A. Fernández Moreno
# Rodrigo Barbado Esteban

FROM federicofdez/cdpsfy-nagios3

COPY conf/ /etc/nagios3/conf.d/

RUN service apache2 start; \
	service nagios3 start;

RUN sudo sed -i "s/check_http/check_http -p 5000/g" /etc/nagios3/conf.d/services_nagios2.cfg; \
	sudo sed -i "s/check_ssh/check_ssh -p 5000/g" /etc/nagios3/conf.d/services_nagios2.cfg

EXPOSE 80

CMD service apache2 restart; \
	tail -f /var/log/nagios3/nagios.log
