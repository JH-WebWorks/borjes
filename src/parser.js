"use strict";

var types = require('./types');
var Tree = require('./tree');
var Rule = require('./rule');

var Nothing = types.Nothing;
var eq = types.eq;

function Parser ( grammar ) {
    return {
        borjes: 'parser',
        rules: grammar.rules,
        lexicon: grammar.lexicon,
        table: [],
        n: 0
    }
}

function all_matches ( p, a_x, a_y, b_x, b_y ) {
    var a = p.table[a_x][a_y];
    var b = p.table[b_x][b_y];
    var matches = [];
    for (var i = 0; i<a.length; i++) {
        for (var j = 0; j<b.length; j++) {
            matches.push([a[i], b[j]]);
        }
    }
    return matches;
}

function all_legs ( p, from, to, n ) {
    if (n!=2) { throw "Non-binary rules not supported"; }
    var legs = [];
    for (var i = to-1; i >= 0; i--) {
        legs = legs.concat(all_matches(p, from, i, from+i+1, to-(i+1)));
    }
    return legs;
};

function exhaust ( p, from, to ) {
    p.table[from][to] = [];
    var cell = p.table[from][to];
    for (var i = 0; i<p.rules.length; i++) {
        var rule = p.rules[i];
        var legs = all_legs(p, from, to, rule.arity);
        for (var j = 0; j<legs.length; j++) {
            var mother = Rule.apply(rule, legs[j].map(function(t) {
                return t.node;
            }));
            if (mother !== Nothing) {
                cell.push(Tree(mother, legs[j]));
            }
        }
    }
};

function input ( p, word ) {
    var w = p.lexicon[word];
    if (w === undefined) { w = Nothing; }
    var wordt = Tree(word);
    if (!w.length) {
        p.table[p.n] = [[ Tree(w, wordt) ]];
    } else {
        p.table[p.n] = [];
        p.table[p.n][0] = w.map(function(x) {
            return Tree(x, wordt);
        });
    }
    for (var i = p.n-1; i>=0; i--) {
        exhaust(p, i, p.n-i);
    }
    p.n++;
};

function parse ( p, sentence ) {
    if (p.borjes !== 'parser') {
        p = Parser(p);
    } else {
        reset(p);
    }
    for (var i = 0; i<sentence.length; i++) {
        input(p, sentence[i]);
    }
    var top = p.table[0][p.n-1];
    if (top.length === 0) { return Nothing; }
    else { return top; }
};

function reset ( p ) {
    p.table = [];
    p.n = 0;
};

Parser.reset = reset;
Parser.input = input;
Parser.parse = parse;
module.exports = Parser;
