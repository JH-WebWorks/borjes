"use strict";

var util = require('util');
var fs = require('fs');
var yaml = require('js-yaml');

var Parser = require('../src/parser');
var Read = require('../src/reader');
var types = require('../src/types');
var FStruct = types.FStruct;
var Nothing = types.Nothing;
var World = types.World;


var grammar = Read.ECFG(yaml.safeLoad(fs.readFileSync('english.epcfg.yml')));
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
        for (var j = 0; j<parse.length; j++) {
            var pn = parse[j].node;
            var head = World.resolve(pn.borjes_bound, FStruct.get(pn, '0'));
            var prob = World.resolve(pn.borjes_bound, FStruct.get(pn, '1'));
            detail += ' '+FStruct.get(pn, 'symbol').s + '(' + head+','+prob +')';
        }
        console.log(detail);
    }
}

for (var i=0; i<sentences.length; i++) {
    test(i);
}
