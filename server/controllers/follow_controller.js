var model = require('../models/model.js')
exports.follow = function(req,res){
	model.User.find({where: {id: req.session.user.id}}).then(function(user){
		console.log(req.session.user);
		user.addFollowed(req.params.userId);
	}).then(res.redirect('/'))
	
}