const antiSpam = require('socket-anti-spam')
const shortid = require('shortid')
const functions = require('./functions');
const User = require('./user.model');
const Room = require('./room.model');
const History = require('./history.model');
const async = require('async');
var request = require('request');

module.exports = function (socket_io) {

    // antiSpam.init({
    //     banTime: 30,         // Ban time in minutes 
    //     kickThreshold: 3,          // User gets kicked after this many spam score 
    //     kickTimesBeforeBan: 3,          // User gets banned after this many kicks 
    //     banning: true,       // Uses temp IP banning after kickTimesBeforeBan 
    //     heartBeatStale: 40,         // Removes a heartbeat after this many seconds 
    //     heartBeatCheck: 4,          // Checks a heartbeat per this many seconds 
    //     io: socket_io,  // Bind the socket.io variable 
    // });

    var users = [];

    // Define connection
    socket_io.sockets.on('connection', function (socket) {
        // Identify user
        var userId = 'user-' + shortid.generate();
        const identity = functions.identify(socket);
        var roomId = undefined;

        // Add user
        var userInfo = {
            _id: userId,
            identity: identity,
            nickname: identity,
            sharedLocation: false,
            message: ''
        };

        socket.on('user connect', function (data) {
            console.log('userConnect', data);
            roomId = data.roomId;
            userId = data.userId;
            if (!roomId) {
                socket.disconnect('bad connection.');
                return;
            }
            async.waterfall([
                function (next) {
                    Room.findById(roomId, function (err, room) {
                        if (err) {
                            next(err)
                        } else if (!room) {
                            next(err)
                        } else {
                            if (!userId) {
                                var user = new User({ nickname: userId, room: roomId });
                                user.save(function (err) {
                                    userId = user._id;
                                    userInfo._id = user._id;
                                    userInfo.nickname = user.nickname;
                                    next(err);
                                });
                            } else {
                                console.log("connecting ---- userid = " + userId);
                                User.findById(userId, function (err, user) {
                                    console.log("connecting ----- user = " + JSON.stringify(user));
                                    userInfo._id = user._id;
                                    userInfo.nickname = user.nickname;
                                    console.log("room Comparison: " + user.room + "----" + roomId);
                                    if (user.room == roomId) {
                                        userInfo.message = user.message
                                    }

                                    console.log("connecting ----- userInfo = " + JSON.stringify(userInfo));
                                    next(err);
                                });
                            }
                        }
                    });
                },
            ], function (err) {
                if (err) {
                    socket_io.emit('server error', { roomId: roomId, userId: userId, error: err });
                    return
                }
                users[roomId] = users[roomId] || {};

                
                if (userInfo.message == '') {
                    users[roomId][userId] = {
                        message: false,
                        userInfo: userInfo,
                    }
                } else {
                    users[roomId][userId] = {
                        message: {message: userInfo.message},
                        userInfo: userInfo,
                    }
                }

                console.log(users[roomId]);
                
                // Update status
                socket_io.emit('user update', {
                    roomId: roomId,
                    userId: userId,
                    users: users[roomId],
                })

            });
        });
        // Change nickname
        socket.on('change nick', function (nickname) {
            const validNick = !(nickname.match(/[^A-Za-z0-9_]/))
            const userInfo = users[roomId][userId].userInfo || {}
            const hasuserId = (userInfo._id)

            if (hasuserId) {
                if (validNick) {
                    User.findOneAndUpdate({ _id: userInfo._id }, { nickname: nickname }, { new: true }, function (err, user) {
                        if (err) {
                            socket.emit('server error', { roomId: roomId, userId: userId, error: 'nickchange_server_error' })
                        } else {
                            users[roomId][userId].userInfo = user;
                            socket.emit('user update', { roomId: roomId, userId: userId, users: users[user.roomId] })
                        }
                    });
                } else {
                    socket.emit('server error', { roomId: roomId, userId: userId, error: 'nickchange_error_invalid_nick' })
                }
            } else {
                socket.emit('server error', { roomId: roomId, userId: userId, error: 'nickchange_error_no_userId' })
            }
        })

        // share position
        socket.on('share position', function (location) {
            if (typeof location.lat !== 'number' || typeof location.lng !== 'number') return;
            console.log('Share Location', location);

            userInfo.sharedLocation = true;
            userInfo.lat = location.lat;
            userInfo.lng = location.lng;
            
            console.log(users[roomId]);

            socket_io.emit('share position', {
                roomId: roomId,
                userId: userId,
                location: location,
                message: users[roomId][userId].message
            })
        })
        socket.on('unshare position', function () {

            userInfo.sharedLocation = false;

            socket_io.emit('unshare position', {
                roomId: roomId,
                userId: userId,
            })
        })
        // Define incoming message event
        socket.on('incoming message', function (obj) {
            if (typeof obj.message === 'string' && obj.message.length < 101) {

                // Define message
                obj.message = obj.message.replace(/ +(?= )/g, '')

                if (!users[roomId][userId]) return;
                users[roomId][userId].message = obj;
                socket_io.emit('new message', {
                    roomId: roomId,
                    userId: userId,
                    obj: obj,
                })

                User.findOneAndUpdate({ _id: userId }, { message: obj.message }, { new: true }, function (err, user) {
                    if (err) {
                        console.log("failed to save message to db.");
                    } else {
                        console.log("saved message to db: " + JSON.stringify(user));
                    }
                });

                console.log("roomId = " + roomId);
                User.find({room: roomId}, function (err, users) {
                    console.log("--------------------------------------");
                    if (!err) {
                        var devices = [];
                        for (var i = 0; i < users.length; i++) {
                            if (userId == users[i]._id) continue;
                            if (users[i].token != "" && users[i].token != null) {
                                if(devices.indexOf(users[i].token) == -1){
                                    devices.push(users[i].token);
                                }
                            }
                        }
                        console.log("tokens = " + JSON.stringify(devices));
                        sendMessageToUser(devices, obj.message);
                    }
                });
            }
        })

        // Define disconnect event
        socket.on('disconnect', function (message) {
            if (!roomId || !userId) return;

            if (users[roomId][userId]) {
                delete users[roomId][userId];
            }

            // Emit event
            socket_io.emit('user update', {
                roomId: roomId,
                userId: userId,
                users: users[roomId],
            })
        })

    })

    function sendMessageToUser(deviceIds, message) {
        request({
            url: 'https://fcm.googleapis.com/fcm/send',
            method: 'POST',
            headers: {
                'Content-Type': ' application/json',
                'Authorization': 'key=AIzaSyCBl9Us1bDLspr4BA7qzye0hmSAMiZ9pFo',
                'Sender': 'id=541116508504'
            },
            body: JSON.stringify({
                "data": {
                    "title": "şoför amca",
                    "body": message
                },
                "notification": {
                    "title": "şoför amca",
                    "body": message,
                    "content_available": true
                },
                "registration_ids": deviceIds
            })
        }, function (error, response, body) {
            if (error) {
                console.error(error, response, body);
            }
            else if (response.statusCode >= 400) {
                console.error('HTTP Error: ' + response.statusCode + ' - ' + response.statusMessage + '\n' + body);
            }
            else {
                console.log('Done!')
            }
        });
    }
}
