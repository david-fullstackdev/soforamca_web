var express = require('express');
var router = express.Router();
var userController = require('./user.controller');

router.post('/update', userController.update);
router.post('/get', userController.get);

module.exports = router;