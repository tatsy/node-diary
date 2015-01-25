var df = require('../lib/date-formatter');

var should = require('should');

describe('date-formater', function() {
    it('format', function() {
        df.format(0).should.equal('1970/01/01 00:00:00');
    });
});
