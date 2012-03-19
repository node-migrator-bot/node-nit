'use strict';

var ActionBase = require('../actionBase');
var commander = require('commander');
var sf = require('sf');

module.exports = ActionBase.extend({
  name: 'list',
  shortDescription: 'Lists tasks',

  cliRun: function (args, callback) {
    commander.parse(process.argv);

    throw new Error("Invalid number of arguments for list");
  },

  cliShowHelp: function (commander, callback) {
    console.log(commander);
    console.log(sf("Usage: {0} <action> <args>", commander.name));
  }
});
