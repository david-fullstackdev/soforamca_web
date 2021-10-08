var mongoose = require('mongoose');
var Room = require('./room.model');
var History = require('./history.model');

exports.get = function(req, res){
    if (!req.body.roomId){
        res.send({error: 'Bad Request.'});
        return;
    }
    var query = req.body;
    var skip = req.body.skip || 0;
    History.find(query).sort([['_id', 'descending']]).skip(skip).limit(100).populate('room').populate('user').exec(function(err, histories){
        if (err){
            res.send({error: err});
        }else{
            res.send(histories);
        }
    });
}