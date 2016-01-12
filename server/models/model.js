var path = require('path');

//Cargar modelo ORM
var Sequelize = require('sequelize');

//Usar BBDD SQLite
var sequelize = new Sequelize(null,null,null, {dialect: "sqlite", storage: "cdpsfy.sqlite"}
				);

//Importar la definicion de la tabla Track en track.js
var Track = sequelize.import(path.join(__dirname,'track'));
exports.Track = Track; //exportar definicion de la tabla Track

//Importar la definicion de la tabla User
var User = sequelize.import(path.join(__dirname, 'user'));
exports.User = User; //exportar la definicion de la tabla User

//Relacion 1 a N entre tablas User y Track
Track.belongsTo(User);
User.hasMany(Track);

//N usuarios siguen a N usuarios
Follows = sequelize.define('Follows');
User.belongsToMany(User, {as: 'Followed', foreignKey:'FollowId',through: 'Follows'});
//User.belongsToMany(User, {as: 'Follower',through: 'Follows'});

exports.Follows= Follows;

sequelize.sync().then(console.log('Base de datos ejecutandose')); 
	