"use strict";

/**
 * This module provides the Rule object.
 *
 * @exports Rule
 */

var types = require('./types');
var unify = require('./unify');

var Nothing = types.Nothing;
var World = types.World;
var eq = types.eq;
var copy = types.copy;

/**
 * A rule has a number of daughters, which if matched produce the mother. It is
 * used for context-free parsing.
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
    return {
        /** The tag is *rule* */
        borjes: 'rule',
        /** @type {Borjes[]} */
        d: daughters,
        /** @type {Borjes} */
        m: mother,
        /** @type {String} */
        name: name || "Rule",
        /**
         * Callbacks for the rule, has *fail* and *success*
         * @type {Object}
         */
        on: events || {},
        /** number of daughters */
        arity: daughters.length
    };
}

/**
 * Tries to unify a rule's daughters with some objects.
 *
 * @param {Rule} rule - the rule to apply.
 * @param {Borjes[]} xs - the objects to try to unify with the daughters.
 * @return {Borjes|Nothing} if the rule is matched, then the mother is returned.
 * Otherwise, Nothing is returned.
 */
Rule.apply ( rule, xs ) {
    if (xs.length != rule.d.length) {
        if (!!rule.on.fail) { rule.on.fail(rule, xs, -1); }
        return Nothing;
    }
    var w = World();
    var lm = { w: rule.m.borjes_bound, nw: w };
    for (var i=0; i<xs.length; i++) {
        var u = unify(rule.d[i], xs[i], w, lm, { w: xs[i].borjes_bound, nw: w });
        if (eq(u, Nothing)) {
            if (!!rule.on.fail) { rule.on.fail(rule, xs, i); }
            return Nothing;
        }
    }
    var m = copy(rule.m, lm);
    if (!!rule.on.success) { rule.on.success(rule, xs, m); }
    return m;
}

module.exports = Rule;
