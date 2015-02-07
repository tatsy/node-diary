'use strict';

var connect = require('../lib/connect');
var fs      = require('fs');

describe('connect', function() {
  it('Check non-binary file', function() {
    var ascii = fs.readFileSync('app.js');
    connect.isBinary(ascii).should.equal(false);
  });

  it('Check binary file', function() {
    var buf = fs.readFileSync('public/img/evernote.png');
    connect.isBinary(buf).should.equal(true);
  });

  it('Markdown parsing', function() {
    var code = '# hello';
    connect.renderCode(code, '/', '/').should.equal('<h1>hello</h1>\n');
  });

  it('JS eval 1', function() {
    var code = '$js 1 + 2 + 3 $';
    connect.processJSCode(code).should.equal('<blockquote>6</blockquote>');
  });

  it('JS eval 2', function() {
    var code = '$js function test() { return 1 + 2; } $';
    connect.processJSCode(code).should.equal('<blockquote>undefined</blockquote>');
  });

  it('JS eval 3', function() {
    var code = '$js 1 ++ 2 $';
    (function() { connect.processJSCode(code) }).should.throw();
  });
});
