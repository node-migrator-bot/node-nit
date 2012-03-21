'use strict';

var Class = require('./util/class');
var sf = require('sf');

module.exports = Class.extend({
  requiresInit: true,

  populateCommander: function(commander) {
    commander.option('-d, --directory <path>', 'set the directory where the tasks are stored. Default: ./.nit/', './.nit/');
  },

  cliRun: function (currentPrefs, commander, tracker, callback) {
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
