var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();

var nasPath = "/mnt/nas/"

app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(express.static(path.join(__dirname, 'public')));

app.listen(8000);

var deleteFolderRecursive = function(path) {
    	if( fs.existsSync(path) ) {
    		fs.readdirSync(path).forEach(function(file,index){
      			var curPath = path + "/" + file;
      			if(fs.lstatSync(curPath).isDirectory()) { // recurse
        			deleteFolderRecursive(curPath);
      			} else { // delete file
        			fs.unlinkSync(curPath);
   			   }
   		    });
    		fs.rmdirSync(path);
  		}
	};


app.get('/', function(req,res){
	res.send('Bienvenido');
})

//Devuelve la canción pedida
app.get('/users/:userId/tracks/:trackId', function(req,res){
	p = "/home/federico/Documents/cdps/cdpsfy/rest_server/" + req.params.userId + "/" + req.params.trackId;
	//p = nasPath + p;
	file = p + ".mp3" //Habrá que seleccionar el nombre del archivo
	console.log(file);
	res.sendFile(file)

});


//Inserta la canción subida
app.post('/users/:userId/tracks/:trackId', function(req,res){
	p = "/home/federico/Documents/cdps/cdpsfy/rest_server/" + req.params.userId + "/" + req.params.trackId;
	//p = nasPath + p;
	file = p + ".mp3" //Habrá que seleccionar el nombre del archivo
	console.log(file);
	console.log(req);
	/*fs.appendFile(file, req.body, function(err){
		if (err) throw err;
	});*/
	res.send("Cancion insertada")

});

//Elimina la canción especificada

app.delete('/users/:userId/tracks/:trackId', function(req,res){
	p = req.params.userId + "/" + req.params.trackId;
	//p = nasPath + p;
	console.log(p);
	fs.unlinkSync(p);
	res.send('Cancion eliminada');

});

//Crea sistema de ficheros para el usuario registrado
app.post('/users/:userId', function(req,res){
	p = req.params.userId;
	//p = pathNas + p
	fs.mkdir(p, function(err){
		if (err) {
			return console.error(err)
		}
	});
	res.send('Directorio creado');
});

//Elimina sistema de ficheros del usuario que se ha dado de baja 

app.delete('/users/:userId', function(req,res){
	p = req.params.userId;
	// p = pathNas + p
	deleteFolderRecursive(p);
	res.send('Eliminado');
});


