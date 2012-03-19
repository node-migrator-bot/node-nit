'use strict';

var Class = require('./util/class');

module.exports = Class.extend({
  cliRun: function (args, callback) {
    throw new Error("Not Implemented");
  },

  cliShowHelp: function (callback) {
    throw new Error("Not Implemented");
  }
});
