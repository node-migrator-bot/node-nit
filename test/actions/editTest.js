'use strict';

var EditAction = require('../../lib/actions/edit');
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

  'edit task': function (test) {
    var self = this;
    var action = new EditAction();
    var options = {
      user: nitHelpers.getTestUser(),
      verbose: true,
      args: [
        this.task.id
      ],
      testOpen: function (task, callback) {
        fs.writeFile(task.filename, "Title: test\nModified Date: 1/1/2012 05:15:43 PM\n", callback);
      }
    };
    var tracker = new nit.IssueTracker(this.dir);
    action.cliRun(tracker, options, function (err) {
      if (err) {
        throw err;
      }
      fs.readFile(self.task.filename, 'utf8', function (err, data) {
        if (err) {
          throw err;
        }

        test.ok(data.indexOf('Modified Date: 2/1/2011 00:00:00 AM') < 0);
        test.ok(data.indexOf('Modified Date: 1/1/2012 05:15:43 PM') < 0);

        var expected = [
          "Title: test",
          "Modified Date: 3/21/2012 05:15:43 PM",
          ""
        ].join('\n');
        expected = nitHelpers.replaceDates(expected);
        data = nitHelpers.replaceDates(data);
        test.equals(expected, data);
        console.log(data);
        test.done();
      });
    });
  },

  'edit task with invalid line': function (test) {
    var self = this;
    var action = new EditAction();
    var options = {
      user: nitHelpers.getTestUser(),
      verbose: true,
      args: [
        this.task.id
      ],
      testOpen: function (task, callback) {
        fs.writeFile(task.filename, "Title: test\nzzzz\nModified Date: 1/1/2012 05:15:43 PM\n", callback);
      }
    };
    var tracker = new nit.IssueTracker(this.dir);
    action.cliRun(tracker, options, function (err) {
      if (err) {
        throw err;
      }
      fs.readFile(self.task.filename, 'utf8', function (err, data) {
        if (err) {
          throw err;
        }

        var expected = [
          "Title: test",
          "zzzz",
          "Modified Date: 3/21/2012 05:15:43 PM",
          ""
        ].join('\n');
        expected = nitHelpers.replaceDates(expected);
        data = nitHelpers.replaceDates(data);
        test.equals(expected, data);
        console.log(data);
        test.done();
      });
    });
  }
};
