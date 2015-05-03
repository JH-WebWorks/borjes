"use strict";

var util = require('util');

var Parser = require('./parser');
var English = require('./english');

var p = new Parser(English);

function test(i) {
    var sentence = English.tests[i].split(' ');
    var parse = p.parse(sentence);
    if (!parse[0]) {
        console.log("Wrong parse for '"+English.tests[i]+"'");
        console.log(util.inspect(p.table, { depth: null, colors: true }));
    } else {
        console.log("OK '"+English.tests[i]+"'");
        console.log(parse[0].node+'');
    }
}

for (var i=0; i<English.tests.length; i++) {
    test(i);
}
