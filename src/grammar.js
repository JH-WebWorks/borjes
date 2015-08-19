"use strict";

var Lexicon = require('./lexicon');

/**
 * Creates a new grammar.
 *
 * @param {Rule[]} [rules]
 * @param {Lexicon} [lexicon]
 * @return {Grammar} a new grammar.
 */
function Grammar (rules, lexicon) {
    /**
     * A grammar contains all the information necessary for the parser to turn
     * an input string (surface form) into a syntactic tree.
     *
     * @typedef Grammar
     * @property {String} borjes - 'grammar'
     * @property {Rule[]} rules
     * @property {Lexicon} lexicon
     */
    return {
        borjes: 'grammar',
        rules: rules || [],
        lexicon: lexicon || Lexicon(),
    };
}

module.exports = Grammar;
