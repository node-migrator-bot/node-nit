'use strict';

var tty = require('tty');
var child_process = require('child_process');
var util = require('util');

function _spawn (cmd, args, callback) {
var p = child_process.spawn(cmd, args);

function indata (c) {
  p.stdin.write(c);
}

function outdata (c) {
  process.stdout.write(c);
}

process.stdin.on('data', indata);
p.stdout.on('data', outdata);
process.stdin.resume();
tty.setRawMode(true);

p.on('exit', function (code) {
  tty.setRawMode(false);
  process.stdin.pause();
  process.stdin.removeListener('data', indata);
  p.stdout.removeListener('data', outdata);
  callback();
});
p.stderr.on('data', function (d) {
  console.log(d.toString());
})
}

module.exports = function (prefs, filename, callback) {
  prefs.editor = prefs.editor || 'default';

  var p;
  if (prefs.editor !== 'default') {
    return _spawn(prefs.editor, [filename], callback);
  }

  if (process.platform === 'linux') {
    return _spawn('gnome-open', [filename], callback);
  }

  if (process.platform === 'darwin') {
    return _spawn('open', [filename], callback);
  }

  return callback(new Error('Platform not supported {0}', process.platform));
};
