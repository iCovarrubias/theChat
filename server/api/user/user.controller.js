'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

function validationError(res, statusCode) {
  statusCode = statusCode || 422; //422 is unprocessable entity
  return function(err) {
    res.status(statusCode).json(err);
  }
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function respondWith(res, statusCode) {
  statusCode = statusCode || 200;
  return function() {
    res.status(statusCode).end();
  };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.findAsync({}, '-salt -hashedPassword')
    .then(function(users) {
      res.status(200).json(users);
    })
    .catch(handleError(res));
};

/**
 * Creates a new user
 */
exports.create = function(req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.saveAsync()
    .spread(function(user) {
      var token = jwt.sign({ _id: user._id }, config.secrets.session, {
        expiresInMinutes: 60 * 5
      });
      res.json({ token: token });
    })
    .catch(validationError(res));
};

/**
 * Get a single user
 */
exports.show = function(req, res, next) {
  var userId = req.params.id;

  User.findByIdAsync(userId)
    .then(function(user) {
      if (!user) {
        return res.status(404).end();
      }
      res.json(user.profile);
    })
    .catch(function(err) {
      return next(err);
    });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemoveAsync(req.params.id)
    .then(function() {
      res.status(204).end();
    })
    .catch(handleError(res));
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findByIdAsync(userId)
    .then(function(user) {
      if (user.authenticate(oldPass)) {
        user.password = newPass;
        return user.saveAsync()
          .then(function() {
            res.status(204).end();
          })
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;

  User.findOneAsync({ _id: userId }, '-salt -hashedPassword -password')
    .then(function(user) { // don't ever give out the password or salt
      if (!user) {
        return res.status(401).end();
      }
      return user.updateFriends();
    })
    .then(function(user) {
      if(!user) {
        return res.status(401).end(); 
      }
      res.json(user);
    })
    .catch(function(err) {
      return next(err);
    });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};



/**
 * Add friend
 */
exports.addFriend  = function(req, res, next) {
  var email = req.body.email;
  if(!email) {
    return res.status(400).json({message: "email is empty"});
  }
  var user = req.user;

  User.findOneAsync({ email: email }, "email name")
    .then(function(friend) {
      //email not registered
      if(!friend) {
        return res.status(400).json({
          message: "Can't find this user " + email
        });
      }
      
      //contact already exists
      if(user.friends.indexOf(friend._id) != -1)
      {
        //return it like this instead of User.update with $addToSet because 
        //we don't have a callback for the update operation
        return res.status(400).json({
          message: "You've already added this friend " + email
        });
      }

      user.friends.push(friend);
      return user.saveAsync()
        .then(function() {
          //populate the friends
          return user.updateFriends();
        })
        .then(function(user) {
          // req.user = user; //update to the one with populated friends??
          res.status(200).json(friend);            
        })
        .catch(validationError(res));

    }).catch(function(err) {
      return next(err);
    });
};



/*
 * Remove a friend
 */
exports.update = function(req, res, next) {
  var userInfo = req.body;
  console.log('updatingg:' , userInfo);
  
  User.findByIdAndUpdateAsync(userInfo._id, userInfo, {'new': true})
    .then(function(theUser) {
      console.log('onupdate prom', theUser);
    }).catch(validationError(res));
}
