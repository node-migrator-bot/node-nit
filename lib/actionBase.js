'use strict';

var Class = require('./util/class');
var sf = require('sf');

module.exports = Class.extend({
  populateCommander: function(commander) {

  },

  cliRun: function (commander, args, callback) {
    throw new Error("Not Implemented");
  },

  cliShowHelp: function (commander, callback) {
    this.populateCommander(commander);
    console.log(sf("Usage: {0} list <args>", commander.name));
    console.log();
    console.log('  Options:');
    console.log();
    console.log(commander.optionHelp().replace(/^/gm, '    '));
    console.log();
    callback();
  }
});
