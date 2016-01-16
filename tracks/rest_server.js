var express = require('express');
var path = require('path');
var fs = require('fs');
var logger = require('morgan');
var multer = require('multer')

var app = express();

var savePath = process.env.NASPATH || __dirname
var tmpPath = process.env.TMPPATH || './.tmp/'

//var logStream = fs.createWriteStream(__dirname + '/tracks-cdpsfy.log', {flags: 'a'})
//app.use(logger('dev', {stream: logStream}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(multer({ dest: tmpPath }).single('uploaded_track'));


var port = parseInt(process.env.PORT || '8000', 10);
app.listen(port);

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
	res.send('Bienvenido\n');
})

//Devuelve la canción pedida
app.get('/users/:userId/tracks/:trackId', function(req,res){
	console.log("Getting track ", req.params.trackId)
	p = savePath + "/" + req.params.userId + "/" + req.params.trackId;
	file = p + ".mp3" //Habrá que seleccionar el nombre del archivo
	console.log(file);
	res.sendFile(file)

});

//Devuelve la carátula pedida
app.get('/users/:userId/images/:imageId', function(req,res){
	console.log("Getting track ", req.params.imageId)
	p = savePath + "/" + req.params.userId + "/" + req.params.imageId;
	file = p + ".png" //Habrá que seleccionar el nombre del archivo
	console.log(file);
	res.sendFile(file)

});

//Inserta la canción subida
app.post('/users/:userId/tracks/:trackId', function(req,res){
	console.log(req.file);
	// ubicacion temporal del archivo
	var tmp_path = req.file.path;
	// ubicacion destino del archivo
	var target_path = savePath + "/" + req.params.userId 
		+ "/" + req.file.originalname;
	console.log(target_path)
	// mover el archivo a la ubicación destino
	fs.rename(tmp_path, target_path, function(err) {
		if (err) throw err;
		// borrar el archivo temporal
		fs.unlink(tmp_path, function() {
			if (err) throw err;
		});
	});

    res.send("Cancion insertada");
});

//Inserta la imagen subida
app.post('/users/:userId/images/:trackId', function(req,res){
	// ubicacion temporal del archivo
	var tmp_path = req.file.path;
	// ubicacion destino del archivo
	var target_path = savePath + "/" + req.params.userId 
		+ "/" + req.file.originalname;
	console.log(target_path)
	// mover el archivo a la ubicación destino
	fs.rename(tmp_path, target_path, function(err) {
		if (err) throw err;
		// borrar el archivo temporal
		fs.unlink(tmp_path, function() {
			if (err) throw err;
		});
	});

    res.send("Cancion insertada");
});

//Elimina la canción especificada
app.delete('/users/:userId/tracks/:trackId', function(req,res){
	console.log("Delete");
	p = savePath + "/" + req.params.userId + "/" + req.params.trackId + ".mp3"; 
	console.log(p);
	fs.unlinkSync(p);
	res.send('Cancion eliminada');

});

//Crea sistema de ficheros para el usuario registrado
app.post('/users/:userId', function(req,res){
	p = savePath + "/" + req.params.userId;
	fs.mkdir(p, function(err){
		if (err) {
			return console.error(err)
		}
	});
	res.send('Directorio creado');
});

//Elimina sistema de ficheros del usuario que se ha dado de baja
app.delete('/users/:userId', function(req,res){
	p = savePath + "/" + req.params.userId;
	deleteFolderRecursive(p);
	res.send('Eliminado');
});
