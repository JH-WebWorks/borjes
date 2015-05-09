"use strict";

var types = require('./common');
var unify = require('./unify');

var Nothing = types.Nothing;

function Principle ( antecedent, consequent, name, events ) {
    return {
        a: antecedent,
        c: consequent,
        name: name || "Principle",
        on: events || {}
    };
}

function apply ( ppl, x ) {
    var u = unify(ppl.a, x);
    if (u === Nothing) {
        if (!!ppl.on.false_antecedent) { ppl.on.false_antecedent(ppl, x); }
        else if (!!ppl.on.success) { ppl.on.success(ppl, x); }
        return x;
    }
    var r = unify(u, ppl.c);
    if (r === Nothing && !!ppl.on.fail) { ppl.on.fail(ppl, x); }
    if (r !== Nothing && !!ppl.on.success) { ppl.on.success(ppl, x); }
    return r;
};

Principle.apply = apply;
module.exports = Principle;
