var Rule = require('./rule');
var types = require('./common');

var s = function(string) { return new types.Literal(string); }

var grammar = {

    rules: [
        new Rule(s('S'), [ s('NP'), s('VP') ]),
        new Rule(s('VP'), [ s('VP'), s('NP') ])
    ],

    lexicon: {
        'john': s('NP'),
        'loves': s('VP'),
        'mary': s('NP')
    }

};

module.exports = grammar;
