# cdpsfy - Sistema de compartición y presentación de audio escalable
Proyecto final de Centros de Datos y Provisión de SS - ETSIT UPM

Desarrollado por [Rodrigo Barbado](https://github.com/rodbarest) y [Federico Fernández](https://github.com/FedericoFdez).

## Descripción
El servicio se divide en dos partes:

* **server.cdpsfy.es**: es el servidor front-end de la aplicación. Contiene la lógica de la misma, así como el modelo de datos de canciones. Su implementación se encuentra [aquí](https://github.com/FedericoFdez/cdpsfy/tree/master/server).
* **tracks.cdpsfy.es**: es una red de servidores web y de disco, que almacena las canciones y las sirve vía HTTP. La implementación del servidor web RESTful se encuentra [aquí](https://github.com/FedericoFdez/cdpsfy/tree/master/tracks).
