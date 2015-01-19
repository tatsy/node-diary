var fs       = require('fs');
var path     = require('path');
var crypto   = require('crypto');
var Evernote = require('evernote').Evernote;

exports.makeNote = function(noteStore, noteTitle, noteBody, resources, parentNotebook, callback) {
    callback = callback === undefined ? function(){} : callback;

    var nBody = '<?xml version="1.0" encoding="UTF-8"?>';
    nBody += '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">';
    nBody += '<en-note>' + noteBody + '</en-note>';

    // Craete note object
    var ourNote = new Evernote.Note();
    ourNote.title = noteTitle;
    ourNote.content = nBody;
    ourNote.resources = resources;

    // parentNotebook is optional; if omitted, default notebook is used
    if(parentNotebook && parentNotebook.guid) {
        ourNote.notebookGuid = parentNotebook.guid;
    }

    // Attempt to create note in Evernote account
    var config = JSON.parse(fs.readFileSync('./config.json').toString());
    noteStore.createNote(config.developerToken, ourNote, function(err, note) {
        if(err) {
            console.log(err);
            throw err;
        }
        console.log('Note is successfully created.');
        if(callback !== null) {
            callback();
        }
    });
}

function getResource(filename) {
    var resource = null;
    var ext = path.extname(filename);
    if(ext == '.jpg' || ext == '.jpeg' || ext == '.png' || ext == '.gif') {
        ext = ext.substr(1);
        if(ext == 'jpg') ext = 'jpeg';

        var buf = fs.readFileSync(filename);
        var md5 = crypto.createHash('md5');
        md5.update(buf);
        var data = new Evernote.Data();
        data.size = buf.length;
        data.bodyHash = md5.digest('hex');
        var bufAry = new Uint8Array(buf.length);
        for(var i=0; i<buf.length; i++) {
            bufAry[i] = buf[i];
        }
        data._body = bufAry;

        resource = new Evernote.Resource();
        resource.data = data;
        resource.mime = 'image/' + ext;
        var attr = new Evernote.ResourceAttributes();
        attr.fileName = filename;
        resource.resourceAttributes = attr;
    }
    return resource;
}

exports.getMediaResources = function(dir) {
    var files = fs.readdirSync(dir);
    var resources = [];
    for(var i=0; i<files.length; i++) {
        resources.push(getResource(dir + '/' + files[i]));
    }
    return resources;
}

exports.getNoteStore = function() {
    var config = JSON.parse(fs.readFileSync('./config.json').toString());
    var client = new Evernote.Client({ token: config.developerToken });
    return client.getNoteStore();
}

exports.ENMLize = function(code) {
    var enData = {
        enml: "",
        resources: []
    };

    // replace <img> tag to <en-media>
    var regImg = /\<img([\s\S]*?)( \/|)\>/;
    var matchImg = null;
    while(matchImg = regImg.exec(code)) {
        var fields = matchImg[1].split(/[ ]+/);
        var hash = {};
        for(var i=0; i<fields.length; i++) {
            var regData = /(width|height|src)="([\s\S]+)"/;
            var matchData = regData.exec(fields[i]);
            if(matchData) {
                hash[matchData[1]] = matchData[2];
            }
        }
        var after = '<en-media';
        if(hash['src'] !== undefined) {
            var resource = getResource('./public/' + hash['src'].substr(2));
            after += ' type="' + resource.mime + '" hash="' + resource.data.bodyHash + '"';
            enData.resources.push(resource);
        }
        if(hash['width'] !== undefined) after += ' width="' + hash['width'] + '"';
        if(hash['height'] !== undefined) after += ' height="' + hash['height'] + '"';
        after += ' />';
        code = code.replace(regImg, after);
    }

    // remove 'class' and 'id'
    var regex = /(id|class)="[\s\S]*?"/;
    var match = null;
    while(match = regex.exec(code)) {
        code = code.replace(regex, '');
    }

    // replace single <tag> to <tag />
    var regSingle = /\<(hr)\>/;
    while(match = regSingle.exec(code)) {
        code = code.replace(regSingle, '<$1 />');
    }
    enData.enml = code;
    return enData;
}
