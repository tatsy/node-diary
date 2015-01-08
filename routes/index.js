exports.get = function(req, res) {
    var fields = { code: [''], outfile: ['README.html']}
    res.render('index', {
        fields: fields,
        media: []
    });
}

exports.post = function(req, res) {
    var form = new mp.Form();
    form.parse(req, function(err, fields, files) {
        console.log(fields);

        var orgname = files.upload[0].originalFilename;
        var tempPath = files.upload[0].path;
        var targetPath = './public/upload/' + orgname;
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

            fs.readdir('./public/upload/', function(err, uploadedFiles) {
                if(!uploadedFiles) {
                    uploadedFiles = [];
                }

                res.render('index', {
                    fields: fields,
                    media: uploadedFiles
                });
            });
        });
    });
}
