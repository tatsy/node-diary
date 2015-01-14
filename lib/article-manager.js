var fs = require('fs');

var articleDir = './public/articles/';

exports.dir = articleDir;

exports.getList = function(callback) {
    fs.readdir(articleDir, function(err, dirs) {
        var articleList = [];
        for(var i=0; i<dirs.length; i++) {
            var file = articleDir + dirs[i] + '/info.txt';
            console.log(typeof file);
            var name = fs.readFileSync(file);
            articleList.push({ name: name, md5: dirs[i] });
        }
        callback(err, articleList);
    });
}

exports.getTitle = function(id) {
    return fs.readFileSync(articleDir + id + '/info.txt');
}
