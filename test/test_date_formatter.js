'use strict';

var df = require('../lib/date-formatter');

var should = require('should');

describe('date-formater', function() {
  it('simple format', function() {
    var datestr  = '1970/01/01 00:00:00';
    var datetime = new Date(datestr);
    df.format(datetime.getTime()).should.equal('1970/01/01 00:00:00');
  });

  it('simple format', function() {
    var datestr  = '2000/02/28 14:00:00';
    var datetime = new Date(datestr);
    df.format(datetime.getTime()).should.equal(datestr);
  });

  it('simple format', function() {
    var datestr  = '2015/08/31 23:59:59';
    var datetime = new Date(datestr);
    df.format(datetime.getTime()).should.equal(datestr);
  });
});
