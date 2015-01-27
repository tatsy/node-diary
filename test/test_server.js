var request = require('supertest');
var server  = require('../server');

require('should');

describe('routes', function() {
    var url = 'http://localhost:3000';

    before(function(done) {
        done();
    });

    it('Should display index page', function() {
        describe('index', function() {
            var articles = {};

            request(server)
            .get('/')
            .send(articles)
            .end(function(err, res) {
                if(err) {
                    throw err;
                }
                res.should.have.status(400);
                done();
            });
        });
    });

    /*
    it('Should display editor page', function() {
        describe('edit', function() {
            var articleInfo = {
                id: '0000000000',
                title: 'Test article'.

            };

            request(server).post('/edit')
            .send(articleInfo)
            .end(function(err, res) {
                if(err) {
                    throw err;
                }
                res.should.have.status(400);
                done();
            });
        });
    });
    */
});
