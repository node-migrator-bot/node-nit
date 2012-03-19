'use strict';

var child_process = require('child_process');

module.exports = function(filename) {
  if (process.platform === 'linux') {
    child_process.spawn('gnome-open', [filename]);
  } else if (process.platform === 'darwin') {
    child_process.spawn('open', [filename]);
  } else {
    throw new Error('Platform not supported {0}', process.platform);
  }
};
