"use strict";

var types = require('./types');
var unify = require('./unify');

var Rule = require('./rule');
var Principle = require('./principle');
var Lexicon = require('./lexicon');
var Grammar = require('./grammar');

var World = types.World;
var Literal = types.Literal;

function from_JSON (grammar, json) {

    if (json.global.signature) {
        types.Lattice.fromProto(json.global.signature, 'signature');
    }

    if (json.lexicon) {
        var l = grammar.lexicon;
        for (var i=0; i<json.lexicon.length; i++) {
            var paradigm = json.lexicon[i];
            var common = paradigm.common;
            for (var j=0; j<paradigm.values.length; j++) {
                var value = paradigm.values[j][3];
                var regex = new RegExp(paradigm.values[j][0]);
                var subst = paradigm.values[j][1];
                var guard = paradigm.values[j][2];
                var morphology = function (lexeme) {
                    var u = unify(guard, lexeme[1]);
                    if (types.eq(u, types.Nothing)) { return []; }
                    var w = types.copy(common);
                    var m = lexeme[0].replace(regex, subst);
                    World.set(w, 0, Literal(lexeme[0]));
                    World.set(w, 1, Literal(m));
                    for (var i=2; i<lexeme.length; i++) {
                        World.set(w, i, lexeme[i]);
                    }
                    var v = types.copy(value);
                    World.bind(w, v);
                    return [[m, types.normalize(v)]];
                }
                Lexicon.inflect(l, morphology, paradigm.lexemes);
            }
        };
    }

    if (json.rules) {
        json.rules.forEach(function (rule) {
            Grammar.set_rule(grammar, rule);
        });
    }

    if (json.principles) {
        json.principles.forEach(function (pple) {
            Grammar.set_principle(grammar, pple);
        });
    }

}

module.exports = from_JSON;
