# cdpsfy - Sistema de compartición y presentación de audio escalable
Proyecto final de Centros de Datos y Provisión de SS - ETSIT UPM

Desarrollado por [Rodrigo Barbado](https://github.com/rodbarest) y [Federico Fernández](https://github.com/FedericoFdez).

## Índice
* [Descripción](#descripción)
* [Variables de entorno](#variables-de-entorno)
  * [server.cdpsfy.es](#servercdpsfyes)
  * [tracks.cdpsfy.es](#trackscdpsfyes)
* [Instalación y despliegue](#instalación-y-despliegue)
  * [Entorno de desarrollo](#entorno-de-desarrollo)
  * [Despliegue en escenario virtual (VNX)](#despliegue-en-escenario-virtual-vnx)
  * [Despliegue en Docker](#despliegue-en-docker)

## Descripción
El servicio se divide en dos partes:

* **server.cdpsfy.es**: es el servidor front-end de la aplicación. Contiene la lógica de la misma, así como el modelo de datos de canciones. Su implementación se encuentra [aquí](https://github.com/FedericoFdez/cdpsfy/tree/master/server).
* **tracks.cdpsfy.es**: es una red de servidores web y de disco, que almacena las canciones y las sirve vía HTTP. La implementación del servidor web RESTful se encuentra [aquí](https://github.com/FedericoFdez/cdpsfy/tree/master/tracks).

## Arquitectura
La arquitectura básica puede verse en la siguiente figura:
![Arquitectura](/docs/Arquitectura.png)

En Docker, ha sido necesario realizar algunas modificaciones, que pueden verse a continuación:
![Docker](/docs/Docker.png)

* lb1 y lb2: son dos balanceadores de carga, que utilizan la imagen de tutum/haproxy. Esta imagen facilita que el balanceo se produzca entre todas las instancias de www y de
tracks que se arranquen en cada momento de forma automática. Ambos balanceadores escuchan en sendos puertos 5000, que se mapean con el 80 (lb1, www.cdpsfy.es) y 5000 (lb2, tracks.cdpsfy.es) en el host.
* www: es el servicio en que se aloja la aplicación web (server.cdpsfy.es). Además del puerto 5000, expone sus puertos 7 y 22 para la monitorización desde Nagios.
* tracks: es el servicio en que se aloja el servidor REST (tracks.cdpsfy.es). Además del puerto 5000, expone sus puertos 7 y 22 para la monitorización desde Nagios.
* db: es el servicio en que se aloja la base de datos, y utiliza la imagen de Postgres para ello. Expone su puerto 5432 para la conexión a la base de datos desde fuera. Contiene un volumen de datos.
* nas: es un servicio que se utiliza únicamente para alojar el volumen de datos en que se almacenan las canciones. Este volumen se monta en las instancias del servicio tracks (línea discontinua).
* nagios: es un servicio que aloja el servidor Nagios.

## Variables de entorno
Se han definido las siguientes variables de entorno, a fin de que se pueda configurar *cdpsfy* en cualquier entorno:

### server.cdpsfy.es
| Variable                | Descripción                                                   | Valor por defecto |
|:-----------------------:|:-------------------------------------------------------------:|:-----------------:|
| PORT                    | Puerto en que se lanzará la aplicación web                    | `8080`            |
| TRACKS_HOST             | URL del host y puerto en que se ha lanzado el servidor tracks | `localhost:8000`  |
| DATABASE_URL            | URL a utilizar para la base de datos                          | -                 |
| PASSWORD_ENCRYPTION_KEY | Utilizada para cifrar las contraseñas de los usuarios         | -                 |

### tracks.cdpsfy.es
| Variable | Descripción                                                    | Valor por defecto |
|:--------:|:--------------------------------------------------------------:|:-----------------:|
| PORT     | Puerto en que se lanzará la aplicación web                     | `8000`            |
| TMPPATH  | Ruta en que se almacenarán temporalmente las canciones subidas | `./.tmp/`         |
| NASPATH  | Ruta en que se almacenarán las canciones subidas               | `__dirname`       |

## Instalación y despliegue

### Entorno de desarrollo

1. Instalar `git`:

    ```
    sudo apt-get install git
    ```

2. Descargar la práctica con:

    ```
    git clone https://github.com/FedericoFdez/cdpsfy.git && cd cdpsfy
    ```

3. Instalar las dependencias y arrancar *server*:

    ```
    cd server
    npm install
    npm test
    ```
    
    El script `npm test` arranca el servidor con las variables de entorno necesarias para
    utilizar una base de datos SQLITE, adecuada para entornos de desarrollo.

4. Instalar las dependencias y arrancar *tracks*:
    ```
    cd tracks
    npm install
    npm start
    ```

De este modo, *server* está disponible en `localhost:8080`, y *tracks* en `localhost:8000`.

### Despliegue en escenario virtual (VNX)
1. Instalar VNX, siguiendo las instrucciones disponibles en [este enlace](http://web.dit.upm.es/vnxwiki/index.php/Vnx-install-ubuntu3).
2. Descargar la imagen utilizada por las máquinas virtuales del escenario mediante:

    ```
    cd /usr/share/vnx/filesystems
    vnx_download_rootfs -r vnx_rootfs_lxc_ubuntu-14.04-v025-cdps.tgz
    ln -s vnx_rootfs_lxc_ubuntu-14.04-v025-cdps rootfs_lxc-cdps
    ```

3. Instalar Nagios manualmente en el sistema de archivos, para ello:

    ```
    sudo vnx --modify-rootfs filesystems/rootfs_lxc-cdps
    sudo dhclient eth0
    sudo apt-get install -y nagios3
    ```
    
    Y seguir las instrucciones de instalación que aparecen en pantalla.
    Hay un fallo en la configuración de idiomas que impediría la correcta instalación de la
    base de datos, que se hará posteriormente. Para resolverlo, debe ejecutarse:
    
    ```
    export LANGUAGE="en_US.UTF-8"
    export LC_ALL="en_US.UTF-8"
    echo 'LANGUAGE="en_US.UTF-8"' >> /etc/default/locale
    echo 'LC_ALL="en_US.UTF-8"' >> /etc/default/locale
    ```
    
    Para finalizar:
    
    ```
    halt -p
    ```

4. Instalar `git` y `python` con:

    ```
    sudo apt-get install git python
    ```

5. Descargar la práctica con:

    ```
    git clone https://github.com/FedericoFdez/cdpsfy.git && cd cdpsfy
    ```

6. Arrancar la práctica con:

    ```
    ./crear_escenario.py
    ```
    
    El script `crear_escenario.py` se encarga de configurar todos los parámetros y variables de entorno necesarios.

Se arrancarán varias máquinas virtuales con sus respectivas consolas. Desde el host:
- La web de cdpsfy está disponible en `http://www.cdpsfy.es`
- La interfaz web de monitorización de Nagios está disponible en `http://nagios/nagios3`.
- La interfaz web del balanceador de carga está disponible en `http://lb:8003`.

Finalmente, para cerrar el escenario (desde el host):
```
./eliminar_escenario.py
```

###Despliegue en Docker
1. Instalar Docker siguiendo las instrucciones en [este enlace](https://docs.docker.com/engine/installation/ubuntulinux/#install).
2. Instalar Docker-Compose siguiendo las instrucciones en [este enlace](https://docs.docker.com/compose/install/).
3. Instalar Flocker siguiendo las instrucciones en [este enlace](https://docs.clusterhq.com/en/1.9.0/install/index.html#full-installation). Es necesario realizar la
instalación completa (full install) para que se instale el *plugin de Flocker para Docker*, que se utilizará para gestionar los volúmenes de datos.
    1. Instalar el cliente de Flocker, siguiendo las instrucciones en [este enlace](https://docs.clusterhq.com/en/1.9.0/install/install-client.html#ubuntu-14-04-64-bit).
    2. Instalar los servicios para los nodos de Flocker (*Flocker Node Services*) y el plugin de Flocker para Docker, siguiendo las instrucciones en [este enlace](https://docs.clusterhq.com/en/1.9.0/install/install-node.html#installing-on-ubuntu-14-04).
4. Configurar Flocker siguiendo los pasos en [este enlace](https://docs.clusterhq.com/en/1.9.0/config/index.html#post-installation-configuration).
    1. Configurar la autenticación con el cluster, tanto del cliente que se comunica con el agente Flocker como de cada uno de los nodos (en este caso solo hay uno), tal y como se indica en [este enlace](https://docs.clusterhq.com/en/1.9.0/config/configuring-authentication.html#configuring-cluster-authentication).
    2. Generar certificados para el cliente de la API, según [este enlace](https://docs.clusterhq.com/en/1.9.0/config/generate-api-certificates.html).
    3. Generar certificados para el plugin de Flocker para Docker, según [este enlace](https://docs.clusterhq.com/en/1.9.0/config/generate-api-plugin.html).
    4. Habilitar el servicio de control, como se muestra en [este enlace](https://docs.clusterhq.com/en/1.9.0/config/enabling-control-service.html#ubuntu).
    5. Configurar el *backend de almacenamiento* (véase [este enlace](https://docs.clusterhq.com/en/1.9.0/config/configuring-nodes-storage.html). En este caso se elige un backend ZFS para almacenamiento local, para ello, deben seguirse los siguientes pasos:
      - Instalar **ZFS** (véase [este enlace](https://docs.clusterhq.com/en/1.8.0/config/zfs-configuration.html#installing-zfs-on-ubuntu-14-04)).
      - Crear un pool ZFS. Se recomienda crear uno de tipo *mirror*, por ejemplo, con cuatro discos de 1 GB virtualizados sobre tres ficheros, como se muestra a continuación:
        
        ```
        mkdir -p /var/opt/flocker
        truncate --size 1G /var/opt/flocker/nas1
        truncate --size 1G /var/opt/flocker/nas2
        truncate --size 1G /var/opt/flocker/nas3
        ZFS_MODULE_LOADING=yes zpool create flocker mirror /var/opt/flocker/nas1 /var/opt/flocker/nas2 /var/opt/flocker/nas3 /var/opt/flocker/nas4
        ```
        
      - Configurar ZFS como backend de almacenamiento en los nodos de Flocker (véase [este enlace](https://docs.clusterhq.com/en/1.8.0/config/zfs-configuration.html#zfs-backend-configuration)).
5. Instalar `git` con:

    ```
    sudo apt-get install git
    ```

6. Clonar el repositorio del proyecto con:

    ```
    git clone https://github.com/FedericoFdez/cdpsfy.git
    ```

7. Compilar las imágenes de Docker usando Docker-Compose, desde el directorio `cdpsfy/docker`, con:

    ```
    docker-compose build
    ```

8. Finalmente, ejecutar los contenedores con las imágenes correspondientes, con:

    ```
    docker-compose run -d
    ```
    
    Puede usarse `docker-compose logs` para ver los *logs* de los contenedores

9. Por defecto, el comando anterior lanza un contenedor por cada servicio. Sin embargo,
CDPSfy es una aplicación que se caracteriza por ser **escalable**, y Docker-Compose facilita
mucho esta tarea. Pueden lanzarse varias instancias de servidores *server* y *tracks* con un
comando como el siguiente:

    ```
    docker-compose scale www=2 tracks=4
    ```
    
    La orden anterior configura dos instancias de *server* y 4 instancias de *tracks*.

10. Para que los HAProxy balanceen la carga entre todos los servidores creados, es
necesario volver a lanzar el servicio, en este caso con el comando siguiente:

    ```
    docker-compose run -d --force-recreate
    ```

11. Para parar el escenario, debe utilizarse:

    ```
    docker-compose kill
    ```
