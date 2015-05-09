"use strict";

var types = require('./types');
var Rule = require('./rule');

var Literal = types.Literal;

exports.CFG = function ( cfg ) {

    var grammar = { rules: [], lexicon: {} };

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
        var cat = Literal(NT);
        var l = grammar.lexicon;
        cfg.Lexicon[NT].forEach(function(term) {
            if (l[term] === undefined) { l[term] = []; }
            l[term].push(cat);
        });
    });

    return grammar;
};
