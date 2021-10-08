var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.ObjectId;

var userSchema = new mongoose.Schema({
    nickname: {
        type: String,
        required: true,
    },
    room: {
        type: ObjectId,
        required: true,
        ref: 'rooms',
    },
    lat: {
        type: Number,
        default: 0,
    },
    lng: {
        type: Number,
        default: 0,
    },
    sharedLocation: {
        type: Boolean,
        default: false,
    },
    message: {
        type: String,
        default: '',
    },
    token: {
        type: String,
        default: '',
    }
});

module.exports = mongoose.model('users', userSchema);