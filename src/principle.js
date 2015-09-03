"use strict";

var types = require('./types');
var unify = require('./unify');

var Nothing = types.Nothing;
var World = types.World;

/**
 * Creates a new principle.
 *
 * @param {Borjes} antecedent
 * @param {Borjes} consequent
 * @param {String} [name="Principle"]
 * @param {Object} [events={}] - callbacks to fire during the principle's application.
 * @param {function} events.false_antecedent
 * @param {function} events.fail
 * @param {function} events.success
 * @return {Principle} a new principle.
 */
function Principle ( antecedent, consequent, name, events ) {
    /**
     * A principle has an antecedent, which if matches forces the object to also
     * match the consequent.
     *
     * @typedef Principle
     * @property {String} borjes - 'principle'
     * @property {Borjes} antecedent
     * @property {Borjes} consequent
     * @property {String} name
     * @property {Object} on - Callbacks for the rule
     * @property {function} on.false_antecedent
     * @property {function} on.fail
     * @property {function} on.success
     */
    return {
        borjes: 'principle',
        a: antecedent,
        c: consequent,
        name: name || "Principle",
        on: events || {}
    };
}

/**
 * Applies the principle to an object.
 *
 * If the object matches (unifies with) the
 * antecedent, then it also must match (unify with) the consequent. Otherwise it
 * is left unchanged.
 * @param {Principle} ppl - the principle to apply.
 * @param {Borjes} x - the object to which to apply the principle.
 * @return {Borjes[]} all the possible consequents to the principle.
 */
Principle.apply = function ( ppl, x ) {
    var u = unify(ppl.a, x, true);
    if (u.length == 0) {
        if (!!ppl.on.false_antecedent) { ppl.on.false_antecedent(ppl, x); }
        else if (!!ppl.on.success) { ppl.on.success(ppl, x); }
        return [x];
    }
    var nw = World();
    var r = [];
    u.forEach(function (u2) {
        var u3 = unify(u2, ppl.c, true, { newworld: u2.ux.newworld, rightmap: u2.ux.leftmap });
        u3.forEach(function (u4) { r.push(u4); });
    });
    if (r.length == 0 && !!ppl.on.fail) { ppl.on.fail(ppl, x); }
    if (r.length > 0 && !!ppl.on.success) { ppl.on.success(ppl, x, r); }
    return r;
};

module.exports = Principle;
