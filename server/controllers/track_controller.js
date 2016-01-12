var fs = require('fs');
var track_model = require('../models/model');
var http = require('http');
var needle = require('needle')

var tracksHost = "localhost"

// Devuelve una lista de las canciones disponibles y sus metadatos
exports.list = function (req, res) {
	track_model.Track.findAll().then(function(tracks){
		for (var t in tracks){
			track_model.User.find({where: {'id': tracks[t].UserId}}).then(function(user){
				console.log(user.username);
				tracks[t].userName = user.username;
			})
		}
		res.render('tracks/index', {tracks: tracks});
	})
};

// Devuelve la vista del formulario para subir una nueva canción
exports.new = function (req, res) {
	res.render('tracks/new');
};

// Devuelve la vista de reproducción de una canción.
// El campo track.url contiene la url donde se encuentra el fichero de audio
exports.show = function (req, res) {
	track_model.Track.find({where: {'id': req.params.trackId}}).then(function(track){
		track_model.User.find({where: {'id': track.UserId}}).then(function(user){
			res.render('tracks/show', {track: track, user:user});
		})
		
	})

};

// Escribe una nueva canción en el registro de canciones.
exports.create = function (req, res) {
	var track = req.files.track;
	console.log('Nuevo fichero de audio. Datos: ', track);
	var id = track.name.split('.')[0];
	var name = track.originalname.split('.')[0];
	userId = req.session.user.id;
	// Escritura del fichero de audio en tracks.cdpsfy.es
	var data = {
		uploaded_track: { buffer: track.buffer, filename: track.name, content_type: 'audio/mp3' }
	}
	
	needle.post('localhost:8000/users/' + userId + '/tracks/' + id, 
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
	var url = 'http://' + tracksHost + ':8000/users/' + userId + '/tracks/' + id;
	
	// Escribe los metadatos de la nueva canción en el registro.

	track_model.Track.build( {name: name, url: url, UserId: req.session.user.id
						}).save().then(res.redirect('/tracks'));

	

	
};

// Borra una canción (trackId) del registro de canciones 
exports.destroy = function (req, res) {
	var trackId = req.params.trackId
	console.log("TrackId:" + trackId)
	track_model.Track.find({where: {'id': trackId}}).then(function(track){
		// Borrado del fichero en tracks.cdpsfy.es
		console.log(track.url);
		needle.delete(track.url,
			null,
			function(err, result) {
				console.log("result", result.body);
			}
		);
	// Borra la entrada del registro de datos
	}).then(function() {
		track_model.Track.destroy({where: {'id': trackId}}).then(res.redirect('/tracks'));
	});
};

