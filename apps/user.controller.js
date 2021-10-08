var mongoose = require('mongoose');
var User = require('./user.model');

exports.update = function(req, res){
    if (!req.body._id){
        res.send({error: 'Bad Request.'});
        return;
    }
    User.findOneAndUpdate({_id: req.body._id}, req.body, {new: true}, function(err, user){
        if(err){
            res.send(err);
        }else{
            res.send(user);
        }
    });
}

exports.get = function(req, res){
    if (!req.body._id){
        res.send({error: 'Bad Request.'});
        return;
    }
    User.findOne({_id: req.body._id}, function(err, user){
        if(err){
            res.send(err);
        }else{
            res.send(user);
        }
    });
}
