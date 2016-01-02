var path = require('path');

//Cargar modelo ORM
var Sequelize = require('sequelize');

//Usar BBDD SQLite
var sequelize = new Sequelize(null,null,null, {dialect: "sqlite", storage: "cdpsfy.sqlite"}
				);

//Importar la definicion de la tabla Track en track.js
var Track = sequelize.import(path.join(__dirname,'track'));
exports.Track = Track; //exportar definicion de la tabla Track

sequelize.sync().then(console.log('Base de datos inicializada')); 
	