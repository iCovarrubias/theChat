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
 * Add friend, to be used with updateFriendList
 */
function addFriend(req, res, next) {
  var email = req.body.email;
  if(!email) {
    return res.status(400).json({message: "email is empty"});
  }
  var user = req.user;

  User.findOneAsync({ email: email }, "email name friendRequests")
    .then(function(friend) {
      //email not registered
      if(!friend) {
        return res.status(400).json({
          message: "Can't find this user " + email
        });
      }
      
      //contact already exists
      if(user.friends.indexOf(friend._id) !== -1)
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
          //save friend request on friend
          // if(!friend.friendRequests)
          //   friend.friendRequests = []; //for those users without this field
          //update: all of users have such field, we'll leave this code here as an example
          //of what to do if a new field is added and the current user doesn't have such field
          friend.friendRequests.push(user);
          return friend.saveAsync();
        })
        // .then(function() {
        //   console.log('saved friend');
        //   //populate the friends, totally unnecessary to populate?
        //   return user.populateFriends();
        // })
        .then(function() {
          var response = {
            _id:    friend._id,
            email:  friend.email,
            name:   friend.name
          };
          res.status(200).json(response);            
        })
        .catch(validationError(res));

    }).catch(function(err) {
      return next(err);
    });
}

/**
 * Remove friend, to be used with updateFriendList
 */
function removeFriend(req, res, next) {
  var friendId = req.body.friendId;
  var user = req.user;

  var idx = user.friends.indexOf(friendId);
  if(idx === -1) {
    res.status(400).json({message: "Friend already removed"});
  }
  user.friends.splice(idx, 1);
  user.saveAsync()
    .then(function() {
      return User.findOneAsync({ _id: friendId }, "email friendRequests");
    })
    .then(function(friend) {
      // Remove myself from friend's friendRequests list
      if(!friend) {
        //the user you are removing has already erased his account
        console.log("Can't remove from friendRequests, but we are safe");
        return;
      }
      var idx = friend.friendRequests.indexOf(user._id);
      if(idx !== -1) {
        friend.friendRequests.splice(idx, 1);
        return friend.saveAsync();
      }
    })
    .then(function(){
      // Once I've removed the user answer to the client,
      res.status(204).end();
    })
    .catch(validationError(res));
}


/*
  Accept friend request, to be used with updateFriendList
*/
function acceptFriendRequest(req, res, next) {
  var id = req.body.friendId;
  var user = req.user;
  
  User.findByIdAsync(id, "_id email name")
    .then(function(friend){
      if(!friend) {
        //the user probably erased his account
        throw new Error({message: "Can't find user"});
      }
      //remove from friendRequests
      var idx = user.friendRequests.indexOf(id);
      if(idx !== -1) {
        user.friendRequests.splice(idx, 1);
      }

      //add to my friends
      user.friends.push(id);
      return user.saveAsync().then(function(){
        return friend;
      });
    })
    .then(function(friend) {
        // console.log('Friend Reqest correctly accepted', friend);
        //only return "_id email name"
        return res.status(200).json(friend);
    })
    .catch(function(error){
      validationError(res)
    });

}

/*
  Rejects a friend request, to be user with updateFriendList
*/
function rejectFriendRequest(req, res, next) {
  var friendId = req.body.friendId;
  if(!friendId) {
    return validationError(res,400)({
      message: "Invalid request, you must send friendId"
    });
  }
  var user = req.user;
  
  var idx = user.friendRequests.indexOf(friendId);
  if(idx !== -1){
    user.friendRequests.splice(idx, 1);
    return user.saveAsync()
      .then(function(){
        res.status(200).json({friendId: friendId});
      });
  } else {
    return res.status(204).end();
  }

}


/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.findAsync({}, '-salt -hashedPassword -password')
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
      return user.populateFriends();
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



/*
 * Update the whole model
 */
exports.update = function(req, res, next) {
  var userInfo = req.body;
  
  //the 'new' parameter sends the upated information in the callback 
  User.findByIdAndUpdateAsync(userInfo._id, userInfo, {'new': true}) 
    .then(function(theUser) {
      req.status(200).end();
    }).catch(validationError(res));
}


/*
 *
 */
exports.updateFriendList = function(req, res, next) {
  var op = req.body.op;

  if(op === "add") {
    addFriend(req, res, next);
  } else if(op === "remove") {
    removeFriend(req, res, next);
  } else if(op === "acceptFriendRequest" )
  {
    acceptFriendRequest(req, res, next);
  } else if(op === "rejectFriendRequest"){
    rejectFriendRequest(req, res, next);
  } else {
    //error
    return validationError(res,400)({
      message: "op parameter is missing, expected op='add'|'remove'"
    });
  }
}


