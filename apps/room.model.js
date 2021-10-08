var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var roomSchema = new mongoose.Schema({
    roomName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});

roomSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

roomSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('rooms', roomSchema);
