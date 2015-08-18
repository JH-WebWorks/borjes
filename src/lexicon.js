"use strict";

var types = require('./types');

var Nothing = types.Nothing;

/**
 * Creates a new Lexicon.
 *
 * @return {Lexicon} a new, empty lexicon.
 */
function Lexicon () {
    /**
     * A lexicon is a memory, with both read and write operations, which
     * associates words (strings) to borjes objects (one word may have multiple
     * objects associated).
     *
     * @typedef Lexicon
     * @property {String} borjes - 'lexicon'
     * @property {Object} words - a mapping from strings to arrays of borjes objects
     */
    return {
        borjes: 'lexicon',
        words: {}
    };
}

/**
 * Adds an association (a pair word-borjes object) to a lexicon.
 *
 * There can be many objects associated to a single word, retrieving the word
 * will give all possibilities.
 *
 * @param {Lexicon} l - the lexicon.
 * @param {String} word - the string to which to associate the object.
 * @param {Borjes} object - the object to associate to the word.
 */
Lexicon.add = function ( l, word, object ) {
    if (l.words[word] === undefined) {
        l.words[word] = [ object ];
    } else {
        l.words[word].push(object);
    }
};

/**
 * Retrieves the borjes objects associated to a word in a lexicon.
 *
 * If there is nothing associated, a Nothing object is returned.
 *
 * @param {Lexicon} l - the lexicon.
 * @param {String} word - the word to search for, all associated objects are
 * returned.
 * @return {Borjes[]|Nothing}
 */
Lexicon.get = function ( l, word ) {
    if (l.words[word] === undefined) {
        return Nothing;
    } else {
        return l.words[word];
    }
};

/**
 * Adds one or more inflection paradigms (the different word forms related by
 * inflexion) to the lexicon.
 *
 * This means the words will not be added directly,
 * but first will be inflected by the morphology function, and then all forms
 * will be added to the lexicon.
 *
 * @param {Lexicon} l - the lexicon.
 * @param {function} morphology - this function will be run for all words, and
 * its results added to the lexicon. It must take a String (the dictionary form)
 * and return an array of pairs [ form, lexical entry ] where form is a String
 * (the inflected form of the word) and the lexical entry is the borjes object
 * associated with the form.
 * @param {string[]} words - the "dictionary forms" to be passed to the
 * morphology to get the inflection paradigm.
 */
Lexicon.inflect = function ( l, morphology, words ) {
    for (var i=0; i<words.length; i++) {
        var r = morphology(words[i]);
        for (var j=0;j<r.length;j++) {
            Lexicon.add(l, r[j][0], r[j][1]);
        }
    }
};

module.exports = Lexicon;
