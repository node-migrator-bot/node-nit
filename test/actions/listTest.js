'use strict';

var ListAction = require('../../lib/actions/list');
var nit = require('../../index');
var nitHelpers = require('../../testHelpers/nitHelpers');
var fs = require('fs');
var sf = require('sf');

module.exports = {
  'setUp': function (callback) {
    var self = this;
    nitHelpers.createTempNitDirectory({}, function (err, dir) {
      if (err) {
        return callback(err);
      }
      self.dir = dir;
      nitHelpers.createTask(self.dir, {
        fields: {
          'Modified Date': sf("{0:G}", new Date(2011, 1, 1))
        }
      }, function (err, task) {
        if (err) {
          return callback(err);
        }
        self.task = task;
        callback();
      });
    });
  },

  'list task': function (test) {
    var self = this;
    var action = new ListAction();
    var options = {
      user: nitHelpers.getTestUser(),
      verbose: true,
      args: [
      ]
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
