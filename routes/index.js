var fs = require('fs');
var mp = require('multiparty');
var path = require('path');
var crypto = require('crypto');
var childProc = require('child_process');

var am = require('../lib/article-manager');

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
    form.parse(req, function(err, fields, files) {
        if(fields.from == "index") {
            if(fields.articleId === undefined) {
                var md5 = crypto.createHash('md5');
                var orgText = fields.title + (new Date()).getTime().toString();
                console.log(orgText);
                md5.update(orgText);

                var folder = am.dir + md5.digest('hex');


                fs.mkdir(folder, function(err) {
                    if(err) {
                        console.log('Failed to make a new directory');
                        console.log(err.code);
                    }

                    fs.writeFileSync(folder + '/info.txt', fields.title);

                    var formData = {
                        title: fields.title,
                        code: [''],
                        outfile: ['README.html']
                    };

                    res.render('edit', {
                        fields: formData,
                        media: []
                    });
                });
            } else {
                var title = am.getTitle(fields.articleId);
                var formData = {
                    title: title,
                    code: [''],
                    outfile: ['README.html']
                };

                res.render('edit', {
                    fields: formData,
                    media: []
                });
            }
        }
        else if(fields.from == "edit") {
            var orgname = files.upload[0].originalFilename;
            var tempPath = files.upload[0].path;
            var ext = path.extname(orgname);
            var basename = path.basename(orgname, ext);

            console.log('extension is: ' + ext);

            if(ext === '.jpg' || ext === '.png' || ext === '.jpeg' || ext === '.gif') {
                var targetPath = './public/upload/' + basename + ext;
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

            if(ext === '.avi' || ext === '.wmv' || ext === '.mp4' || ext === '.mpg' || ext == '.mov') {
                var targetPath = './public/upload/' + basename + '.mp4';
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

            fs.readdir('./public/upload/', function(err, uploadedFiles) {
                if(!uploadedFiles) {
                    uploadedFiles = [];
                }

                res.render('index', {
                    fields: fields,
                    media: uploadedFiles
                });
            });
        }
    });
}
