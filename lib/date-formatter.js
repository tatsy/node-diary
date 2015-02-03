'use strict';

function fillZero(str, digits) {
  str = str.toString();
  while (str.length < digits) {
    str = '0' + str;
  }
  return str;
}

exports.format = function(milliTime) {
  var date = new Date(milliTime);
  var year   = fillZero(1900 + date.getYear(), 4);
  var month  = fillZero(1 + date.getMonth(), 2);
  var day  = fillZero(date.getDate(), 2);
  var hour   = fillZero(date.getHours(), 2);
  var minute = fillZero(date.getMinutes(), 2);
  var second = fillZero(date.getSeconds(), 2);

  return year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
};
