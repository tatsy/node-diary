var mdv = require('../lib/md-video');

var should = require('should');

describe('md-video', function() {
    it('format', function() {
        mdv.marked('$[](movie.mp4)').should.equal('<video src="movie.mp4" controls></video>');
    });

    it('format', function() {
        mdv.marked('$[](movie.mp4 =100x)').should.equal('<video src="movie.mp4" width="100" controls></video>');
    });

    it('format', function() {
        mdv.marked('$[](movie.mp4 =x200)').should.equal('<video src="movie.mp4" height="200" controls></video>');
    });

    it('format', function() {
        mdv.marked('$[](movie.mp4 =100x200)').should.equal('<video src="movie.mp4" width="100" height="200" controls></video>');
    });
});
