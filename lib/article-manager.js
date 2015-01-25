var fs = require('fs');

var articleDir = './public/articles/';

exports.dir = articleDir;

exports.getInfo = function(id) {
    return JSON.parse(fs.readFileSync(articleDir + id + '/info.txt'));
}

exports.getList = function(callback) {
    if(!fs.existsSync(articleDir)) {
        fs.mkdirSync(articleDir);
    }

    fs.readdir(articleDir, function(err, dirs) {
        var articleList = [];
        for(var i=0; i<dirs.length; i++) {
            var info = exports.getInfo(dirs[i]);
            articleList.push({
                 title: info.title,
                 datetime: info.datetime,
                 id: dirs[i],
                 link: './articles/' + dirs[i]
            });
        }

        // sort with created date
        var hash = {};
        for(var i=0; i<articleList.length; i++) {
            hash[articleList[i].datetime] = articleList[i];
        }
        var keys = Object.keys(hash);
        keys.sort().reverse();

        var ret = [];
        for(var i=0; i<keys.length; i++) {
            ret.push(hash[keys[i]]);
        }

        callback(err, ret);
    });
}
