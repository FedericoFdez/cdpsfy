var models = require('../models/model.js');
var needle = require('needle')

var tracksHost = process.env.TRACKS_HOST || "localhost:8000"

exports.autenticar = function(login,password,callback) {
	models.User.find({
		where: {
			username: login
		}
	}).then(function(user) {
		if (user) {
			if (user.verifyPassword(password)) {
				callback(null, user);
			}
			else { callback(new Error('Password erroneo.')); }
		} else { callback(new Error('No existe user=' + login))}
	}).catch(function(error){callback(error)});
};


//GET /user
exports.new = function(req,res) {

	var user = models.User.build( // crea objeto user
		{username: "", password: ""} 
		);
	res.render('user/new', {user: user, errors: []});
};

//POST /user
exports.create = function(req,res) {
	var user = models.User.build({username: req.body['user[username]'], password: req.body['user[password]']
						});
	user
	.validate()
	.then(
		function(err){
			if(err) {
				res.render('user/new', {user: user, errors: err.errors});
			} else {
				user // save: guarda en DB campos username y password de user
				.save()
				.then( function() {
					//Creo carpeta del usuario en el backend
					needle.post(tracksHost + '/users/' + user.id);
					//crea la sesion con el usuario ya autenticado y redirige a /
					req.session.user = {id: user.id, username: user.username};
					res.redirect('/');
				});
			}
		}
	).catch(function(error){next(error)});
};

exports.list = function(req,res) {
	models.User.findAll().then(function(users){
		res.render('users/index', {users: users})
	})

}

exports.show = function(req,res) {
	models.Track.findAll({where: {'UserId': req.params.userId}}).then(function(tracks){
			res.render('users/show', {tracks: tracks});
		})
}

exports.timeline = function(req,res) {
	models.User.find({where: {id: req.session.user.id}}).then(function(user){
		user.getFollowed().then(function(followeds){
			res.render('users/prueba', {followeds: followeds});
		
	    })
	 })
}