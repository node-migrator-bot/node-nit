'use strict';

var sf = require('sf');
var commander = require('commander');

exports.selectOption = function (opts, callback) {
  opts.displayFn = opts.displayFn || function (o) {return o;};

  if (opts.options.length === 0) {
    return callback(new Error("No options to select from"));
  }
  if (opts.options.length === 1) {
    return callback(null, opts.options[0]);
  }

  for (var i = 0; i < opts.options.length; i++) {
    console.log(sf(" {0,3} - {1}", i + 1, opts.displayFn(opts.options[i])));
  }
  commander.promptForNumber(opts.prompt + ' ', function (val) {
    val = val - 1;
    if (val < 0 || val >= opts.options.length) {
      return callback(new Error("Invalid selection."));
    }
    process.stdin.pause();
    callback(null, opts.options[val]);
  });
};
