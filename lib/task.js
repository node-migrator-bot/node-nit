'use strict';

var Class = require('./util/class');
var path = require('path');
var fs = require('fs');
var sf = require('sf');
var User = require('./user');
var objectUtils = require('./util/object');

var Task = module.exports = Class.extend({
  errors: [],

  init: function (filename) {
    filename = filename || 'New.task';

    this.isOpen = false;
    this.filename = filename;
    var idMatch = path.basename(this.filename).match("(.*).task");
    if (!idMatch) {
      throw new Error("Invalid task");
    }
    this.id = idMatch[1];
    this.fields = {};
  },

  _parseTaskContents: function (contents) {
    var lines = contents.trim().split('\n');
    var lastFieldName = null;
    var lastFieldIsMultiline = false;
    this.errors = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (line.trim().length === 0) {
        line = ' ';
      }

      if (lastFieldName) {
        // List
        if (lastFieldIsMultiline !== true) {
          var match = line.match(/^\s+-(.*)/);
          if (match) {
            var val = match[1].trimLeft();
            if (this.fields[lastFieldName] instanceof Array) {
              this.fields[lastFieldName].push(val);
            } else if (this.fields[lastFieldName].length === 0) {
              this.fields[lastFieldName] = [ val ];
            } else {
              this.fields[lastFieldName] = [ this.fields[lastFieldName], val ];
            }
            continue;
          }
        }

        // Continuation of previous field value
        var match = line.match(/^\s+(.*)/);
        if (match || line === ' ') {
          var val = match[1].trimLeft();
          if (this.fields[lastFieldName] instanceof Array) {
            var array = this.fields[lastFieldName];
            array[array.length - 1] = array[array.length - 1].trimLeft() + '\n' + val;
          } else {
            lastFieldIsMultiline = true;
            this.fields[lastFieldName] = this.fields[lastFieldName].trimLeft() + '\n' + val;
          }
          continue;
        }
      }

      // Field Name: Value
      var match = line.match(/^(.*?):(.*)/);
      if (match) {
        lastFieldName = match[1];
        var val = match[2].trim();
        this.fields[lastFieldName] = val;
        continue;
      }

      this.errors.push(sf("Could not parse line ({filename}:{1}): {2}", this, i + 1, line));
    }
  },

  open: function (callback) {
    var self = this;
    fs.readFile(this.filename, 'utf8', function (err, data) {
      if (err) {
        callback(err);
        return;
      }
      self._parseTaskContents(data);
      self.isOpen = true;
      callback(null, self);
    });
  },

  save: function (callback) {
    var self = this;
    var str = this.getFileString();
    fs.writeFile(this.filename, str, function (err) {
      if (err) {
        callback(new Error("Could not save task " + this.id + " (" + err.message + ")"));
        return;
      }
      callback(null, self);
    });
  },

  updateModifiedAndSave: function (user, callback) {
    if (this.fields['Modified Date']) {
      this.fields['Modified Date'] = sf("{0:G}", new Date());
    }
    if (this.fields['Modified By']) {
      this.fields['Modified By'] = user.toString();
    }
    this.save(callback);
  },

  getFileString: function () {
    var results = [];
    for (var k in this.fields) {
      var val = this.fields[k];
      if (val instanceof Array) {
        results.push(sf('{0}:', k));
        var addedOne = false;
        for (var i = 0; i < val.length; i++) {
          if (!val[i] || val[i].trim() === '') {
            continue;
          }
          results.push(sf(' - {0}', val[i].replace(/\n/, '\n   ')));
          addedOne = true;
        }
        if (!addedOne) {
          results.push(' -');
        }
      } else {
        if (val.indexOf('\n') >= 0) {
          val = val.trim();
          val = '\n   ' + val.replace(/\n/g, '\n   ');
        }
        results.push(sf('{0}: {1}', k, val));
      }
    }
    results.push('');
    return results.join('\n');
  },

  getFullDescription: function () {
    if (!this.isOpen) {
      return sf("{id} - [Error: Task not open]", this);
    }
    var result = [];
    result.push(sf("{0,15}: {1}", "Id", this.id));
    result.push(sf("{0,15}: {1}", "Filename", this.filename));
    for (var k in this.fields) {
      var val = this.fields[k];
      if (val instanceof Array) {
        result.push(sf("{0,15}:", k));
        for (var i = 0; i < val.length; i++) {
          var str = val[i].replace(/\n/mg, sf('\n{0,15}    ', ''));
          result.push(sf("{0,15}  - {1}", '', str));
        }
      } else {
        var str = val.replace(/\n/mg, sf('\n{0,15}  ', ''));
        result.push(sf("{0,15}: {1}", k, str));
      }
    }
    return result.join('\n');
  },

  getShortString: function () {
    if (!this.isOpen) {
      return sf("{id} - [Error: Task not open]", this);
    }
    if (this.fields['Assigned To'] && this.fields['Assigned To'].length > 0) {
      return sf("{id} - {fields.Title} (Assigned To: {fields['Assigned To']})", this);
    } else {
      return sf("{id} - {fields.Title}", this);
    }
  },

  getStatus: function () {
    return this.fields['Status'].toLowerCase();
  },

  setStatus: function (newStatus) {
    switch (newStatus.toLowerCase()) {
      case 'active':
        this.fields['Status'] = 'Active';
        break;
      case 'open':
        this.fields['Status'] = 'Open';
        break;
      case 'closed':
        this.fields['Status'] = 'Closed';
        this.fields['Closed Date'] = sf("{0:G}", new Date());
        break;
      default:
        this.fields['Status'] = newStatus;
        break;
    }
  },

  getFieldValue: function (path) {
    return objectUtils.getByPath(this, path);
  },

  _ensureArrayFieldExists: function (fieldName) {
    this.fields = this.fields || {};
    if (!(fieldName in this.fields)) {
      this.fields[fieldName] = [];
    } else if (!(this.fields[fieldName] instanceof Array)) {
      if (this.fields[fieldName].length === 0) {
        this.fields[fieldName] = [];
      } else {
        this.fields[fieldName] = [this.fields[fieldName]];
      }
    }
  },

  getIdNumber: function () {
    var match = this.id.match(/([0-9]*)$/);
    if (match) {
      return +match[1];
    }
    return 0;
  },

  assign: function (user) {
    this.fields['Assigned To'] = user.toString();
  },

  _removeEmptyComments: function () {
    var comments = this.fields["Comments"];
    for (var i = 0; i < comments.length; i++) {
      if (!comments[i] || comments[i].trim().length === 0) {
        comments.splice(i, 1);
        i--;
      }
    }
  },

  addComment: function (user, comment) {
    this._ensureArrayFieldExists("Comments");
    this.fields["Comments"].push(sf("{0:G}: {1}: {2}", new Date(), user.toString(), comment));
    this._removeEmptyComments();
  },

  isAssignedTo: function (user) {
    try {
      var assignedTo = User.fromString(this.fields['Assigned To']);
      if (!assignedTo) {
        return false;
      }
      if (assignedTo.email === user.email) {
        return true;
      }
    } catch (ex) {
      console.error("Could not parse user name from task " + this.id);
    }

    return false;
  },

  isAssigned: function () {
    try {
      var assignedTo = User.fromString(this.fields['Assigned To']);
      if (assignedTo) {
        return true;
      }
    } catch (ex) {
      console.error("Could not parse user name from task " + this.id);
    }
    return false;
  }
});

module.exports.fromString = function (str) {
  var task = new Task("__string__.task");
  task._parseTaskContents(str);
  return task;
};

module.exports.getStatusPrecedence = function (status) {
  status = status.toLowerCase();
  switch (status) {
    case 'active':
      return 1;
    case 'open':
      return 2;
    case 'closed':
      return 3;
    default:
      return -1;
  }
};
