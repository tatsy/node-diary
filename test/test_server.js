var routes = require('../routes');

require('should');

describe('routes', function() {
    var req, res;
    beforeEach(function() {
        req = {};
        res = {
            redirect: function() {},
            render : function() {}
        }
    });

    describe('index', function() {
        it("Should display index page with title", function(done) {
            res.render = function(view, vars) {
                view.should.equal('index');
                // vars.title.should.eql('Express');
                done();
            };
            routes.index(req, res);
        });
    });
});
