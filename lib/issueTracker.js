'use strict';

var Class = require('./util/class');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var Task = require('./task');
var async = require('async');
var ejs = require('ejs');
var sf = require('sf');

module.exports = Class.extend({
  init: function (dir) {
    this.dir = path.resolve(dir);
  },

  verify: function (callback) {
    var dir = path.resolve(this.dir);
    fs.exists(dir, function (exists) {
      if (!exists) {
        callback(new Error("Path '" + dir + "' does not exists."));
        return;
      }
      callback();
    });
  },

  getOptions: function (callback) {
    fs.readFile(path.join(this.dir, 'options.json'), 'utf8', function (err, data) {
      if (err) {
        callback(err);
        return;
      }
      var options = JSON.parse(data);
      callback(null, options);
    });
  },

  newTask: function (options, callback) {
    var self = this;
    async.auto({
      getOptions: this.getOptions.bind(this),

      getTasks: this.getTasks.bind(this),

      getTaskIds: ['getTasks', function (callback, results) {
        var tasks = results.getTasks;
        var ids = tasks.map(function (task) { return task.id });
        callback(null, ids);
      }],

      getNextTaskId: ['getOptions', 'getTaskIds', function (callback, results) {
        var taskIds = results.getTaskIds;
        var options = results.getOptions;
        var maxTaskId = 0;
        for (var i = 0; i < taskIds.length; i++) {
          var m = taskIds[i].match(options.taskPrefix + "(.*)");
          if (m) {
            maxTaskId = Math.max(maxTaskId, m[1]);
          }
        }
        callback(null, maxTaskId + 1);
      }],

      getTaskTemplate: function (callback) {
        fs.readFile(path.join(self.dir, 'template.task'), 'utf8', callback);
      },

      renderTask: ['getTaskTemplate', function (callback, results) {
        var taskTemplate = results.getTaskTemplate;
        var currentUser = options.prefs.user;
        var templateOptions = {
          now: sf("{0:G}", new Date()),
          currentUser: currentUser
        };
        callback(null, ejs.render(taskTemplate, templateOptions));
      }],

      createTask: ['getNextTaskId', 'renderTask', 'getOptions', function (callback, results) {
        var options = results.getOptions;
        options.taskPrefix = options.taskPrefix || "UKNOWN-";
        var nextTaskId = results.getNextTaskId;
        var taskStr = results.renderTask;
        var filename = path.join(self.dir, options.taskPrefix + nextTaskId + ".task");
        fs.writeFile(filename, taskStr, function (err) {
          if (err) {
            callback(err);
            return;
          }
          callback(null, new Task(filename));
        });
      }]
    }, function (err, results) {
      if (err) {
        callback(err);
        return;
      }
      callback(null, results.createTask);
    });
  },

  getTasks: function (callback) {
    var self = this;
    fs.readdir(this.dir, function (err, files) {
      if (err) {
        callback(err);
        return;
      }
      var tasks = files
        .filter(function (fileName) { return self._isTaskFilename(path.basename(fileName)); })
        .map(function (fileName) { return new Task(path.join(self.dir, fileName)); });
      callback(null, tasks);
    });
  },

  getOpenTasks: function (callback) {
    this.getTasks(function (err, tasks) {
      if (err) {
        callback(err);
        return;
      }
      async.map(tasks, function (task, callback) {
        task.open(callback);
      }, callback);
    });
  },

  getOpenTask: function (taskId, callback) {
    var self = this;
    this.getOptions(function (err, options) {
      if (err) {
        callback(err);
        return;
      }
      var filename = path.join(self.dir, options.taskPrefix + taskId + ".task");
      new Task(filename).open(function (err, task) {
        if (err) {
          var altFilename = path.join(self.dir, taskId + ".task");
          new Task(altFilename).open(function (err, task) {
            callback(err, task);
          });
          return;
        }
        callback(null, task);
      });
    });
  },

  assign: function (taskId, currentUser, user, callback) {
    this.getOpenTask(taskId, function (err, task) {
      if (err) {
        callback(err);
        return;
      }

      task.assign(user);
      task.updateModifiedAndSave(currentUser, callback);
    });
  },

  addComment: function (taskId, user, comment, callback) {
    this.getOpenTask(taskId, function (err, task) {
      if (err) {
        callback(err);
        return;
      }
      task.addComment(user, comment);
      task.updateModifiedAndSave(user, callback);
    });
  },

  _isTaskFilename: function (fname) {
    switch (fname) {
      case 'options.json':
      case 'template.task':
        return false;
      default:
        return fname.match(/\.task$/);
    }
  }
});

module.exports.create = function (dir, options, callback) {
  dir = path.resolve(dir);
  fs.exists(dir, function (exists) {
    if (exists) {
      callback(new Error("Path '" + dir + "' already exists."));
      return;
    }
    mkdirp(dir, function (err) {
      if (err) {
        callback(err);
        return;
      }

      var optionsStr = JSON.stringify(options, null, '   ') + '\n';
      var templteStr = [
        'Title: ',
        'Status: Open',
        'Assigned To: ',
        'Created By: <%- currentUser %>',
        'Created Date: <%- now %>',
        'Modified By: <%- currentUser %>',
        'Modified Date: <%- now %>',
        'Description:',
        '',
        'Comments:',
        ''
      ].join('\n');
      async.parallel([
        fs.writeFile.bind(fs, path.join(dir, 'options.json'), optionsStr),
        fs.writeFile.bind(fs, path.join(dir, 'template.task'), templteStr)
      ], callback);
    });
  });
};
