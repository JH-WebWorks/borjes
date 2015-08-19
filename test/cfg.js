"use strict";

var util = require('util');
var fs = require('fs');
var Borjes = require('../src/index');


var Parser = Borjes.parser;
var Grammar = Borjes.grammar;
var types = Borjes.types;
var FStruct = types.FStruct;
var Nothing = types.Nothing;
var World = types.World;

var formatter = Borjes.formatter;

var grammarfile = process.argv[2];
var testfile = process.argv[3];

var grammar = Grammar.CFG(fs.readFileSync(grammarfile));
var sentences = fs.readFileSync(testfile, 'utf8').split('\n');

var p = Parser(grammar);

function test(i) {
    if (sentences[i] === '') { return; }
    var sentence = sentences[i].split(' ');
    var parse = Parser.parse(p, sentence);
    if (parse === Nothing) {
        console.log("Wrong parse for '"+sentences[i]+"'");
        console.log(util.inspect(p.table, { depth: null, colors: true }));
    } else {
        console.log("OK '"+sentences[i]+"'");
        var detail = '';
        for (var j = 0; j<parse.length; j++) {
            detail += ' '+formatter.flist(parse[j].node, 'symbol');
        }
        console.log(detail);
    }
}

for (var i=0; i<sentences.length; i++) {
    test(i);
}
