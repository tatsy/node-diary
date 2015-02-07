'use strict';

var request = require('supertest');
var app     = require('../app');

require('should');

describe('routes', function() {
  before(function(done) {
    done();
  });

  it('Should display index page', function(done) {
    request(app)
    .get('/')
    .set('Accept', 'application/json')
    .expect(200)
    .end(function(err) {
      if (err) return done(err);
      done();
    });
  });

  it('Should display editor page', function(done) {
    request(app)
    .post('/edit')
    .type('form')
    .field('from', 'index')
    .field('title', 'Example Article')
    .field('articleId', 'article_example')
    .expect(200)
    .end(function(err) {
      if (err) return done(err);
      done();
    });
  });
});
