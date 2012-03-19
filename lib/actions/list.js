'use strict';

var ActionBase = require('../actionBase');

module.exports = ActionBase.extend({
  name: 'list',
  shortDescription: 'Lists tasks',

  cliRun: function (commander, args, callback) {
    this.populateCommander(commander);
    commander.parse(args);

    callback(new Error("Invalid number of arguments for " + this.name));
  }
});
