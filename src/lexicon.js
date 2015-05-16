"use strict";

var types = require('./types');

var Nothing = types.Nothing;

function Lexicon () {
    return {
        borjes: 'lexicon',
        words: {}
    };
}

Lexicon.add = function ( l, word, object ) {
    if (l.words[word] === undefined) {
        l.words[word] = [ object ];
    } else {
        l.words[word].push(object);
    }
};

Lexicon.get = function ( l, word ) {
    if (l.words[word] === undefined) {
        return Nothing;
    } else {
        return l.words[word];
    }
};

// morphology is a function that gets a word and produces an array of pairs
// [ word, lexical entry ]
Lexicon.inflect = function ( l, morphology, words ) {
    for (var i=0; i<words.length; i++) {
        var r = morphology(words[i]);
        for (var j=0;j<r.length;j++) {
            Lexicon.add(l, r[j][0], r[j][1]);
        }
    }
};

module.exports = Lexicon;
