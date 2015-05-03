"use strict";

var types = require('./common');
var Nothing = types.Nothing;

function Parser ( grammar ) {
    this.rules = grammar.rules;
    this.lexicon = grammar.lexicon;
    this.table = [];
    this.n = 0;
}

Parser.prototype.all_matches = function (a_x, a_y, b_x, b_y) {
    var a = this.table[a_x][a_y];
    var b = this.table[b_x][b_y];
    var matches = [];
    for (var i = 0; i<a.length; i++) {
        for (var j = 0; j<b.length; j++) {
            matches.push([a[i], b[j]]);
        }
    }
    return matches;
};

Parser.prototype.all_legs = function ( from, to, n ) {
    if (n!=2) { throw "Non-binary rules not supported"; }
    var legs = [];
    for (var i = to-1; i >= 0; i--) {
        legs = legs.concat(this.all_matches(from, i, from+i+1, to-(i+1)));
    }
    return legs;
};

Parser.prototype.exhaust = function ( from, to ) {
    this.table[from][to] = [];
    var cell = this.table[from][to];
    for (var i = 0; i<this.rules.length; i++) {
        var rule = this.rules[i];
        var legs = this.all_legs(from, to, rule.arity);
        for (var j = 0; j<legs.length; j++) {
            var mother = rule.apply(legs[j]);
            if (mother !== Nothing) {
                cell.push(mother);
            }
        }
    }
};

Parser.prototype.input = function ( word ) {
    var w = this.lexicon[word];
    this.table[this.n] = [ [ w ] ];
    for (var i = this.n-1; i>=0; i--) {
        this.exhaust(i, this.n-i);
    }
    this.n++;
};

Parser.prototype.parse = function ( sentence ) {
    for (var i = 0; i<sentence.length; i++) {
        this.input ( sentence[i] );
    }
    var top = this.table[0][this.n-1];
    if (top.length === 0) { return Nothing; }
    else { return top; }
};

Parser.prototype.reset = function () {
    this.table = [];
    this.n = 0;
};

module.exports = Parser;
