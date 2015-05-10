"use strict";

var types = require('./types');
var unify = require('./unify');

var Nothing = types.Nothing;
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
    for (var i=0; i<xs.length; i++) {
        var u = unify(xs[i], rule.d[i]);
        if (eq(u, Nothing)) {
            if (!!rule.on.fail) { rule.on.fail(rule, xs, i); }
            return Nothing;
        }
    }
    var m = copy(rule.m);
    if (!!rule.on.success) { rule.on.success(rule, xs, m); }
    return m;
}

Rule.apply = apply;
module.exports = Rule;
