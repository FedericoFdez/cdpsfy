//Definicion del modelo de track

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Track',
			{ name: DataTypes.STRING,
			  url: DataTypes.STRING,
			  urlImage: "",
			});
			
}