"use strict";

/**
 * This module provides a parser for parenthesis expressions.
 *
 * @exports parse
 */

/**
 * Gets the next token in the input string (for a parenthesis expression)
 * @private
 * @param {String} string - the string to parse
 * @param {Object} [state] - after the first token is parsed, state is filled
 * with an object, which should be passed to next invocations of strtok to
 * continue parsing the same string.
 * @return {Object} an object with properties 't' for the token found, and 'w'
 * if a word was found (the word is put there).
 */
function strtok ( string, state ) {
    if (state.r === undefined) {
        state.r = new RegExp('[^,()"]+|\\)|\\(|,|("[^"]+")', 'g');
    }
    // state.pb: fill this to put back a token for the parser
    if (state.pb !== undefined) {
        var pb = state.pb;
        delete state.pb;
        return pb;
    }
    var x = state.r.exec(string);
    if (!x) { return { t: 'END' }; }
    switch (x[0]) {
        case ')': return { t: ')' };
        case '(': return { t: '(' };
        case ',': return { t: ',' };
    }
    var w = x[0];
    if (w.charAt(0)=='"') {
        w = w.slice(1,-1);
    }
    return { t: 'WORD', w: w };
}

function error ( string, tok ) {
    throw Error('Malformed string');
}

/**
 * Parses expressions of the form
 *     word(exp,exp,...)
 * and returns them as arrays
 *     [ word, exp, exp, ... ]
 * of course subexpressions are also arrays.
 * Understands (a bit) double quotation marks.
 * @param {String} string - the string to parse
 * @param {Object} [state] - should be undefined, it is used by the function for
 * recursive parsing.
 * @throws {Error} if the string is not a par-exp.
 * @return {Array} an array equivalent of the par-exp.
 */
function parse ( string, state ) {
    if (state === undefined) { state = {}; }
    var q = 0;
    var ret = [];
    var tok;
    while (true) {
        tok = strtok(string, state);
        if (q == 0) {
            if (tok.t != 'WORD') {
                error(string, tok);
            }
            ret.push(tok.w);
            q = 1;
        } else if (q == 1) {
            if (tok.t == '(') {
                ret.push(parse(string, state));
                q = 2;
            } else if (tok.t == 'WORD') {
                error(string, tok);
            } else {
                state.pb = tok;
                return ret;
            }
        } else if (q == 2) {
            if (tok.t == ')') {
                return ret;
            } else if (tok.t == ',') {
                ret.push(parse(string, state));
            }
        }
    }
    error(string, tok);
}

module.exports = parse;
