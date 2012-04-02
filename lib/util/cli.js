'use strict';

var sf = require('sf');
var commander = require('commander');

exports.selectOption = function (options, prompt, callback) {
  if (options.length === 0) {
    return callback(new Error("No options to select from"));
  }
  if (options.length === 1) {
    return callback(null, options[0]);
  }

  for (var i = 0; i < options.length; i++) {
    console.log(sf(" {0,3} - {1}", i + 1, options[i]));
  }
  commander.prompt(prompt + ' ', function (val) {
    val = val - 1;
    if (val < 0 || val >= options.length) {
      return callback(new Error("Invalid selection."));
    }
    callback(null, options[val]);
  });
};
