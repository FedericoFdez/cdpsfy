var path = require('path');

// Postgres DATABASE_URL = postgres://user:passwd@host:port/database
// SQLITE   DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name	= (url[6] || null);
var user	= (url[2] || null);
var pwd 	= (url[3] || null);
var protocol= (url[1] || null);
var dialect = (url[1] || null);
var port 	= (url[5] || null);
var host	= (url[4] || null);
var storage = process.env.DATABASE_STORAGE;

// Cargar Modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD SQLite o Postgres
var sequelize = new Sequelize(DB_name, user, pwd,
					{	dialect: protocol,
						protocol: protocol,
						port: port,
						host: host,
						storage: storage, // solo SQLITE (.env)
						omitNull: true	  // solo Postgres
					}
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
	