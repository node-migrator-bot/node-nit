'use strict';

var ClaimAction = require('../../lib/actions/claim');
var nit = require('../../index');
var nitHelpers = require('../../testHelpers/nitHelpers');
var fs = require('fs');

module.exports = {
  'setUp': function (callback) {
    var self = this;
    nitHelpers.createTempNitDirectory({}, function (err, dir) {
      if (err) {
        return callback(err);
      }
      self.dir = dir;
      nitHelpers.createTask(self.dir, function (err, task) {
        if (err) {
          return callback(err);
        }
        self.task = task;
        callback();
      });
    });
  },

  'claim task': function (test) {
    var self = this;
    var action = new ClaimAction();
    var prefs = {
      user: nitHelpers.getTestUser()
    };
    var commander = {
      verbose: true,
      args: [
        this.task.id
      ]
    };
    var tracker = new nit.IssueTracker(this.dir);
    action.cliRun(prefs, commander, tracker, function (err) {
      if (err) {
        throw err;
      }
      fs.readFile(self.task.filename, 'utf8', function (err, data) {
        if (err) {
          throw err;
        }
        test.ok(data.indexOf('Assigned To: test user <test@user.com>') > 0);
        test.done();
      });
    });
  }
};
