"use strict";

var types = require('./types');
var Rule = require('./rule');
var Lexicon = require('./lexicon');
var parse_pars = require('./parenthesis');

var Literal = types.Literal;
var FStruct = types.FStruct;
var Variable = types.Variable;
var World = types.World;
var Predicate = types.Predicate;

exports.CFG = function ( cfg ) {

    function make_vars ( obj, world, names ) {
        if (obj.length == 1) { // variable
            var n = obj[0];
            if (!names[n]) {
                names[n] = Variable(world);
            }
            return names[n];
        } else { // predicate
            var params = obj.slice(1).map(function (o) {
                return make_vars(o, world, names);
            });
            return Predicate(obj[0], params);
        }
    }

    function parse_symbol ( string, world, names ) {
        var ps = parse_pars(string);
        var symbol = FStruct({ 'symbol': Literal(ps[0]) });
        if (ps.length>1) {
            for (var i=1; i<ps.length; i++) {
                FStruct.set(symbol, i-1, make_vars(ps[i], world, names));
            }
        }
        return symbol;
    }

    var grammar = { rules: [], lexicon: Lexicon() };

    Object.keys(cfg.Rules).forEach(function (NT) {
        grammar.rules = grammar.rules.concat(cfg.Rules[NT].map(function(terms) {
            var w = World();
            var names = {};
            var mother = parse_symbol(NT, w, names);
            var children = terms.split(' ');
            var daughters = [];
            for (var i=0; i<children.length; i++) {
                daughters.push(parse_symbol(children[i], w, names));
            }
            World.bind(w, mother);
            return Rule(mother, daughters);
        }));
    });

    Object.keys(cfg.Lexicon).forEach(function (NT) {
        var cat = Literal(NT);
        Lexicon.inflect(grammar.lexicon,
                        function (term) {
                            var fs = parse_pars(term);
                            var r = FStruct({ symbol: cat, '0': fs[0] });
                            for (var j=1; j<fs.length; j++) {
                                FStruct.set(r, j, fs[j][0]);
                            }
                            return [[ fs[0], r ]];
                        },
                        cfg.Lexicon[NT]);
    });

    return grammar;
};
