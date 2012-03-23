'use strict';

var tty = require('tty');
var child_process = require('child_process');
var util = require('util');

function _requiresCustomFds (cmd) {
  cmd = cmd.toLowerCase();
  if (cmd.match(/vi$/)
    || cmd.match(/nano$/)
    || cmd.match(/emacs$/)
    || cmd.match(/vim$/)) {
    return true;
  }
  return false;
}

function _spawn (cmd, args, callback) {
  var requiresCustomFds = _requiresCustomFds(cmd);
  var p;

  function indata (c) {
    p.stdin.write(c);
  }

  function outdata (c) {
    process.stdout.write(c);
  }

  if (requiresCustomFds) {
    p = child_process.spawn(cmd, args, {
      customFds: [0, 1, 2]
    });
    p.on('exit', function (code) {
      callback();
    });
  } else {
    p = child_process.spawn(cmd, args);

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
