'use strict';

var Class = require('./util/class');
var path = require('path');
var fs = require('fs');
var sf = require('sf');

module.exports = Class.extend({
  init: function (filename) {
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
    var lines = contents.split('\n');
    var lastFieldName = null;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (line.trim().length === 0) {
        continue;
      }

      if (lastFieldName) {
        // List
        var match = line.match(/^\s+- (.*)/);
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

        // Continuation of previous field value
        var match = line.match(/^\s+(.*)/);
        if (match) {
          var val = match[1].trimLeft();
          if (this.fields[lastFieldName] instanceof Array) {
            var array = this.fields[lastFieldName];
            array[array.length - 1] = array[array.length - 1].trim() + '\n' + val;
          } else {
            this.fields[lastFieldName] = this.fields[lastFieldName].trim() + '\n' + val;
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

      console.error(sf("Could not parse line ({filename}:{2}): {1}", this, line, i + 1));
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

  getFullDescription: function () {
    if (!this.isOpen) {
      return sf("{id} - [Error: Task not open]", this);
    }
    var result = [];
    result.push(sf("{0,15}: {1}", "Id", this.id));
    result.push(sf("{0,15}: {1}", "Filename", this.filename));
    for (var k in this.fields) {
      if (!this.fields.hasOwnProperty(k)) {
        continue;
      }
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
    return sf("{id} - {fields.Title}", this);
  },

  getStatus: function () {
    return this.fields['Status'].toLowerCase();
  }
});

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
