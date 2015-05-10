"use strict";

var types = require('./types');
var Rule = require('./rule');
var Lexicon = require('./lexicon');

var Literal = types.Literal;
var FStruct = types.FStruct;

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

exports.LCFG = function ( cfg ) {

    var grammar = { rules: [], lexicon: Lexicon() };

    function lexr (rule, daughters, mother) {
        FStruct.set(mother, 'lex', FStruct.get(daughters[1], 'lex'));
    }

    function lexl (rule, daughters, mother) {
        FStruct.set(mother, 'lex', FStruct.get(daughters[0], 'lex'));
    }

    Object.keys(cfg.Rules).forEach(function (NT) {
        var mother = FStruct({ 'symbol': Literal(NT) });
        grammar.rules = grammar.rules.concat(cfg.Rules[NT].map(function(terms) {
            var children = terms.split(' ');
            var prob = 0;
            var i;
            for (i=0; i<children.length-1; i++) {
                children[i] = FStruct({ 'symbol': Literal(children[i]) });
            }
            var rs = /^\((r|l)\)$/.exec(children[i]);
            children.pop();
            return Rule(mother, children, undefined, { success: rs[1]=='r'?lexr:lexl });
        }));
    });

    Object.keys(cfg.Lexicon).forEach(function (NT) {
        var cat = Literal(NT);
        cfg.Lexicon[NT].forEach(function (term) {
            Lexicon.add(grammar.lexicon, term, FStruct({ symbol: cat, lex: term }));
        });
    });

    return grammar;
};

exports.PCFG = function ( cfg ) {

    var grammar = { rules: [], lexicon: Lexicon() };

    function mProb (rule, daughters, mother) {
        FStruct.set(mother, 'prob', daughters.reduce(function(p, d) {
            return p*FStruct.get(d, 'prob');
        }, FStruct.get(mother, 'prob')));
    }

    Object.keys(cfg.Rules).forEach(function (NT) {
        grammar.rules = grammar.rules.concat(cfg.Rules[NT].map(function(terms) {
            var children = terms.split(' ');
            var prob = 1;
            for (var i=0; i<children.length; i++) {
                if (i==children.length-1) {
                    var rs = /^\((.+)\)$/.exec(children[i]);
                    if (rs) {
                        prob = parseFloat(rs[1]);
                        children.pop();
                        break;
                    }
                }
                children[i] = FStruct({ 'symbol': Literal(children[i]) });
            }
            var mother = FStruct({ 'symbol': Literal(NT), prob: prob });
            return Rule(mother, children, undefined, { success: mProb });
        }));
    });

    Object.keys(cfg.Lexicon).forEach(function (NT) {
        var cat = Literal(NT);
        cfg.Lexicon[NT].forEach(function (term) {
            var rs = /^(.+)\((.+)\)$/.exec(term);
            var prob = 1;
            if (rs) {
                term = rs[1];
                prob = parseFloat(rs[2]);
            }
            Lexicon.add(grammar.lexicon, term, FStruct({ symbol: cat, prob: prob }));
        });
    });

    return grammar;
};
