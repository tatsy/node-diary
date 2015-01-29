var fs = require('fs');

var articleDir = './public/articles/';

exports.dir = articleDir;

/*
 * get information text from ARTICLE_DIR/info.txt
 */
exports.getInfo = function(id) {
    return JSON.parse(fs.readFileSync(articleDir + id + '/info.txt'));
}

/*
 * get article list categorized its post month and day
 */
exports.getList = function(callback) {
    if(!fs.existsSync(articleDir)) {
        fs.mkdirSync(articleDir);
    }

    fs.readdir(articleDir, function(err, dirs) {
        if(err) {
            console.log(err);
            throw err;
        }

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
            var date  = new Date(articleList[i].datetime);
            var year  = 1900 + date.getYear();
            var month = 1 + date.getMonth();
            if(hash[year] === undefined) {
                hash[year] = {};
            }
            if(hash[year][month] === undefined) {
                hash[year][month] = [];
            }
            hash[year][month].push(articleList[i]);
        }
        callback(err, hash);
    });
}
