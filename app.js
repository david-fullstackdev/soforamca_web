var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./apps/config');
var cors = require('cors');
var mongoose = require('mongoose');
mongoose.connection.openUri(config.dburl);

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var roomRouter = require('./apps/room.route');
var userRouter = require('./apps/user.route');
var historyRouter = require('./apps/history.route');

app.use('/room', roomRouter);
app.use('/user', userRouter);
app.use('/history', historyRouter);
app.use('/about-us', function(req, res){
    res.sendFile(path.resolve(__dirname, 'apps', 'about.html'));
})
app.get('*', function(req, res){
    res.sendFile(path.resolve(__dirname, 'apps', 'index.html'));
});




module.exports = app;
