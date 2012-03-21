'use strict';

var child_process = require('child_process');

module.exports = function (prefs, filename, callback) {
  // todo: use prefs to get prefered editor
  var p;
  if (process.platform === 'linux') {
    p = child_process.spawn('gnome-open', [filename]);
  } else if (process.platform === 'darwin') {
    p = child_process.spawn('open', [filename]);
  } else {
    callback(new Error('Platform not supported {0}', process.platform));
    return;
  }
  p.on('exit', function (code) {
    callback();
  });
};
