"use strict";
var keys = require('keys');

console.log("KEYS", keys);

var repo = {};
require('js-git/mixins/mem-db')(repo);

console.log("REPO", repo);
