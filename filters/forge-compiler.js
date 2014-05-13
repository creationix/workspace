/* global -name*/
"use strict";

var pathJoin = require("pathjoin");
var binary = require('bodec');
var modes = require('js-git/lib/modes');
module.exports = compiler;

function compiler(servePath, req, callback) {
  var path;
  if (req.input[0] === ".") {
    path = pathJoin(req.paths.rule, "..", req.input, req.paths.local);
  }
  else {
    path = pathJoin(req.paths.root, req.input, req.paths.local);
  }
  servePath(path, function (err, result) {
    if (err) return callback(err);
    if (!shouldHandle(path, result)) return callback();
    return callback(null, {
      mode: result.mode,
      hash: result.hash + "-" + req.codeHash,
      root: result.root,
      fetch : fetch
    });

    function fetch(callback) {
      result.fetch(function (err, value) {
        if (err) return callback(err);
        if (modes.isFile(result.mode)) {
          return compile(path, value, callback);
        }
        if (result.mode === modes.tree) {
          var tree = {};
          Object.keys(value).forEach(function (key) {
            var entry = value[key];
            if (shouldHandle(key, entry)) {
              entry.hash += "-" + req.codeHash;
              tree[key] = entry;
            }
          });
          value = tree;
        }
        return callback(null, value);
      });
    }
  });

  function shouldHandle(path, entry) {
    return entry && (entry.mode === modes.tree ||
           modes.isFile(entry.mode) && /\.js$/i.test(path));
  }

  function compile(path, blob, callback) {
    var prefix = pathJoin(req.paths.rule, "..", req.base || ".");
    var js = binary.toUnicode(blob);

    var full = req.paths.full;
    var localPath = prefix ? full.substring(prefix.length + 1) : full;
    js = "(function(){var define = window.forgeDefiner(" + JSON.stringify(localPath) + ");" +
      js + ";define = window.define;}());";
    // return;
    // var length = deps.length;
    // var paths = new Array(length);
    // var full = req.paths.full;
    // var localPath = prefix ? full.substring(prefix.length + 1) : full;
    // var base = localPath.substring(0, localPath.lastIndexOf("/"));

    // for (var i = length - 1; i >= 0; i--) {
    //   var dep = deps[i];
    //   var depPath = dep.name[0] === "." ? pathJoin(base, dep.name) : dep.name;
    //   if (!(/\.[^\/]+$/.test(depPath))) depPath += ".js";
    //   paths[i] = depPath;
    //   js = js.substr(0, dep.offset) + depPath + js.substr(dep.offset + dep.name.length);
    // }
    // js = "define(" + JSON.stringify(localPath) + ", " +
    //     JSON.stringify(paths) + ", function (module, exports) { " +
    //     js + "\n});\n";
    callback(null, binary.fromUnicode(js));
  }
}
