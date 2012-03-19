'use strict';

var Class = require('./util/class');

module.exports = Class.extend({
  init: function (filename) {
    this.filename = filename;
  },

  getShortString: function () {
    return this.filename;
  }
});
