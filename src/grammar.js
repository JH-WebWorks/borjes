"use strict";

var Lexicon = require('./lexicon');

/**
 * Creates a new grammar.
 *
 * @param {Rule[]} [rules]
 * @param {Lexicon} [lexicon]
 * @param {Principle[]} [principles]
 * @return {Grammar} a new grammar.
 * @TODO test with non-default values (especially that ternary reduce thing ;)
 */
function Grammar (rules, lexicon, principles) {
    /**
     * A grammar contains all the information necessary for the parser to turn
     * an input string (surface form) into a syntactic tree.
     *
     * @typedef Grammar
     * @property {String} borjes - 'grammar'
     * @property {Rule[]} rules
     * @property {Principle[]} principles
     * @property {Lexicon} lexicon
     */
    return {
        borjes: 'grammar',
        rules: rules || [],
        ruleNames: rules ? rules.reduce(function(m, r, i) {
            m[r.name]=i; return m; }, {}): {},
        principles: principles || [],
        principleNames: principles ? principles.reduce(function(m, p, i) {
            m[p.name]=i; return m; }, {}): {},
        lexicon: lexicon || Lexicon(),
    };
}

/**
 * Adds a rule to a grammar. If a rule with the same name already exists, it is
 * replaced.
 *
 * @param {Grammar} grammar
 * @param {Rule} rule
 */
Grammar.set_rule = function (grammar, rule) {
    var i = grammar.ruleNames[rule.name];
    if (i !== undefined) {
        grammar.rules[i] = rule;
    } else {
        grammar.ruleNames[rule.name] = grammar.rules.push(rule) - 1;
    }
};

/**
 * Adds a principle to a grammar. If a principle with the same name already exists, it is
 * replaced.
 *
 * @param {Grammar} grammar
 * @param {Principle} pple
 */
Grammar.set_principle = function (grammar, pple) {
    var i = grammar.principleNames[pple.name];
    if (i !== undefined) {
        grammar.principles[i] = pple;
    } else {
        grammar.principleNames[pple.name] = grammar.principles.push(pple) - 1;
    }
};

module.exports = Grammar;
