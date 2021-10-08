var express = require('express');
var router = express.Router();
var historyController = require('./history.controller');

router.post('/get', historyController.get);

module.exports = router;