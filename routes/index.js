var fs = require('fs');
var mp = require('multiparty');
var path = require('path');
var crypto = require('crypto');
var childProc = require('child_process');

var am = require('../lib/article-manager');
var df = require('../lib/date-formatter');

var articleDir = './public/articles/';

exports.index = function(req, res) {
    am.getList(function(err, articles) {
        if(err) {
            throw err;
        }

        if(!articles) {
            articles = [];
        }

        res.render('index', { articles: articles });
    });
}

exports.edit = function(req, res) {
    var form = new mp.Form();
    console.log(req);
    form.parse(req, function(err, fields, files) {
        if(fields.from == "index") {
            if(fields.articleId === undefined) {
                var md5 = crypto.createHash('md5');
                var datetime = (new Date()).getTime();
                var orgText = fields.title + datetime.toString();
                md5.update(orgText);
                var articleId = md5.digest('hex');
                var folder = am.dir + articleId;

                fs.mkdir(folder, function(err) {
                    if(err) {
                        console.log('Failed to make a new directory');
                        console.log(err.code);
                    }

                    fs.closeSync(fs.openSync(folder + '/index.html', 'a'));
                    fs.closeSync(fs.openSync(folder + '/index.md', 'a'));

                    fs.mkdir(folder + '/upload', function(err) {
                        if(err) {
                            console.log('Failed to make a new directory');
                            console.log(err.code);
                        }
                    });

                    var formatDate = df.format(datetime);
                    fs.writeFileSync(folder + '/info.txt', JSON.stringify({ title: fields.title, datetime: formatDate }));

                    var formData = {
                        title: fields.title,
                        articleId: articleId,
                        code: [''],
                    };

                    res.render('edit', {
                        fields: formData,
                    });
                });
            } else {
                console.log("Edit existing article.");
                var info = am.getInfo(fields.articleId);
                var code  = fs.readFileSync(am.dir + '/' + fields.articleId + '/index.md');
                var formData = {
                    title: info.title,
                    articleId: fields.articleId,
                    code: [code],
                };

                res.render('edit', {
                    fields: formData,
                });
            }
        }
        else if(fields.from == "edit") {
            var orgname = files.upload[0].originalFilename;
            var tempPath = files.upload[0].path;
            var ext = path.extname(orgname);
            var basename = path.basename(orgname, ext);
            var uploadDir = am.dir + fields.articleId + '/upload/';

            console.log('extension is: ' + ext);

            if(ext === '.avi' || ext === '.wmv' || ext === '.mp4' || ext === '.mpg' || ext == '.mov') {
                var targetPath = uploadDir + basename + '.mp4';
                var ffmpeg = childProc.spawn('ffmpeg', [
                '-i', tempPath,
                '-f', 'mp4',
                '-y', targetPath
                ]);

                ffmpeg.stdout.on('data', function(data) {
                    console.log('stdout: ' + data);
                });

                ffmpeg.stderr.on('data', function(data) {
                    console.log('stderr: ' + data);
                });

                ffmpeg.on('close', function(code) {
                    if(code !== 0) {
                        console.log('chile process exited with code: ' + code);
                        res.end('502 Internal Server Error');
                        return;
                    }
                    console.log('Movie successfully converted!!');
                    fs.unlink(tempPath, function(err) {
                        if(err) {
                            throw err;
                        }
                    });
                });
            }
            else {
                var targetPath = uploadDir + basename + ext;
                console.log(targetPath);
                fs.rename(tempPath, targetPath, function() {
                    if(err) {
                        console.log(err);
                        throw err;
                    }
                    fs.unlink(tempPath, function() {
                        if(err) {
                            console.log(err);
                            throw err;
                        }
                    });
                });
            }

            res.render('edit', {
                fields: fields,
            });
        }
    });
}
