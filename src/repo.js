
var bodec = require('bodec');
var keys = require('keys');
var forge = window.forge;
var defer = require('js-git/lib/defer');

var storage = {};
if (true) { // github mode
  require('js-github/mixins/github-db')(storage, "creationix/test-workspace", getVariable("token"));
  require('js-git/mixins/add-cache')(storage, require('js-git/mixins/indexed-db'));
  // We still need to override createTree in the github backend, it can't handle
  // binary files. (And still may have other bugs on github's side.)
  // require('js-git/mixins/create-tree')(storage);
}
else { // localstorage mode
  require('js-git/mixins/indexed-db')(storage, "encfs");
  require('js-git/mixins/create-tree')(storage);
}
require('js-git/mixins/path-to-entry')(storage);
require('js-git/mixins/mem-cache')(storage);
require('js-git/mixins/formats')(storage);

var rootTree;
var rootTime;
var fs = require('js-git/lib/git-fs')(storage, {
  shouldEncrypt: function (path) {
    // We only want to encrypt the actual blobs
    // Everything else can be plaintext.
    return path.split("/").filter(Boolean)[0] === "objects";
  },
  encrypt: function (plain) {
    var iv = forge.random.getBytesSync(16);
    var cipher = forge.aes.createEncryptionCipher(keys.key, 'CBC');
    cipher.start(iv);
    cipher.update(forge.util.createBuffer(plain));
    cipher.finish();
    var encrypted = cipher.output.bytes();
    return bodec.fromRaw(iv + encrypted);
  },
  decrypt: function (encrypted) {
    var cipher = forge.aes.createDecryptionCipher(keys.key, 'CBC');
    var iv = bodec.toRaw(encrypted, 0, 16);
    encrypted = bodec.toRaw(encrypted, 16);
    cipher.start(iv);
    cipher.update(forge.util.createBuffer(encrypted));
    cipher.finish();
    return bodec.fromRaw(cipher.output.bytes());
  },
  getRootTree: function (callback) {
    if (rootTree) {
      callback(null, rootTree);
      callback = null;
      if (Date.now() - rootTime < 1000) return;
    }
    storage.readRef("refs/heads/master", function (err, hash) {
      if (!hash) return callback(err);
      storage.loadAs("commit", hash, function (err, commit) {
        if (!commit) return callback(err);
        rootTree = commit.tree;
        rootTime = Date.now();
        if (callback) callback(null, commit.tree);
      });
    });
  },
  setRootTree: function (hash, callback) {
    rootTree = hash;
    rootTime = Date.now();
    defer(saveRoot);
    callback();
  }
});

var saving, savedRoot;
function saveRoot() {
  if (saving || savedRoot === rootTree) return;
  saving = rootTree;
  storage.saveAs("commit", {
    tree: rootTree,
    author: {
      name: "JS-Git",
      email: "js-git@creationix.com"
    },
    message: "Auto commit to update fs image"
  }, function (err, hash) {
    if (!hash) return onDone(err);
    storage.updateRef("refs/heads/master", hash, function (err) {
      onDone(err);
    }, true);

    function onDone(err) {
      if (!err) savedRoot = saving;
      saving = false;
      if (err) throw err;
    }
  });

}
// Don't wait for writes to finish.
var writeFile = fs.writeFile;
fs.writeFile = function fastWriteFile(path, value, callback) {
  if (!callback) return fastWriteFile.bind(fs, path, value);
  writeFile.call(fs, path, value, function (err) {
    if (err) console.error(err.stack);
  });
  callback();
};

var repo = { };
require('js-git/mixins/fs-db')(repo, fs);
require('js-git/mixins/create-tree')(repo);
require('js-git/mixins/formats')(repo);

module.exports = function (callback) {
  require('js-git/mixins/indexed-db').init(function (err) {
    if (err) return callback(err);
    callback(null, repo, fs);
  });
};

function getVariable(variable, message) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) == variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  return window.prompt(message || "Please enter " + variable);
}
