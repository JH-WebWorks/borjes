"use strict";

var types = require('./types');
var Rule = require('./rule');
var Lexicon = require('./lexicon');

var Literal = types.Literal;

exports.CFG = function ( cfg ) {

    var grammar = { rules: [], lexicon: Lexicon() };

    Object.keys(cfg.Rules).forEach(function (NT) {
        var mother = Literal(NT);
        grammar.rules = grammar.rules.concat(cfg.Rules[NT].map(function(terms) {
            var children = terms.split(' ').map(function(x) {
                return Literal(x);
            });
            return Rule(mother, children);
        }));
    });

    Object.keys(cfg.Lexicon).forEach(function (NT) {
        Lexicon.inflect.call(undefined, grammar.lexicon, Literal(NT), cfg.Lexicon[NT]);
    });

    return grammar;
};
