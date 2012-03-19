'use strict';

var Class = require('./util/class');
var sf = require('sf');

module.exports = Class.extend({
  populateCommander: function(commander) {

  },

  cliRun: function (commander, args, callback) {
    throw new Error("Not Implemented");
  },

  cliUsageArgumentsString: function() {
    return "<options>";
  },

  cliShowHelp: function (commander, callback) {
    this.populateCommander(commander);
    console.log(sf("Usage: {0} {1} {2}", commander.name, this.name, this.cliUsageArgumentsString()));
    console.log();
    console.log('  Options:');
    console.log();
    console.log(commander.optionHelp().replace(/^/gm, '    '));
    console.log();
    callback();
  }
});
