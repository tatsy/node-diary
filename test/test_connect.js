var connect = require('../lib/connect');
var should  = require('should');
var fs      = require('fs');

describe('connect', function() {
    it('test to check whether a file is binary or not', function() {
        var ascii = fs.readFileSync('app.js');
        connect.isBinary(ascii).should.equal(false);
        var buf = fs.readFileSync('public/img/evernote.png');
        connect.isBinary(buf).should.equal(true);
    });

    it('test to mark down parsing', function() {
        var code = '# hello';
        connect.renderCode(code, '/', '/').should.equal('<h1 id="hello">hello</h1>\n');
    });
});
