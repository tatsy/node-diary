var fs       = require('fs');
var Evernote = require('evernote').Evernote;

exports.makeNote = function(noteStore, noteTitle, noteBody, parentNotebook, callback) {
    var nBody = '<?xml version="1.0" encoding="UTF-8"?>';
    nBody += '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">';
    nBody += '<en-note>' + noteBody + '</en-note>';

    // Craete note object
    var ourNote = new Evernote.Note();
    ourNote.title = noteTitle;
    ourNote.content = nBody;

    // parentNotebook is optional; if omitted, default notebook is used
    if(parentNotebook && parentNotebook.guid) {
        ourNote.notebookGuid = parentNotebook.guid;
    }

    // Attempt to create note in Evernote account
    noteStore.createNote(ourNote, function(err, note) {
        if(err) {
            console.log(err);
            throw err;
        }
        callback(note);
    });
}

exports.getNoteStore = function() {
    var config = JSON.parse(fs.readFileSync('./config.json').toString());
    var client = new Evernote.Client({ token: config.developerToken });
    return client.getNoteStore();
}

exports.ENMLize = function(code) {
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
    return code;
}
