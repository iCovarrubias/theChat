'use strict';

angular.module('theChatApp')
  .factory('contactManager', function ($rootScope, $compile, Auth, User) {
    var user = Auth.getCurrentUser();

     /*
      A helper function that returns the index of an object in an array
      params:
        propName: the name of the field used for comparation
        propValue: the value we are matching against
        arr: An array of objects
      returns:
        number - the position of the element in the array or -1 if not found
      example:
        getIndexBy('_id', "55f0ba26fe778bac22e9e2a9", $scope.friendList)
    */
    //returns the position of such id or -1 if it doesn't exist
    function getIndexBy(propName, propValue, arr) {
        var len = arr.length;
        for(var i = 0;  i < len; i++)
        {
            if(arr[i][propName] === propValue)
            {    return i;  }
        }
        return -1;
    }

    /*
      A function that adds unique entries in an array
      parameters:
      1. The entry to be added
      2. array
      3. if the first parameter is an array of objects, this param is mandatory 
          you can use this  parameter to set which property must not be repeated
         if the array is an array of primitives, this parameter is optional

      returns: false if entry already exists
                true if entry was added
    */
    function addToSet(entry, array, property) {
      if(!angular.isArray(array)) {throw new Error('second parameter must be an array'); }

      var idx = -1;
      if(typeof entry === "object") {
        if(property === undefined) { throw new Error('property not set'); }

        //we receive an array of objects
        for(var i = 0; i < array.length; i++) {
          if(array[i][property] === entry[property]) {
            idx = i;
            break;
          }
        }
      } else {
        //we are receiving an array of primitives
        idx = array.indexOf(entry);
      }
      if(idx === -1) { 
        array.push(entry); 
        return true;
      }
      return false;
    }

    /*
      A helper function that looks for an element in an array
      using the _id property and removes it.

      params:
      id: the value to match
      arr: An array of objects which we asume have the _id propety
  
      returns: 
        if found, returns the element removed
        undefined if not found
    */
    function findByIdAndRemove(id, arr){
        var idx = getIndexBy('_id', id, arr);
        if(idx !== -1) {
            return arr.splice(idx, 1);
        }
    }



    // Public API here
    return {
      /*
        returns an array of contacts, 
        param filter: String

        filter = "friends" - Returns friends only
        filter = "groups" - Returns groups only
        filter = none, falsy or other value, returns a concatenation of friends and groups
      */
      getContacts: function (filter) {
        var contacts;
        if(filter === "friends") {
          contacts = user.friends;
        } else if(filter === "groups") {
          contacts = user.groups;
        } else if(user.friends) {
          contacts = user.friends;
          contacts = contacts.concat(user.groups);
        }

        return contacts;
      },

      getFriendRequests: function() {
        return user.friendRequests;
      },

      acceptFriendRequest: function(contact) {
        var myId = user._id;
        var friendId = contact._id;
        return User
          .updateFriendList({id: myId}, {op: 'acceptFriendRequest', friendId: friendId})
          .$promise
          .then(function(res){
            //ok, remove the friend request
            findByIdAndRemove(contact._id, user.friendRequests);//isma, WARN, this can de-sync our app

            if(!res._id){
              // No contact returned by the server, although we had no errors. We can get this
              // response if we are accepting a friend request from a user we already have.
              return contact;
            }
            
            var result = {
              _id: res._id,
              email: res.email,
              name: res.name
            };

            
            addToSet(result, user.friends, "_id");//isma, WARN, this can de-sync our app
            return result;
          })
          .then(function(friend) {
            $rootScope.$broadcast('contact created', contact);
            return friend;
          });
      },

      rejectFriendRequest: function(friend) {
        var myId = user._id;
        var friendId = friend._id;
        return User
          .updateFriendList({id: myId}, {op: 'rejectFriendRequest', friendId: friendId})
          .$promise
          .then(function(data) {
            findByIdAndRemove(friend._id, user.friendRequests);
          });
      },

      onNewFriendRequest: function(data) {
        var res = addToSet(data, user.friendRequests, "_id"); //isma, WARN, this can potentially de-sync our app
        if(res === true ) { 
          $rootScope.$broadcast('new friend request', data);
        }
      },

      onAddedToGroup: function(data) {
        var addToGroup = false;
        for(var i =0; i < user.groups.length; i++) {
          if(data._id === user.groups[i]._id) {
            return; //already a member of such group
          }
        }
        addToSet(data, user.groups, "_id");
        $rootScope.$broadcast('added to group', data);
      },


      //receives a user to be saved contacts
      saveContact: function(contactInfo) {
        var myId = user._id;
        return User
          .updateFriendList({id: myId},{op:'add', email: contactInfo.email})
          .$promise
          .then( function(friendRes) {
            var result = {
              _id: friendRes._id,
              email: friendRes.email,
              name: friendRes.name
            };
            addToSet(result, user.friends, "_id");
            return result;
          }).then( function(friend) {
            $rootScope.$broadcast('contact created', friend);
            return friend;
          });
      },



      //a function that queries the information of a user given an email
      //returns a promise that will receive a user or an array if matching users
      getContactInfoByEmail: function(value) {
        return User.getByEmail({email:value})
          .$promise
          .then(function(resource) {
            var result = {
              _id: resource._id,
              email: resource.email,
              name: resource.name
            };
            return result; 
          });
      },

      //removes a contact from your frined list
      //returns a promise that when resolved receives the userId removed
      removeContact: function(contactInfo) {
        var myId = user._id;
        return  User
          .updateFriendList({id: myId}, {op:'remove', friendId: contactInfo._id})
          .$promise
          .then(function(data) {
            var friendId = data.friendId;
            if(!friendId) { throw new Error('No friendId returned by server'); }

            findByIdAndRemove(friendId, user.friends);
            $rootScope.$broadcast('contact removed', friendId);
            return friendId;
          });
      },

      //leave a group
      leaveGroup: function(group) {
        var myId = user._id;
        return User
          .updateGroups({id: myId}, {op: 'leave', groupId: group._id})
          .$promise
          .then(function(res) {
            return res;
          });
      },

      //group: receives the a group 
      //contacts: a user or array of users to add as members of a group
      //isma, TODO
      addContactsToGroup: function(group, users) {
        var myId = user._id;
        User
            .updateGroups({id: myId}, {op:'addMember', groupId: group._id})
            .$promise
            .then(function(res) {
                //isma TODO, use $rootScope to broadcast the operation result
                //expected result {groupId, [the list of the members added?]}
                console.log('group addMember op SUCCESS', res);
            })
            .catch(function(res) {
                console.error('There was an error with the addMember op: ', res.data.message);
            });
      },

      createGroup: function(groupName, members) {
        var myId = user._id;

        var memberArr = members;

        return User
          .updateGroups({id: myId},{op:'create', name: groupName, members: memberArr })
          .$promise
          .then(function(res) {
              var result = {
                _id: res._id,
                members: res.members,
                name: res.name
              };
              addToSet(result, user.groups, "_id");
              return result;
          })
          .catch(function(res) {
              console.error('There was an error creating group: ', res.data.message);
          })
      },

      //creates a <contact> element
      //creates a new scope
      createContactElement: function(scope, contactInfo) {
        if(!scope) {
          throw new Error('Please provide a scope');
        }

        var contactScope = scope.$new(true);
        contactScope.contact = contactInfo;
        // var contactStr = '<contact contact-info="contact"></contact>';
        var contactStr = '<contact cid="' + contactInfo._id + '" ';
        contactStr += 'contact-info="contact" ';
        if(scope.noCancelBtn) { contactStr += 'no-cancel-btn ';}
        if(scope.noOkBtn) { contactStr += 'no-ok-btn ';}

        contactStr += '></contact>';

        // console.log('compiling contact w:', contactStr);
         //isma TODO: we can re-use the same compile function and just change the scope
        return $compile(contactStr)(contactScope);
      }
    };
  });
