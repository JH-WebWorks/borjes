var Rule = require('./rule');
var types = require('./common');

var s = function(string) { return new types.Literal(string); }
var r = function(mother, left, right) { return new Rule(s(mother), [s(left), s(right)]); }

var grammar = {

    rules: [
        r('S', 'NP', 'VP'),
        r('S', 'S', 'ConjS'),
        r('NP', 'Det', 'NP'),
        r('NP', 'Adj', 'NP'),
        r('NP', 'NP', 'ToVP'),
        r('NP', 'NP', 'PP'),
        r('NP', 'NP', 'Rel'),
        r('VP', 'Adv', 'VP'),
        r('VP', 'VP', 'Adv'),
        r('VP', 'VP', 'NP'),
        r('VP', 'VP', 'Adj'),
        r('VP', 'VP', 'PP'),
        r('PP', 'Prep', 'NP'),
        r('Rel', 'That', 'VP'),
        r('ConjS', 'Conj', 'S'),
        r('ToVP', 'To', 'VP')
    ],

    lexicon: {
        'to': [ s('To') ],
        'that': s('That')
    },

    category: function (category, words) {
        var cat = s(category);
        for (var i=0; i<words.length; i++) {
            var w = words[i];
            if (this.lexicon[w] === undefined) {
                this.lexicon[w] = [];
            }
            this.lexicon[w].push(cat);
        }
    }

};

grammar.category('NP', [ 'john', 'mary', 'dog', 'store', 'lettuce', 'salad', 'program', 'code', 'student', 'professor' ]);
grammar.category('VP', [ 'loves', 'likes', 'walks', 'runs', 'drives', 'buys', 'make', 'writes', 'works', 'comments', 'enjoys' ]);
grammar.category('Conj', [ 'and' ] );
grammar.category('NP', [ 'he' ]);
grammar.category('Det', [ 'the', 'a', 'his' ]);
grammar.category('Adj', [ 'brown', 'grocery', 'short', 'good', "John's" ]);
grammar.category('Adv', [ 'deeply', 'quickly', 'correctly' ]);
grammar.category('Prep', [ 'to', 'for', 'like' ]);

grammar.tests = [
    "john deeply loves mary",
    "john likes mary",
    "john likes the brown dog",
    "john walks to the store",
    "john walks to the grocery store",
    "john runs to the grocery store",
    "john quickly runs to the grocery store",
    "john drives to the grocery store",
    "john drives to the grocery store and he buys lettuce",
    "john drives to the grocery store and he buys lettuce to make a salad",
    "john drives to the grocery store and he buys lettuce to make a salad for mary",
    "john writes a short program",
    "john writes a short program that works correctly",
    "john writes a short program that works correctly and he comments his code like a good student"
];

module.exports = grammar;
