
var bodec = require('bodec');
var keys = require('keys');
var forge = window.forge;

var storage = {};
require('js-git/mixins/indexed-db')(storage, "encfs");
require('js-git/mixins/path-to-entry')(storage);
require('js-git/mixins/create-tree')(storage);
require('js-git/mixins/mem-cache')(storage);
require('js-git/mixins/formats')(storage);

var rootTree;
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
    console.log("in", {
      iv: iv,
      encrypted: encrypted
    });
    return bodec.fromRaw(iv + encrypted);
  },
  decrypt: function (encrypted) {
    var cipher = forge.aes.createDecryptionCipher(keys.key, 'CBC');
    var iv = bodec.toRaw(encrypted, 0, 16);
    encrypted = bodec.toRaw(encrypted, 16);
    console.log("out", {
      iv: iv,
      encrypted: encrypted
    });
    cipher.start(iv);
    cipher.update(forge.util.createBuffer(encrypted));
    cipher.finish();
    return bodec.fromRaw(cipher.output.bytes());
  },
  getRootTree: function (callback) {
    if (rootTree) return callback(null, rootTree);
    storage.readRef("refs/heads/master", function (err, hash) {
      if (!hash) return callback(err);
      storage.loadAs("commit", hash, function (err, commit) {
        if (!commit) return callback(err);
        callback(null, commit.tree);
      });
    });
  },
  setRootTree: function (hash, callback) {
    rootTree = hash;
    storage.saveAs("commit", {
      tree: hash,
      author: {
        name: "JS-Git",
        email: "js-git@creationix.com"
      },
      message: "Auto commit to update fs image"
    }, function (err, hash) {
      if (!hash) return callback(err);
      storage.updateRef("refs/heads/master", hash, callback, true);
    });
  }
});

// fs.writeFile("path/to/file", bodec.fromUnicode("Hello"), function (err) {
//   if (err) throw err;
//   console.log("written");
//   fs.readFile("path/to/file", function (err, data) {
//     if (err) throw err;
//     console.log("READ", bodec.toUnicode(data));
//   });
// });

var repo = { rootPath: "" };
require('js-git/mixins/fs-db')(repo, fs);
require('js-git/mixins/create-tree')(repo);
require('js-git/mixins/formats')(repo);

module.exports = function (callback) {
  require('js-git/mixins/indexed-db').init(function (err) {
    if (err) return callback(err);
    callback(null, repo, fs);
  });
};
