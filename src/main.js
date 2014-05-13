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
    document.body.textContent = "Key Generated!";
    var password, password2;
    do {
      password = getVariable("password", "Enter passphrase to secure private key");
      if (!password) return;
      password2 = getVariable("password", "Enter same passphrase to verify");
      if (!password2) return;
    } while (password !== password2);
    var pem = pki.encryptRsaPrivateKey(privateKey, password);
    console.log(pem);
    localStorage.setItem("pem", pem);
    window.location.reload();
  });
  return;
}

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



var pem = localStorage.getItem("pem");
password = getVariable("password", "Enter passphrase to unlock private key");
if (!password) return;

privateKey = pki.decryptRsaPrivateKey(pem, password);
var publicKey = pki.setRsaPublicKey(privateKey.n, privateKey.e);

document.body.textContent = "Private key loaded and decrypted from localStorage!";
console.log(pki.publicKeyToPem(publicKey));


var repo = {};
require('js-git/mixins/mem-db')(repo);

console.log("REPO", repo);