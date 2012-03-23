'use strict';

var Class = require('./util/class');
var objectUtils = require('./util/object');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var Task = require('./task');
var User = require('./user');
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

  renderTemplate: function (options, callback) {
    var self = this;
    fs.readFile(path.join(self.dir, 'template.task'), 'utf8', function (err, taskTemplate) {
      if (err) {
        return callback(err);
      }

      var currentUser = options.user;
      var templateOptions = {
        now: sf("{0:G}", new Date()),
        currentUser: currentUser
      };
      callback(null, ejs.render(taskTemplate, templateOptions));
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

      renderTask: function (callback) {
        self.renderTemplate(options, callback);
      },

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

  getUsers: function (callback) {
    function findAddUser (users, user) {
      if (!user || user.length === 0) {
        return;
      }
      user = User.fromString(user);
      users[user.toString()] = user;
    }

    this.getOpenTasks(function (err, tasks) {
      if (err) {
        return callback(err);
      }
      var users = {};
      for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        findAddUser(users, task.fields['Assigned To']);
        findAddUser(users, task.fields['Created By']);
        findAddUser(users, task.fields['Modified By']);
      }
      return callback(null, objectUtils.getValues(users));
    });
  },

  _getMetadata: function (task) {
    var metadata = [];
    for (var k in task.fields) {
      var fieldVal = task.fields[k];
      var fieldMetadata = {
        name: k,
        path: 'fields.' + k,
        readonly: false,
        type: 'string'
      };

      if (k === 'Created By'
        || k === 'Created Date'
        || k === 'Modified By'
        || k === 'Modified Date') {
        fieldMetadata.readonly = true;
      }

      if (k === 'Created By'
        || k === 'Modified By'
        || k === 'Assigned To') {
        fieldMetadata.type = 'user';
      }

      if (k === 'Status') {
        fieldMetadata.type = 'status';
      }

      if (fieldVal instanceof Array) {
        fieldMetadata.type = 'array';
      } else if (fieldVal.indexOf('\n') >= 0) {
        fieldMetadata.type = 'multilineString';
      }
      metadata.push(fieldMetadata);
    }
    return metadata;
  },

  _mergeMetadata: function (origMetadata, newMetadata) {
    function getOrigFieldMetadataIdx (name) {
      for (var origMetadataIdx = 0; origMetadataIdx < origMetadata.length; origMetadataIdx++) {
        if (origMetadata[origMetadataIdx].name === name) {
          return origMetadataIdx;
        }
      }
      return null;
    }

    for (var i = 0; i < newMetadata.length; i++) {
      var newFieldMetadata = newMetadata[i];
      var origFieldMetadataIdx = getOrigFieldMetadataIdx(newFieldMetadata.name);
      if (origFieldMetadataIdx) {
        var type = origMetadata[origFieldMetadataIdx].type;
        origMetadata[origFieldMetadataIdx] = newFieldMetadata;
        if (type === 'multilineString') {
          origMetadata[origFieldMetadataIdx].type = type;
        }
      } else {
        origMetadata.push(newFieldMetadata);
      }
    }
  },

  getTemplateMetadata: function (callback) {
    var self = this;
    var metadata = [];
    metadata.push({
      name: 'id',
      path: 'id',
      readonly: true,
      type: 'number'
    });

    this.renderTemplate({}, function (err, renderedTemplate) {
      var task = Task.fromString(renderedTemplate);
      var templateMetadata = self._getMetadata(task);
      self._mergeMetadata(metadata, templateMetadata);
      callback(null, metadata);
    });
  },

  getTaskMetadata: function (task, callback) {
    var self = this;
    this.getTemplateMetadata(function (err, metadata) {
      if (err) {
        return callback(err);
      }
      var taskMetadata = self._getMetadata(task);
      self._mergeMetadata(metadata, taskMetadata);
      callback(null, metadata);
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
