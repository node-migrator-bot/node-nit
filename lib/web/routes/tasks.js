'use strict';

var async = require('async');
var sf = require('sf');
var htmlUtil = require('../../util/html');
var objectUtil = require('../../util/object');
var Task = require('../../task');

module.exports = function (app) {
  app.get('/tasks.json', function (req, res, next) {
    app.tracker.getOpenTasks(function (err, tasks) {
      if (err) {
        return next(err);
      }
      tasks = tasks.sort(function (a, b) { return a.getIdNumber() - b.getIdNumber(); })
      res.end(JSON.stringify(tasks, null, '  '));
    });
  });

  app.get('/tasks/:id.json', function (req, res, next) {
    var taskId = req.params.id;

    app.tracker.getOpenTask(taskId, function (err, task) {
      if (err) {
        return next(err);
      }
      res.end(JSON.stringify(task, null, '  '));
    });
  });

  app.get('/tasks/:id', function (req, res, next) {
    var taskId = req.params.id;

    async.auto({
      getOpenTask: function (callback) {
        if (taskId === 'new') {
          callback(null, new Task());
        } else {
          app.tracker.getOpenTask(taskId, callback);
        }
      },

      getTaskMetadata: ['getOpenTask', function (callback, results) {
        var task = results.getOpenTask;
        app.tracker.getTaskMetadata(task, callback);
      }],

      getUsers: app.tracker.getUsers.bind(app.tracker)
    }, function (err, results) {
      if (err) {
        return next(err);
      }

      var task = results.getOpenTask;
      var taskMetadata = results.getTaskMetadata;
      var users = results.getUsers;

      res.render('task', {
        title: 'task ' + taskId,
        task: task,
        taskMetadata: taskMetadata,
        getFormHtml: function (fieldMetadata) {
          var fieldValue = task.getFieldValue(fieldMetadata.path);
          switch (fieldMetadata.type) {
            case 'user':
              fieldValue = fieldValue || '';
              if (!fieldMetadata.readonly) {
                var options = users.map(
                  function (u) {
                    return u.toString();
                  }).sort();
                options.splice(0, 0, "");
                options = options.map(function (o) {
                  return sf(
                    "<option value=\"{0}\" {1}>{0}</option>",
                    htmlUtil.getFormValueSafeValue(o.toString()),
                    o == fieldValue.toString() ? "selected='selected'" : "");
                });
                return sf(
                  "<select name='{path}'>{1}</select> <a href='javascript:' onclick=\"selectOption('{path}', '{2}');\">me</a>",
                  fieldMetadata,
                  options.join('\n'),
                  app.currentUser.toString());
              }
              break;

            case 'string':
              fieldValue = fieldValue || '';
              if (!fieldMetadata.readonly) {
                return sf("<input type='text' name='{path}' value=\"{1}\"/>", fieldMetadata, htmlUtil.getFormValueSafeValue(fieldValue));
              }
              break;

            case 'multilineString':
              fieldValue = fieldValue || '';
              if (!fieldMetadata.readonly) {
                return sf("<textarea type='text' name='{path}'>{1}</textarea>", fieldMetadata, htmlUtil.getTextareaSafeValue(fieldValue));
              }
              break;

            case 'array':
              fieldValue = fieldValue || [];
              var items = fieldValue
                .filter(function (item) { return item.trim().length > 0; })
                .map(function (item) {
                  return sf("<li>{0}</li>", item);
                });
              if (items.length === 0) {
                return sf("<div class='emptyFieldValue'>No {name}</div>", fieldMetadata);
              }
              return "<ul>" + items.join('\n') + "</ul>";
              break;

            case 'status':
              fieldValue = fieldValue || 'Open';
              if (!fieldMetadata.readonly) {
                var options = [];
                options.push("Open");
                options.push("Closed");
                options = options.map(function (o) {
                  return sf("<option {1}>{0}</option>", o, o == fieldValue ? "selected='selected'" : "");
                });
                return sf("<select name='{path}'>{1}</select>", fieldMetadata, options.join('\n'));
              }
              break;
          }

          if (!fieldValue || fieldValue.length === 0) {
            return "<div class='emptyFieldValue'>Empty</div>";
          }

          return fieldValue;
        }
      });
    });
  });

  app.post('/tasks/:id', function (req, res, next) {
    var taskId = req.params.id;

    async.auto({
      getOpenTask: function (callback) {
        if (taskId === 'new') {
          app.tracker.newTask(app.options, callback);
        } else {
          app.tracker.getOpenTask(taskId, callback);
        }
      }
    }, function (err, results) {
      if (err) {
        return next(err);
      }

      var task = results.getOpenTask;

      for (var k in req.body) {
        objectUtil.setByPath(task, k, req.body[k]);
      }

      task.updateModifiedAndSave(app.currentUser, function (err) {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    });
  });
};
