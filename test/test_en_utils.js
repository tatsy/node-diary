'use strict';

var enutils = require('../lib/en-utils.js');

var should = require('should');

describe('en-utils', function() {
  it('ENMLize 1', function() {
    enutils.enmlize('<h2>Hello</h2>').enml.should.equal('<h2>Hello</h2>');
  });

  it('ENMLize 2', function() {
    enutils.enmlize('<hr>').enml.should.equal('<hr />');
  });

  it('Remove id and class 1', function() {
    enutils.removeIdClass('<span class="test">test</span>').should.equal('<span>test</span>');
  });

  it('Remove id and class 2', function() {
    enutils.removeIdClass('<span class="test" id="test">test</span>').should.equal('<span>test</span>');
  });
});
