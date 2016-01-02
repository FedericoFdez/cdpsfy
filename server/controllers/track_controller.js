var fs = require('fs');
//var track_model = require('./../models/track');
var track_model = require('../models/model');
var http = require('http');
var needle = require('needle')

var tracksHost = "localhost"

// Devuelve una lista de las canciones disponibles y sus metadatos
exports.list = function (req, res) {
	track_model.Track.findAll().then(function(tracks){
		res.render('tracks/index', {tracks: tracks})
	})
	//var tracks = track_model.tracks;
	//res.render('tracks/index', {tracks: tracks});
};

// Devuelve la vista del formulario para subir una nueva canción
exports.new = function (req, res) {
	res.render('tracks/new');
};

// Devuelve la vista de reproducción de una canción.
// El campo track.url contiene la url donde se encuentra el fichero de audio
exports.show = function (req, res) {
	track_model.Track.find({where: {'id': req.params.trackId}}).then(function(track){
		//track.id = req.params.trackId;
		//print(track.id)
		res.render('tracks/show', {track: track});
	})


	//var track = track_model.tracks[req.params.trackId];
	//track.id = req.params.trackId;
	//res.render('tracks/show', {track: track});
};

// Escribe una nueva canción en el registro de canciones.
exports.create = function (req, res) {
	var track = req.files.track;
	console.log('Nuevo fichero de audio. Datos: ', track);
	var id = track.name.split('.')[0];
	var name = track.originalname.split('.')[0];

	// Escritura del fichero de audio en tracks.cdpsfy.es
	var data = {
		uploaded_track: { buffer: track.buffer, filename: track.name, content_type: 'audio/mp3' }
	}
	/*
	needle.post('localhost:8000/users/user0/tracks/' + id, 
		{ uploaded_track: { 
			buffer: track.buffer, 
			filename: track.name, 
			content_type: 'audio/mp3' } },
		{ multipart: true },
		function(err,result) {
			console.log("result", result.body);
		}
	);

	// Esta url debe ser la correspondiente al nuevo fichero en tracks.cdpsfy.es
	var url = 'http://' + tracksHost + ':8000/users/user0/tracks/' + id;
	*/
	// Escribe los metadatos de la nueva canción en el registro.
	//track_model.tracks[id] = {
	//	name: name,
	//	url: url
	//};
	track_model.Track.build( { id: parseInt(id), name: name, url: '/media/Dubstep.mp3'
						}).save().then(res.redirect('/tracks'));

	//console.log(track_model.tracks[id]);

	
};

// Borra una canción (trackId) del registro de canciones 
exports.destroy = function (req, res) {
	var trackId = req.params.trackId
	// Borrado del fichero en tracks.cdpsfy.es
	needle.delete('localhost:8000/users/user0/tracks/' + trackId,
		null,
		function(err, result) {
			console.log("result", result.body);
		}
	);

	// Borra la entrada del registro de datos
	delete track_model.tracks[trackId];
	res.redirect('/tracks');
};