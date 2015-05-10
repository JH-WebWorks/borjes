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

// TODO intelligent morphology / lexical rules
Lexicon.inflect = function ( l, morphology, words ) {
    var i = 0;
    if (!words.length) {
        words = arguments;
        i = 2;
    }
    for (; i<words.length; i++) {
        Lexicon.add(l, words[i], morphology);
    }
};

module.exports = Lexicon;
