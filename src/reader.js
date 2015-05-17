"use strict";

var types = require('./types');
var Rule = require('./rule');
var Lexicon = require('./lexicon');
var parse_pars = require('./parenthesis');
var yaml = require('js-yaml');

var Literal = types.Literal;
var FStruct = types.FStruct;
var Variable = types.Variable;
var World = types.World;
var Predicate = types.Predicate;

var YamlPredicate = new yaml.Type('!js/function', {
    kind: 'scalar',
    resolve: function (data) { return data !== null; },
    construct: function (data) {
        return new Function(data);
    }
});

var BORJES_SCHEMA = new yaml.Schema({
    include: [ yaml.DEFAULT_SAFE_SCHEMA ],
    explicit: [ YamlPredicate ]
});

exports.CFG = function ( description ) {

    var cfg = yaml.load(description, { schema: BORJES_SCHEMA });

    function parse_vars ( obj, world, names, dont_create_vars ) {
        if (obj.length == 1) { // variable or literal
            var n = obj[0];
            if (names[n]) {
                return names[n];
            } else if (dont_create_vars) {
                return n;
            } else {
                names[n] = Variable(world);
                return names[n];
            }
        } else { // predicate
            var params = obj.slice(1).map(function (o) {
                return parse_vars(o, world, names, dont_create_vars);
            });
            return Predicate(obj[0], params);
        }
    }

    function parse_symbol ( string, world, names, dont_create_vars ) {
        var ps = parse_pars(string);
        var symbol = FStruct({ 'symbol': Literal(ps[0]) });
        if (ps.length>1) {
            for (var i=1; i<ps.length; i++) {
                FStruct.set(symbol, i-1, parse_vars(ps[i], world, names, dont_create_vars));
            }
        }
        return symbol;
    }

    var grammar = { rules: [], lexicon: Lexicon() };

    var preds = cfg.Predicates;
    if (preds) {
        Object.keys(preds).forEach(function (name) {
            Predicate.create(name, preds[name]);
        });
    }

    Object.keys(cfg.Rules).forEach(function (NT) {
        grammar.rules = grammar.rules.concat(cfg.Rules[NT].map(function(terms) {
            var w = World();
            var names = {};
            var children = terms.split(' ');
            var daughters = [];
            for (var i=0; i<children.length; i++) {
                daughters.push(parse_symbol(children[i], w, names));
            }
            var mother = parse_symbol(NT, w, names, true);
            World.bind(w, mother);
            return Rule(mother, daughters);
        }));
    });

    Object.keys(cfg.Lexicon).forEach(function (NT) {
        Lexicon.inflect(grammar.lexicon, function (term) {
            var fs = parse_pars(term);
            var par = parse_pars(NT);
            var r = FStruct({ symbol: Literal(par[0]) });
            for (var j=1; j<par.length; j++) {
                var i = par[j][0];
                var v = i>0?(fs[i]?fs[i][0]:undefined):fs[0];
                FStruct.set(r, j-1, v);
            }
            return [[ fs[0], r ]];
        }, cfg.Lexicon[NT]);
    });

    return grammar;
};
