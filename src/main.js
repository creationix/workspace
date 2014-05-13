"use strict";

// var run = require('gen-run');

// run(function* () {
//   for (var i = 0; i < 10; i++) {
//     console.log(i);
//     yield sleep(400);
//   }
//   console.log(i);
// });

// function sleep(ms) {
//   return function (callback) {
//     setTimeout(callback, ms);
//   };
// }

var rsa = window.forge.rsa;
var pki = window.forge.pki;
var pem = localStorage.getItem("pem");
if (!pem) {
  document.body.innerHTML =
  '<h1>Generating RSA keypair for this environment</h1>' +
  '<img src="img/spinner.gif">';

  // generate an RSA key pair asynchronously (uses web workers if available)
  // use workers: -1 to run a fast core estimator to optimize # of workers
  rsa.generateKeyPair({bits: 2048, workers: -1}, function(err, keypair) {
    localStorage.setItem("pem", pki.privateKeyToPem(keypair.privateKey));
    document.body.textContent = "Done! Reloading...";
    window.location.reload();
  });
  return;
}

document.body.textContent = "Private key loaded from localStorage!";
console.log("pem", pem);


var repo = {};
require('js-git/mixins/mem-db')(repo);

console.log("REPO", repo);