"use strict";

var types = require('./types');
var unify = require('./unify');

var Nothing = types.Nothing;
var World = types.World;
var eq = types.eq;
var copy = types.copy;

/**
 * Creates a new rule.
 *
 * @param {Borjes} mother - the object which should be constructed when the
 * daughters are matched.
 * @param {Borjes[]} daughters - the objects to try to match. If objects are
 * found in the parsing tree which unify with the daughters (in array order)
 * then the rule is successful, and the mother can be deduced.
 * @param {String} [name="Rule"] - an optional string for identifying the rule.
 * @param {Object} [events={}] - callbacks to fire during the rule's application.
 * @param {function} events.fail - if the rule fails to apply (the daughters
 * aren't matched) this function is called with the rule as first parameter, the
 * objects that didn't match as second, and the index of the first daughter that
 * failed as third parameter (if the arity was wrong, this is "-1").
 * @param {function} events.success - this function is called when all daughters
 * are matched successfully. It is passed the rule, the objects that matched,
 * and the constructed mother (with all unification done) as third parameter.
 * @return {Rule} a new rule.
 */
function Rule ( mother, daughters, name, events ) {
    /**
     * A rule has a number of daughters, which if matched produce the mother. It is
     * used for context-free parsing.
     *
     * @typedef Rule
     * @property {String} borjes - 'rule'
     * @property {Borjes[]} daughters
     * @property {Borjes} mother
     * @property {String} name
     * @property {Object} on - Callbacks for the rule
     * @property {function} on.fail
     * @property {function} on.success
     * @property {Number} arity - number of daughters
     */
    return {
        borjes: 'rule',
        d: daughters,
        m: mother,
        name: name || "Rule",
        on: events || {},
        arity: daughters.length
    };
}

/**
 * Tries to unify a rule's daughters with some objects.
 *
 * @param {Rule} rule - the rule to apply.
 * @param {Borjes[]} xs - the objects to try to unify with the daughters.
 * @return {Borjes[]} all the possibilities of unification result in a mother in
 * this array. If it's empty, the rule has failed.
 */
Rule.apply = function ( rule, xs ) {
    if (xs.length != rule.d.length) {
        if (!!rule.on.fail) { rule.on.fail(rule, xs, -1); }
        return Nothing;
    }
    var r = [];
    function try_pair (i, ctx) {
        if (i>=xs.length) {
            var m = copy(rule.m, ctx.leftmap);
            r.push(m);
            if (!!rule.on.success) { rule.on.success(rule, xs, m); }
        } else {
            var us = unify(rule.d[i], xs[i], true, ctx);
            us.forEach(function (u) {
                try_pair(i+1, {newworld: u.ux.newworld, leftmap: u.ux.leftmap});
            });
        }
    }
    var nw = World();
    try_pair(0, {newworld: nw, leftmap: {_w: rule.m.borjes_bound, _nw: nw}});
    if (r.length == 0 && !!rule.on.fail) {
        rule.on.fail(rule, xs, i);
    }
    return r;
}

module.exports = Rule;
