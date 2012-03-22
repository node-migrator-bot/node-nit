'use strict';

var HelpAction = require('../../lib/actions/help');
var nit = require('../../index');
var nitHelpers = require('../../testHelpers/nitHelpers');
var fs = require('fs');
var sf = require('sf');

module.exports = {
  'help task': function (test) {
    var self = this;
    var action = new HelpAction();
    var options = {
      user: nitHelpers.getTestUser(),
      verbose: true,
      args: [
      ],
      commander: {
        _version: '1.0',
        name: 'test'
      }
    };
    var tracker = new nit.IssueTracker(this.dir);
    action.cliRun(tracker, options, function (err) {
      if (err) {
        throw err;
      }
      test.done();
    });
  }
};
