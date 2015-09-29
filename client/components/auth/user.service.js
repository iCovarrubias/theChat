'use strict';

angular.module('theChatApp')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      },
      getByEmail: {
        url: '/api/users/getByEmail',
        method: 'GET',
        params: {
          // email: '@email'
        }
      },
      updateFriendList: {
        method: 'PUT',
        params: {
          controller: 'updateFriendList'            
        }
      },
      updateGroups: {
        method: 'PUT',
        params: {
          controller: 'updateGroups'
        }
      },
      update: {
        method: 'PUT',
        params: {
          controller: 'update'
        }
      }
    });
  });
