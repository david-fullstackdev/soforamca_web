var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var historySchema = new mongoose.Schema({
    room: {
        type: ObjectId,
        ref: 'rooms',
        required: true,
    },
    user: {
        type: ObjectId,
        ref: 'users',
        required: true,
    },
    message: {
        type: String,
        required: true,
        default: 'Empty Message',
    },
});
