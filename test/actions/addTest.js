'use strict';

var AddAction = require('../../lib/actions/add');
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
      callback();
    });
  },

  'add task': function (test) {
    var action = new AddAction();
    var prefs = {};
    var commander = {
      verbose: true,
      testOpen: function (task, callback) {
        fs.writeFile(task.filename, "Title: test\nzzz", callback);
      }
    };
    var tracker = new nit.IssueTracker(this.dir);
    action.cliRun(prefs, commander, tracker, function (err, task) {
      if (err) {
        throw err;
      }
      test.equals('TEST-1', task.id);

      fs.readFile(task.filename, 'utf8', function (err, data) {
        if (err) {
          throw err;
        }
        test.equals('Title: test\nzzz', data);
        console.log(data);
        test.done();
      });
    });
  }
};
