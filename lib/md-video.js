var regex = {
    link: new RegExp(/\$\[([\s\S]*?)\]\(([\s\S]*?)\)/)
};

function render(href, text) {
    var imsizeReg = /([\s\S]+) =([0-9]*)x([0-9]*)/;
    var match = imsizeReg.exec(href);
    if(match) href = match[1];
    var out = '<video src="' + href + '"';

    if(match) {
        if(match[2] != '') {
            out += ' width="' + match[2] + '"';
        }
        if(match[3] != '') {
            out += ' height="' + match[3] + '"';
        }
    }
    out += ' controls>';
    if (text) {
        out += text;
    }
    out += '</video>';
    return out;
}

exports.marked = function(code) {
    var match = null;
    while(match = regex.link.exec(code)) {
        code = code.replace(regex.link, render(match[2], match[1]));
    }
    return code;
}
