'use strict';

var app = require('../..');
var request = require('supertest');

var newGroup;

describe('Group API:', function() {

  describe('GET /api/groups', function() {
    var groups;

    beforeEach(function(done) {
      request(app)
        .get('/api/groups')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          groups = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(groups).to.be.instanceOf(Array);
    });

  });

  describe('POST /api/groups', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/groups')
        .send({
          name: 'New Group',
          info: 'This is the brand new group!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          newGroup = res.body;
          done();
        });
    });

    it('should respond with the newly created group', function() {
      expect(newGroup.name).to.equal('New Group');
      expect(newGroup.info).to.equal('This is the brand new group!!!');
    });

  });

  describe('GET /api/groups/:id', function() {
    var group;

    beforeEach(function(done) {
      request(app)
        .get('/api/groups/' + newGroup._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          group = res.body;
          done();
        });
    });

    afterEach(function() {
      group = {};
    });

    it('should respond with the requested group', function() {
      expect(group.name).to.equal('New Group');
      expect(group.info).to.equal('This is the brand new group!!!');
    });

  });

  describe('PUT /api/groups/:id', function() {
    var updatedGroup

    beforeEach(function(done) {
      request(app)
        .put('/api/groups/' + newGroup._id)
        .send({
          name: 'Updated Group',
          info: 'This is the updated group!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedGroup = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedGroup = {};
    });

    it('should respond with the updated group', function() {
      expect(updatedGroup.name).to.equal('Updated Group');
      expect(updatedGroup.info).to.equal('This is the updated group!!!');
    });

  });

  describe('DELETE /api/groups/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/groups/' + newGroup._id)
        .expect(204)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when group does not exist', function(done) {
      request(app)
        .delete('/api/groups/' + newGroup._id)
        .expect(404)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
