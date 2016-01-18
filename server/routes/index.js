var express = require('express');
var router = express.Router();
var multer  = require('multer');

var tracks_dir = process.env.TRACKS_DIR || './media/';

var trackController = require('../controllers/track_controller');
var sessionController = require('../controllers/session_controller');
var userController = require('../controllers/user_controller');
var followController = require('../controllers/follow_controller');
//Pagina de inicio
router.get('/', function(req, res) {
  res.render('index');
});

//Definicion de rutas de sesion
router.get('/login', sessionController.new); //formulario login
router.post('/login', sessionController.create) //crear sesion
router.get('/logout', sessionController.destroy) //destruir sesion

//Definicion de rutas de cuenta
router.get('/user', userController.new); //Formulario login
router.post('/user',userController.create); //Registrar usuario
router.get('/user/:userId/delete', userController.destroy) //Eliminar cuenta




//Definicion de rutas de tracks
router.get('/tracks', trackController.list);

router.get('/tracks/new', sessionController.loginRequired, trackController.new);

router.get('/tracks/:trackId', trackController.show);

router.post('/tracks', multer({inMemory: true}), trackController.validate, trackController.create, trackController.imageUpload);

router.delete('/tracks/:trackId', trackController.destroy);

//Definicion de rutas de usuarios
router.get('/users', userController.list);
router.get('/users/:userId', userController.show)
router.get('/user/:userId/timeline', userController.timeline)

//Definicion de rutas de follow
router.put('/user/:userId', followController.follow);
//router.delete('/user/:userId', followController.unfollow);

module.exports = router;

