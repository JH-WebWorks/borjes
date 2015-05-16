"use strict";

var types = require('./types');
var unify = require('./unify');

var Nothing = types.Nothing;
var World = types.World;
var eq = types.eq;
var copy = types.copy;

function Rule ( mother, daughters, name, events ) {
    return {
        borjes: 'rule',
        d: daughters,
        m: mother,
        name: name || "Rule",
        on: events || {},
        arity: daughters.length
    };
}

function apply ( rule, xs ) {
    if (xs.length != rule.d.length) {
        if (!!rule.on.fail) { rule.on.fail(rule, xs, -1); }
        return Nothing;
    }
    var w = copy(rule.m.borjes_bound);
    var lm = { w: rule.m.borjes_bound, nw: w };
    for (var i=0; i<xs.length; i++) {
        var u = unify(rule.d[i], xs[i], w, lm, { w: xs[i].borjes_bound, nw: w });
        if (eq(u, Nothing)) {
            if (!!rule.on.fail) { rule.on.fail(rule, xs, i); }
            return Nothing;
        }
    }
    var m = copy(rule.m, lm);
    World.bind(w, m);
    if (!!rule.on.success) { rule.on.success(rule, xs, m); }
    return m;
}

Rule.apply = apply;
module.exports = Rule;
