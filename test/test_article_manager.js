'use strict';

var am     = require('../lib/article-manager.js');
var assert = require('assert');

describe('article-manager test', function() {
  it('article dir', function() {
    am.dir.should.equal('./public/articles/');
  });

  it('get article list', function() {
    am.getList(function(err, hash) {
      if (err) {
        throw err;
      }
      assert.deepEqual(Object.keys(hash), [ '2015' ]);
      assert.deepEqual(Object.keys(hash['2015']), [ '1' ]);
      var article = hash['2015']['1'][0];
      assert.equal(article.title, 'Article Example');
    });
  });
});
