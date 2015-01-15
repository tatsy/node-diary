var fs = require('fs');

var articleDir = './public/articles/';

exports.dir = articleDir;

exports.getInfo = function(id) {
    return JSON.parse(fs.readFileSync(articleDir + id + '/info.txt'));
}

exports.getList = function(callback) {
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
        callback(err, articleList);
    });
}
