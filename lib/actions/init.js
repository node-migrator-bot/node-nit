'use strict';

var ActionBase = require('../actionBase');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');

module.exports = ActionBase.extend({
  name: 'init',
  shortDescription: 'Initializes a directory for issue tracking',

  cliRun: function (commander, args, callback) {
    this.populateCommander(commander);
    commander.parse(args);

    if (commander.args.length === 0) {
      var dir = path.resolve(commander.directory);
      fs.exists(dir, function (exists) {
        if (exists) {
          callback(new Error("Path '" + dir + "' already exists."));
          return;
        }
        mkdirp(dir, function (err) {
          if (err) {
            callback(err);
            return;
          }
          callback();
        });
      });
      return;
    }

    callback(new Error("Invalid number of arguments for " + this.name));
  }
});
