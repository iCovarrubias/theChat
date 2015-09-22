/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/groups              ->  index
 * POST    /api/groups              ->  create
 * GET     /api/groups/:id          ->  show
 * PUT     /api/groups/:id          ->  update
 * DELETE  /api/groups/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Group = require('./group.model');
var User = require('../user/user.model');

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.saveAsync()
      .spread(function(updated) {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.removeAsync()
        .then(function() {
          res.status(204).end();
        });
    }
  };
}

// Gets a list of Groups
exports.index = function(req, res) {
  Group.findAsync()
    .then(responseWithResult(res))
    .catch(handleError(res));
};

// Gets a single Group from the DB
exports.show = function(req, res) {
  Group.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(responseWithResult(res))
    .catch(handleError(res));
};

// Creates a new Group in the DB
exports.create = function(req, res) {
  Group.createAsync(req.body)
    .then(responseWithResult(res, 201))
    .catch(handleError(res));
};

// Updates an existing Group in the DB
exports.update = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Group.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
};

// Deletes a Group from the DB
exports.destroy = function(req, res) {
  Group.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
};


/*
  Creates a new group, to be used with exports.updateGroups
*/
function createGroup(req, res) {
  var user = req.user;
  console.log('creating group');
  Group.createAsync({
    name: req.body.name,
    members: [user]
  })
    .then(handleEntityNotFound(res))
    .then(function(group){
      console.log('created', group);
      user.addToGroup(group);
      return user.saveAsync().then(function(theuser){
       console.log('saved the user', theuser);
       return group;
     });
    }).then(function(group) {
      console.log('responding with', group);
      return group;
    })
    .then(responseWithResult(res, 201))
    .catch(handleError(res));
}

function addGroupMember(req, res) {
  console.log('adding group member', groupId);
  var user = req.user;
  var groupId = req.body.group._id;
  Group.findByIdAsync(groupId)
    .then(handleEntityNotFound(res))
    .then(function(group){
      user.addToGroup(group);
      return user.saveAsync();
    }).then(function(aUser) {
      console.log('addGroupMember aUser:', aUser);
      // if(group.addMember(req.body.memeberId) !== -1) {
        // res.status(200).end();
      // } else {
      //   res.status(204).end();
      // }
      next();
    })
    .catch(handleError(res));
}

function leaveGroup(req, res) {
  var user = req.user;
  Group.findByIdAsync(req.body.groupId)
    .then(handleEntityNotFound(res))
    .then(function(group) {
      group.leave(user);
      return group.saveAsync();
    }).then(function(group) {
      console.log('leaveGroup', group);
      user.leaveGroup();
      return user.saveAsync();
    }).then(function(user) {
      console.log('leaveGroup 2', user);
      res.status(200).end();
    }).catch(handleError(res));
}
/*
  Deals with the many operations related to groups, Create, add members, leave group, rename group
  This is accessed through the api/users/:id/updateGroups route, where :id is the 
  user executing the action
*/
exports.updateGroups = function(req, res) {
  var op = req.body.op; 
  
  if(op === 'create') {
    createGroup(req, res);
  } else if(op === 'addMember') {
    addGroupMemeber(req, res);
  } else if(op === 'leaveGroup') {
    leaveGroup(req, res);
  } else if(op === 'rename') {

  } else {
  //error
    return handleError(res,400)({
      message: "op parameter is missing, expected op=create|addMember|leaveGroup|rename"
    });
  }
};
