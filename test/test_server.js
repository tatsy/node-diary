var request = require('supertest');
var app     = require('../app');

require('should');

describe('routes', function() {
    var url = 'http://localhost:3000';

    before(function(done) {
        done();
    });

    it('Should display index page', function() {
        describe('index', function(done) {
            request(app)
            .get('/')
            .expect(400, done);
        });
    });

    it('Should display editor page', function() {
        describe('edit', function(done) {
            var articleInfo = {
                id: '0000000000',
                title: 'Test article'
            };

            request(app).post('/edit')
            .send(articleInfo)
            .expect(400, done);
        });
    });
});
