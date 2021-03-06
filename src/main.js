"use strict";
var modes = require('js-git/lib/modes');
require('repo')(function (err, repo, fs) {
  if (err) throw err;

  repo.createTree([
    {
      path: "www/index.html",
      mode: modes.blob,
      content: "<html><head><title>Test!</title></head><body><h1>Test!</h1></body></html>"
    }
  ], function (err, hash) {
    if (err) throw err;
    console.log("TREE HASH", hash);
    repo.saveAs("commit", {
      tree: hash,
      author: {
        name: "Tim Caswell",
        email: "tim@creationix.com"
      },
      message: "Initial commit"
    }, function (err, hash) {
      if (err) throw err;
      repo.updateRef("refs/heads/master", hash, function (err) {
        if (err) throw err;
        console.log("DONE");
      });
    });
  });
});

return;

// run(function* () {
//   // Initialize the idb mixin module.
//   yield require('js-git/mixins/indexed-db').init();

//   // Create a local idb backed repo
//   var storage = {};
//   require('js-git/mixins/indexed-db')(storage, "storage");
//   require('js-git/mixins/mem-cache')(storage);
//   require('js-git/mixins/create-tree')(storage);
//   require('js-git/mixins/formats')(storage);
//   var encFs = makeFs(storage, {
//     getRootHash: function () {
//       return localStorage.getItem("root");
//     },
//     setRootHash: function (hash) {
//       localStorage.setItem("root", hash);
//     },
//     encrypt: encrypt,
//     decrypt: function (encrypted) {
//     }
//   })
// });






// var keys = require('keys');
// var pki = window.forge.pki;




// var storage = {};
// var cache = require('js-git/mixins/mem-cache').cache;

// var modes = require('js-git/lib/modes');

// var writeQueue = [];

// var fs = {
//   readFile: function (path, callback) {
//     console.log("CACHE", cache);
//     console.error("TODO: readFile " + path);
//     return callback();
//   },
//   readDir: function (path, callback) {
//     console.error("TODO: readDir " + path);
//     return callback();
//   },
//   writeFile: function (path, buffer, callback) {
//     console.log("writeFile", path);
//     writeQueue.push({
//       entry: {
//         path: path,
//         mode: modes.blob,
//         content: buffer
//       },
//       callback: callback
//     });
//     check();
//   }
// };

// var flushing = false;
// function check() {
//   console.log("CHECK", flushing, writeQueue.length)
//   if (flushing || !writeQueue.length) return;
//   flushing = true;
//   var entries = {};
//   var callbacks = [];
//   writeQueue.splice(0, writeQueue.length).forEach(function (pair) {
//     var entry = pair.entry;
//     callbacks.push(pair.callback);
//     // Use an object to compact multiple updates to the same path.
//     entries[entry.path] = entry;
//   });
//   // Convert back to an array.
//   entries = Object.keys(entries).map(function (path) {
//     return entries[path];
//   });
//   console.log("Writing entries", entries);

//   repo.readRef("refs/heads/master", function (err, head) {
//     console.log("old master", err, head)
//     if (err) return callback(err);
//     if (head) entries.base = head;
//     console.log("Creating tree", entries);
//     repo.createTree(entries, function (err, treeHash) {
//       console.log("new tree", err, treeHash)
//       if (err) return callback(err);
//       var commit = {
//         tree: treeHash,
//         author: {
//           name: "Autocommit",
//           email: "auto@commit"
//         },
//         message: "Write " + entries.length + " file(s)."
//       };
//       if (head) commit.parent = head;
//       console.log("Writing commit", commit);
//       repo.saveAs("commit", commit, function (err, newHash) {
//         console.log("oncommit", err, newHash);
//         repo.updateRef("refs/heads/master", newHash, callback);
//       });
//     });
//   });

//   function callback() {
//     if (!callbacks) throw new Error("Callbacks already called");
//     var fns = callbacks;
//     callbacks = null;
//     for (var i = 0, l = fns.length; i < l; i++) {
//       try {
//         fns[i].apply(null, arguments);
//       }
//       catch (err) {
//         console.error(err.stack);
//       }
//     }
//     flushing = false;
//     // Check again to see if any new writes queued while we were writing.
//     check();
//   }
// }

// var repo = { rootPath: "" };
// require('js-git/mixins/fs-db')(repo, fs);
// require('js-git/mixins/create-tree')(repo);
// require('js-git/mixins/formats')(repo);


// // function* map(array, fn) {
// //   for (var i = 0, l = array.length; i < l; i++) {
// //     yield* fn(array[i], i, array);
// //   }
// // }


// // var hash = yield repo


// // document.body.appendChild(dombuilder([
// //   ["h1", "System Crypto Initialized"],
// //   ["pre", pki.publicKeyToPem(keys.publicKey)],
// //   ["h2", "Installed Apps"],
// //   ["ul.grid", yield* map(yield fs.readAs("array"))
// //     ["li.blue",
// //       ["i.app.fa.fa-shopping-cart"],
// //       ["p", "Marketplace"]
// //     ],
// //     ["li.green",
// //       ["i.app.fa.fa-gamepad"],
// //       ["p", "Games"]
// //     ],
// //     ["li.red",
// //       ["i.app.fa.fa-film"],
// //       ["p", "Movies"]
// //     ],
// //     ["li.orange",
// //       ["i.app.fa.fa-btc"],
// //       ["p", "Bitcoins"]
// //     ],
// //     ["li.grey",
// //       ["i.app.fa.fa-rocket"],
// //       ["p", "Workshop"]
// //     ]
// //   ]
// // ]));