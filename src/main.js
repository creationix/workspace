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
var password, privateKey;
if (!pem) {
  document.body.innerHTML =
  '<h1>Generating RSA keypair for this environment</h1>' +
  '<img src="img/spinner.gif">';

  // generate an RSA key pair asynchronously (uses web workers if available)
  // use workers: -1 to run a fast core estimator to optimize # of workers
  rsa.generateKeyPair({bits: 2048, workers: 2}, function(err, keypair) {
    privateKey = keypair.privateKey;
    document.body.textContent = "Done!";
    check();
  });
  setTimeout(promptPassword, 100);


  return;
}

function promptPassword() {
  var pass1, pass2;
  do {
    while (pass1 = window.prompt("Enter passphrase to secure private key"), !pass1);
    while (pass2 = window.prompt("Enter same passphrase to verify"), pass2 !== pass2);
  } while (pass1 !== pass2);
  password = pass1;

  check();
}

function check() {
  if (!password || !privateKey) return;
  var pem = pki.encryptRsaPrivateKey(privateKey, password);
  console.log(pem);
  localStorage.setItem("pem", pem);
  window.reload();
}

var pem = localStorage.getItem("pem");
do {
  var password = window.prompt("Enter passphrase to unlock private key");
  privateKey = pki.decryptRsaPrivateKey(pem, password);
} while (!privateKey);
var publicKey = pki.setRsaPublicKey(privateKey.n, privateKey.e);

document.body.textContent = "Private key loaded and decrypted from localStorage!";
console.log(pki.publicKeyToPem(publicKey));


var repo = {};
require('js-git/mixins/mem-db')(repo);

console.log("REPO", repo);