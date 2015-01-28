var enutils = require('../lib/en-utils.js');

var should = require('should');

describe('en-utils', function() {
    it('General test', function() {
        enutils.ENMLize('<h2>Hello</h2>').enml.should.equal('<h2>Hello</h2>');
        enutils.ENMLize('<hr>').enml.should.equal('<hr />');
    });
});
