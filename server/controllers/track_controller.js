var fs = require('fs');
var track_model = require('./../models/track');
var http = require('http');

var querystring = require('querystring');

var tracksHost = "localhost"

// Devuelve una lista de las canciones disponibles y sus metadatos
exports.list = function (req, res) {
	var tracks = track_model.tracks;
	res.render('tracks/index', {tracks: tracks});
};

// Devuelve la vista del formulario para subir una nueva canción
exports.new = function (req, res) {
	res.render('tracks/new');
};

// Devuelve la vista de reproducción de una canción.
// El campo track.url contiene la url donde se encuentra el fichero de audio
exports.show = function (req, res) {
	var track = track_model.tracks[req.params.trackId];
	track.id = req.params.trackId;
	res.render('tracks/show', {track: track});
};

// Escribe una nueva canción en el registro de canciones.
exports.create = function (req, res) {
	var track = req.files.track;
	console.log('Nuevo fichero de audio. Datos: ', track);
	var id = track.name.split('.')[0];
	var name = track.originalname.split('.')[0];

	// Escritura del fichero de audio en tracks.cdpsfy.es

	var post_data = querystring.stringify({
		'foo' : 'bar'
	});


	var post_options = {
		host: tracksHost,
		port: '8000',
		path: '/users/user0/tracks/' + id,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(post_data)
		}
	};
	var upload_req = http.request(post_options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log('Response: ' + chunk);
		});
	});

	// post the data
	upload_req.write(post_data);
	upload_req.end();

	// Esta url debe ser la correspondiente al nuevo fichero en tracks.cdpsfy.es
	var url = tracksHost + ':8000/users/user0/tracks/' + id;

	// Escribe los metadatos de la nueva canción en el registro.
	track_model.tracks[id] = {
		name: name,
		url: url
	};

	res.redirect('/tracks');
};

// Borra una canción (trackId) del registro de canciones 
// TODO:
// - Eliminar en tracks.cdpsfy.es el fichero de audio correspondiente a trackId
exports.destroy = function (req, res) {
	var trackId = req.params.trackId;

	// Aquí debe implementarse el borrado del fichero de audio indetificado por trackId en tracks.cdpsfy.es

	// Borra la entrada del registro de datos
	delete track_model.tracks[trackId];
	res.redirect('/tracks');
};