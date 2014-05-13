"use strict";
var keys = require('keys');
var dombuilder = require('dombuilder');
var pki = window.forge.pki;

var repo = {};
require('js-git/mixins/mem-db')(repo);

console.log("REPO", repo);
console.log("KEYS", keys);


document.body.appendChild(dombuilder([
  ["h1", "System Crypto Initialized"],
  ["pre", pki.publicKeyToPem(keys.publicKey)]
]));