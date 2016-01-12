# Dockerfile to create a container running nagios
# MULTI CONTAINER APP
#
# Federico A. Fernández Moreno
# Rodrigo Barbado Esteban

FROM federicofdez/cdpsfy-nagios3

COPY conf/ /etc/nagios3/conf.d/

#RUN sudo sed -i "s/check_http/check_http!-p 3000/g" /etc/nagios3/conf.d/services_nagios2.cfg

EXPOSE 80

CMD service apache2 restart; \
	service nagios3 restart; \
	tail -f /var/log/nagios3/nagios.log
