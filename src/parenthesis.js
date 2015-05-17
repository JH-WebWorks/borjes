"use strict";

/*
 * parses expressions of the form
 *     word(exp,exp,...)
 * and returns them as arrays
 *     [ word, exp, exp, ... ]
 * of course subexpressions are also arrays
 * understands (a bit) double quotation marks
 */
function strtok ( string, state ) {
    if (state.r === undefined) {
        state.r = new RegExp('[^,()"]+|\\)|\\(|,|("[^"]+")', 'g');
    }
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
