"use strict";

var util = require('util');
var fs = require('fs');
var yaml = require('js-yaml');

var Parser = require('../src/parser');
var Read = require('../src/reader');
var FStruct = require('../src/types').FStruct;
var Nothing = require('../src/types').Nothing;

var grammar = Read.PCFG(yaml.safeLoad(fs.readFileSync('english.pcfg.yml')));
var sentences = fs.readFileSync('sentences.txt', 'utf8').split('\n');

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
        for (var i = 0; i<parse.length; i++) {
            detail += ' '+FStruct.get(parse[0].node, 'symbol').s +
                      '('+FStruct.get(parse[0].node, 'prob') +')';
        }
        console.log(detail);
    }
}

for (var i=0; i<sentences.length; i++) {
    test(i);
}
