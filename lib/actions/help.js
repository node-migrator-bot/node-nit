'use strict';

var ActionBase = require('../actionBase');
var actionsHelper = require('../actions');
var sf = require('sf');

module.exports = ActionBase.extend({
  name: 'help',
  shortDescription: 'Shows help',

  cliRun: function (currentPrefs, commander, args, callback) {
    commander.parse(args);
    if (commander.args.length === 0) {
      this.cliShowAll(commander, callback);
      return;
    }

    if (commander.args.length === 1) {
      this.cliShowHelpFor(commander, commander.args[0], callback);
      return;
    }

    callback(new Error("Invalid number of arguments for help"));
  },

  cliShowHelp: function(commander, callback) {
    this.cliShowAll(commander, callback);
  },

  cliShowHelpFor: function (commander, actionName, callback) {
    actionsHelper.getAction(actionName, function (err, action) {
      if (err) {
        callback(err);
        return;
      }
      action.cliShowHelp(commander, callback);
    });
  },

  cliShowAll: function (commander, callback) {
    actionsHelper.getActions(function (err, actions) {
      if (err) {
        callback(err);
        return;
      }
      console.log(sf("Version: {0}", commander._version));
      console.log(sf("Usage: {0} <action> <args>", commander.name));
      console.log();
      console.log('Actions:');
      for (var i = 0; i < actions.length; i++) {
        console.log(sf(" {name, 10} - {shortDescription}", actions[i]));
      }
      console.log();
      console.log("For help on a specific command type:");
      console.log(sf("  {0} help <command>", commander.name));
      console.log();
      callback();
    });
  }
});
