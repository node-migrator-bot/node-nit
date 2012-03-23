'use strict';

var CommentAction = require('../../lib/actions/comment');
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

  'comment task': function (test) {
    var self = this;
    var action = new CommentAction();
    var options = {
      user: nitHelpers.getTestUser(),
      verbose: true,
      args: [
        this.task.id,
        "first comment"
      ]
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
        var expected = [
          "Title: ",
          "Status: Open",
          "Assigned To: ",
          "Created By: test user <test@user.com>",
          "Created Date: 3/21/2012 05:15:43 PM",
          "Modified By: test user <test@user.com>",
          "Modified Date: 3/21/2012 05:15:43 PM",
          "Description: ",
          "   ",
          "Comments:",
          " - 3/21/2012 05:15:43 PM: test user <test@user.com>: first comment",
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
