'use strict';

function addProperties (user) {
  Object.defineProperty(user, 'toString', {
    value: function () {
      if (!this.name) {
        throw new Error('User name not configured. Run "nit.js config".');
      }

      var str = this.name;
      if (this.email) {
        str += " <" + this.email + ">";
      } else {
        console.log('User email address not configured. Run "nit.js config".')
      }
      return str;
    }
  });
}

module.exports.fromJson = function (json) {
  var result = json;
  addProperties(result);
  return result;
};

module.exports.fromString = function (str) {
  if (!str) {
    return null;
  }
  str = str.trim();
  if (str.length == 0) {
    return null;
  }

  var match = str.match(/^(.*) <(.*)>$/);
  if (match) {
    var result = {
      name: match[1],
      email: match[2]
    };
    addProperties(result);
    return result;
  }

  throw new Error('Could not parse user string "' + str + '"');
};
