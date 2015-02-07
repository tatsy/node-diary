'use strict';

var mdv = require('../lib/md-video');

var should = require('should');

describe('md-video', function() {
  it('No size specification', function() {
    mdv.marked('$[](movie.mp4)').should.equal('<video src="movie.mp4" controls></video>');
  });

  it('Movie text is specified', function() {
    mdv.marked('$[Movie](movie.mp4)').should.equal('<video src="movie.mp4" controls>Movie</video>');
  });

  it('Only width is specified', function() {
    mdv.marked('$[](movie.mp4 =100x)').should.equal('<video src="movie.mp4" width="100" controls></video>');
  });

  it('Only height is specified', function() {
    mdv.marked('$[](movie.mp4 =x200)').should.equal('<video src="movie.mp4" height="200" controls></video>');
  });

  it('Both width and height are specified', function() {
    mdv.marked('$[](movie.mp4 =100x200)').should
    .equal('<video src="movie.mp4" width="100" height="200" controls></video>');
  });
});
