var express = require('express');
var router = express.Router();
var roomController = require('./room.controller');

router.post('/signin', roomController.signin);
router.post('/register', roomController.register);

module.exports = router;