"use strict";

var forge = window.forge;
var bodec = require('bodec');
var rsa = forge.rsa;
var pki = forge.pki;
var pem = localStorage.getItem("encryptedPrivateKey");
var password, privateKey, publicKey;
if (!pem) {
  document.body.innerHTML =
  '<h1>Generating RSA keypair for this environment</h1>' +
  '<img src="img/spinner.gif">';

  // generate an RSA key pair asynchronously (uses web workers if available)
  // use workers: -1 to run a fast core estimator to optimize # of workers
  rsa.generateKeyPair({bits: 2048, workers: 2}, function(err, keypair) {
    privateKey = keypair.privateKey;
    publicKey = keypair.publicKey;
    document.body.textContent = "Key Generated!";
    var password, password2;
    do {
      password = getVariable("password", "Enter passphrase to secure private key");
      if (!password) return;
      password2 = getVariable("password", "Enter same passphrase to verify");
      if (!password2) return;
    } while (password !== password2);
    var pem = pki.encryptRsaPrivateKey(privateKey, password);

    // Let's also generate a symmetric key for encrypting the filesystem.
    var key = forge.random.getBytesSync(16);

    // Store and reload.
    localStorage.setItem("encryptedPrivateKey", pem);
    localStorage.setItem("publicKey", pki.publicKeyToPem(publicKey));
    localStorage.setItem("encryptedKey", forge.util.encode64(publicKey.encrypt(key)));
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


password = getVariable("password", "Enter passphrase to unlock private key");
if (!password) return;

try {
  // Decrypt private key
  privateKey = pki.decryptRsaPrivateKey(pem, password);
  // Extract public key
  publicKey = pki.setRsaPublicKey(privateKey.n, privateKey.e);
  if (localStorage.getItem("publicKey") !== pki.publicKeyToPem(publicKey)) {
    throw new Error("RSA Key decryption failure");
  }
  // Decrypt aesKey
  var key = privateKey.decrypt(forge.util.decode64(
    localStorage.getItem("encryptedKey")));
  if (key.length !== 16) throw new Error("AES Key Decryption Failure");
}
catch (err) {
  if (window.confirm("There seems to be a problem reading your data.\nShall I reset all state and start over?")) {
    localStorage.clear();
    window.location.reload();
  }
  throw err;
}

function encrypt(plain) {
  var iv = forge.random.getBytesSync(16);
  var cipher = forge.aes.createEncryptionCipher(key, 'CBC');
  cipher.start(iv);
  cipher.update(forge.util.createBuffer(plain));
  cipher.finish();
  var encrypted = cipher.output;
  return bodec.fromRaw(iv + encrypted.bytes());
}

function decrypt(encrypted) {
  var iv = bodec.toRaw(encrypted, 0, 16);
  var cipher = forge.aes.createDecryptionCipher(key, 'CBC');
  cipher.start(iv);
  cipher.update(forge.util.createBuffer(bodec.slice(encrypted, 16)));
  cipher.finish();
  var decrypted = cipher.output;
  return bodec.fromRaw(decrypted.bytes());
}

module.exports = {
  publicKey: publicKey,
  privateKey: privateKey,
  key: key,
  encrypt: encrypt,
  decrypt: decrypt
};
