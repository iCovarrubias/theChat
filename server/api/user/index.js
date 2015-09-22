'use strict';

var express = require('express');
var controller = require('./user.controller');
var groupController = require('./../group/group.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

//auto generated routes
router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);

//custom routes
router.put('/:id/update', auth.isAuthenticated(), controller.update);
router.put('/:id/updateFriendList', auth.isAuthenticated(), controller.updateFriendList);
router.put('/:id/updateGroups', auth.isAuthenticated(), groupController.updateGroups);

module.exports = router;
