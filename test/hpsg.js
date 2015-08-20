"use strict";

var util = require('util');
var fs = require('fs');
var Borjes = require('../src/index');

var Grammar = Borjes.grammar;

var grammarfile = process.argv[2];

var grammar = Grammar();

Grammar.HPSG(grammar, fs.readFileSync(grammarfile));

console.log(util.inspect(grammar));
