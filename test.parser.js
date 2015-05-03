"use strict";

var util = require('util');

var Parser = require('./parser');

var English = require('./english');

var p = new Parser(English);

var parse = p.parse(['john', 'loves', 'mary']);
console.log(parse+'');
console.log(util.inspect(p.table, { depth: null, colors: true }));

p.reset();
parse = p.parse(['john', 'mary', 'loves']);
console.log(parse+'');
console.log(util.inspect(p.table, { depth: null, colors: true }));
