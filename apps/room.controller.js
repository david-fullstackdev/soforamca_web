var mongoose = require('mongoose');
var Room = require('./room.model');
var User = require('./user.model');
var async = require('async');

exports.register = function (req, res) {
    if (!req.body.roomName) {
        res.send({ error: 'Room Name is undefined.' });
        return;
    }
    if (!req.body.password) {
        res.send({ error: 'Password is undefined.' });
        return;
    }
    var room = new Room(req.body);
    room.password = room.generateHash(req.body.password);
    Room.findOne({ roomName: req.body.roomName }, function (err, result) {
        if (result) {
            res.send({ error: 'exists' });
        } else {
            room.save(function (err) {
                if (err) {
                    res.send({ error: err });
                } else {
                    res.send(room);
                }
            });
        }
    });
}

exports.signin = function (req, res) {
    async.waterfall([
        function (next) {
            if (!req.body.roomName) {
                next('Room Name is undefined.');
            } else if (!req.body.password) {
                next('Password is undefined.');
            } else {
                Room.findOne({ roomName: req.body.roomName }, function (err, result) {
                    if (!result) {
                        next('Room not exists.')
                    } else if (!result.validPassword(req.body.password)) {
                        next('Password incorrect.');
                    } else {
                        next(null, result);
                    }
                });
            }
        },
        function (room, next) {
            if (req.body.userId) {
                User.findById(req.body.userId, function (err, result) {
                    if (err) {
                        next(err);
                    } else if (!result) {
                        next(null, room);
                    } else {
                        res.send({ room: room, user: result });
                    }
                });
            } else {
                next(null, room);
            }
        },
        function (room, next) {
            console.log(room);
            var user = new User({ nickname: room.roomName + "-" + Date.now() % 10000000, room: room._id });
            user.save(function (err) {
                if (err) {
                    next(err);
                } else {
                    res.send({ room: room, user: user });
                }
            });
        }
    ],
        function (err) {
            res.send({ error: err });
        }
    )
}
