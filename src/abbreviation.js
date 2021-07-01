"use strict";

var types = require("./types");
var unify = require("./unify");

var Nothing = types.Nothing;
var World = types.World;

/**
 * Creates a new principle.
 *
 * @param {Borjes} antecedent
 * @param {Borjes} consequent
 * @param {String} [name="Abbreviation"]
 * @param {Object} [events={}] - callbacks to fire during the principle's application.
 * @param {function} events.false_antecedent
 * @param {function} events.fail
 * @param {function} events.success
 * @return {Principle} a new principle.
 */
function Abbreviation(fs, name, events) {
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
    borjes: "abbreviation",
    fstr: fs,
    name: name || "",
    on: events || {},
  };
}

module.exports = Abbreviation;
