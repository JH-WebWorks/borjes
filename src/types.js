"use strict";

/**
 * Set of strings (type labels), the types which are "static" and thus can
 * safely be passed around by reference.
 */
var primitive = {};

/**
 * The nothing object unifies with nothing, represents failure of unification or
 * absence of results.
 *
 * @typedef Nothing
 * @property {String} borjes - 'nothing'
 * @PRIMITIVE
 */
var Nothing = {
    borjes: 'nothing'
};
primitive['nothing'] = true;

/**
 * The anything object unifies with anything.
 *
 * @typedef Anything
 * @property {String} borjes - 'anything'
 * @PRIMITIVE
 */
var Anything = {
    borjes: 'anything'
};
primitive['anything'] = true;

/**
 * Creates a new literal object.
 *
 * @param {String} string - the constant string.
 * @return {Literal} a literal that represents that string.
 * @variation constructor
 */
function Literal ( string ) {
    /**
     * A literal object represents a constant string.
     *
     * @typedef Literal
     * @property {String} borjes - 'literal'
     * @property {String} s - the string
     * @PRIMITIVE
     */
    return {
        borjes: 'literal',
        s: string
    };
};
primitive['literal'] = true;

// LATTICE
// =======
// TODO try to remove static collection of lattices.
// refactor: turn into a global "context"

/**
 * An auto-increment counter for assigning names to lattices.
 */
var lattice_names = 1;

/**
 * A static collection of all lattices.
 */
var lattices = {};

/**
 * Creates a new lattice.
 *
 * @param {Number} [max_elements=64] - the maximum number of elements the lattice.
 * @param {String} [name] - an optional name to identify the lattice.
 * @return {Lattice} a new, empty lattice.
 * @variation constructor
 */
function Lattice (max_elements, name) {
    max_elements = max_elements || 64;
    name = name || lattice_names++;
    /**
     * A lattice is a set of names (usually used for type hierarchies) which are
     * partially ordered.
     *
     * It is implemented with a bit array. Each element is assigned a bit array
     * which includes a bit for itself, and a bit for each other element
     * dominated/included.
     * @typedef Lattice
     * @property {String} borjes - 'lattice'
     * @property {Number} n - the number of elements in the lattice
     * @property {String} name - the lattice name
     * @property {Number} nels - the number of bytes in the bit array
     * @property {Object} elem - a mapping from bitarrays to element names
     * (strings)
     * @property {Object} bits - a mapping from element names (strings) to
     * bitarrays
     * @PRIMITIVE
     */
    var r = {
        borjes: 'lattice',
        n: 0,
        name: name,
        nels: Math.floor((max_elements-1)/32)+1,
        elem: {}, // from bitarray to string
        bits: {}, // from string to bitarray
    };
    lattices[name] = r;
    return r;
}
primitive['lattice'] = true;

/**
 * Converts a bitarray into a string for indexing in a JSO.
 * @param {Lattice} l - the lattice (for the number of bytes).
 * @param {Byte[]} uarray
 * @private
 */
function to_bstr ( l, uarray ) {
    var bstr = '';
    for (var j=0; j<l.nels; j++) {
        bstr += uarray[j]+'-';
    }
    return bstr;
}

/**
 * Creates a new element in the lattice.
 *
 * @param {Lattice} l - the lattice to which to add the element.
 * @param {String} elem - the name of the new element.
 * @param {Lattice.element[]} subelems - the lattice elements that the new one
 * includes/dominates (is greater to in the lattice order). Since an order has
 * the transitive property, only the direct sub-elements have to be included.
 * @return {Lattice.element} the new element.
 */
Lattice.add = function (l, elem, subelems) {
    var bits = new Uint32Array(l.nels);
    var shift = l.n, w = 0;
    for (; shift>=32; shift-=32) { w++; }
    bits[w] |= 1 << shift;
    if ( subelems ) {
        for (var i = 0; i<subelems.length; i++) {
            var el = subelems[i];
            var toor = l.bits[el.e];
            for (var j=0; j<l.nels; j++) {
                bits[j] |= toor[j];
            }
        }
    }
    l.n++;
    l.bits[elem] = bits;
    l.elem[to_bstr(l, bits)] = elem;
    return {
        borjes: 'latticeel',
        l: l.name,
        e: elem
    }
}

/**
 * Creates a lattice from a prototype hierarchy.
 *
 * @param {Object} proto - an object, where keys are lattice elements and their
 * values are sub-objects with the dominated elements. Terminal nodes can be
 * marked either with empty objects or with null.
 * @param {String} [name] - a name for the lattice.
 * @return {Lattice} a new lattice.
 */
Lattice.fromProto = function ( proto, name ) {
    var countCB = function (x) {
        var c = 0;
        for (var k in x) {
            if (x[k] !== null) {
                c += countCB(x[k]);
            }
        }
        return c;
    };
    var L = Lattice(countCB(proto), name);
    var els = {};
    var addElements = function (x) {
        for (var k in x) {
            if (els[k] !== undefined) { continue; }
            var ch = [];
            if (x[k] !== null) {
                addElements(x[k]);
                ch = Object.keys(x[k]).map(function (name) {
                    return els[name];
                });
            }
            els[k] = Lattice.add(L, k, ch);
        }
    };
    addElements(proto);
    return L;
}

/**
 * Gets a lattice element by name.
 *
 * @param {Lattice} lattice - the lattice to which the element belongs.
 * @param {String} elem - the name of the element to retrieve.
 * @return {Lattice.element|Nothing} returns the element, or Nothing if no such
 * name exists in the lattice.
 * @variation constructor
 */
Lattice.element = function ( lattice, elem ) {
    if (typeof lattice !== 'object') {
        lattice = lattices[lattice];
    }
    if (!lattice.bits[elem]) {
        return Nothing;
    }
    /**
     * @typedef Lattice.element
     * @property {String} borjes - 'latticeel'
     * @property {String} l - the lattice name
     * @property {String} e - the element name
     * @PRIMITIVE
     */
    return {
        borjes: 'latticeel',
        l: lattice.name,
        e: elem
    };
}
primitive['latticeel'] = true;

/**
 * Gets the lattice an element belongs to.
 *
 * @param {Lattice.element} elem
 * @return {Lattice}
 */
Lattice.from_element = function ( elem ) {
    return lattices[elem.l];
}

/**
 * Finds the greatest lower bound common to the two elements.
 *
 * @param {Lattice.element} x
 * @param {Lattice.element} y
 * @return {Lattice.element|Nothing} the greatest lower bound, or Nothing if it
 * doesn't exist.
 */
Lattice.meet = function (x, y) {
    if (x.l !== y.l) { return Nothing; }
    var l = lattices[x.l];
    var bits = new Uint32Array(l.nels);
    var xbits = l.bits[x.e];
    var ybits = l.bits[y.e];
    for (var i = 0; i<l.nels; i++) {
        bits[i] = xbits[i] & ybits[i];
    }
    var meet = l.elem[to_bstr(l, bits)];
    if (meet === undefined) { return Nothing; }
    return Lattice.element(l, meet);
}

// FEATURE STRUCTURE
// =================

/**
 * Creates a new feature structure.
 *
 * @param {Object} [object] - a mapping from names to values to turn into a
 * fstruct. If not provided, the fstruct is constructed with no features.
 * @param {Object} [features] - which attributes from object to use for the
 * fstruct. By default all attributes are used.
 * @return {FStruct} a new fstruct with the provided features if any.
 * @variation constructor
 */
function FStruct ( object, features ) {
    if (object === undefined) {
        features = [];
    }
    if (features === undefined) {
        features = Object.keys(object);
    }
    /**
     * A feature structure is a mapping from feature names (strings) to feature
     * values (Borjes objects).
     *
     * @typedef FStruct
     * @property {String} borjes - 'fstruct'
     * @property {String[]} f - the feature names for this fstruct
     * @property {Object} v - the mapping from feature names to their values
     */
    var r = {
        borjes: 'fstruct',
        f: features,
        v: {}
    };
    for (var i in r.f) {
        var f = r.f[i];
        r.v[f] = copy(object[f]);
    }
    return r;
}

/**
 * Sets a feature in a feature structure to a value.
 *
 * @param {FStruct} fs - the fstruct.
 * @param {String} feat - the name of the feature.
 * @param {Borjes} val - the value of the feature. If null, the feature is
 * removed.
 */
FStruct.set = function ( fs, feat, val ) {
    var i;
    for (i=0; i<fs.f.length; i++) {
        if (fs.f[i] === feat) {
            break;
        }
    }
    if (val === null) {
        fs.f.splice(i, 1);
        delete fs.v[feat];
    } else {
        if (i==fs.f.length) {
            fs.f.push(feat);
        }
        fs.v[feat] = val;
    }
}

/**
 * Removes a feature from a feature structure.
 *
 * @param {FStruct} fs
 * @param {String} feat - the name of the feature to remove.
 */
FStruct.unset = function ( fs, feat ) {
    FStruct.set(fs, feat, null);
}

/**
 * Gets the value of a feature in a fstruct.
 *
 * @param {FStruct} fs - the fstruct.
 * @param {String} feat - the name of the feature.
 * @return {Borjes} the feature value.
 */
FStruct.get = function ( fs, feat ) {
    return fs.v[feat];
}

/**
 * Checks whether two fstructs are comparable (the features which are set in
 * both are comparable)
 *
 * @param {FStruct} x
 * @param {FStruct} y
 * @param {World} [wx] - the world in which x lives (if there is one)
 * @param {World} [wy] - the world in which y lives (if there is one)
 * @return {boolean}
 */
function compare_fs ( x, y, wx, wy ) {
    for (var i in x.f) {
        var f = x.f[i];
        if (y.v[f]!==undefined && !compare(x.v[f], y.v[f], wx, wy)) {
            return false;
        }
    }
    return true;
};

/**
 * Copies a fstruct (creates a new one with the same features, and copies of the
 * values for each feature).
 *
 * @param {FStruct} x
 * @param {WorldMap} [map] - a mapping from old world names to new world names.
 * @return {FStruct}
 */
function copy_fs ( x, map ) {
    var r = {
        borjes: 'fstruct',
        f: x.f.slice(),
        v: {}
    };
    for (var i in r.f) {
        var f = r.f[i];
        r.v[f] = copy(x.v[f], map);
    }
    return r;
}

// TYPED FEATURE STRUCTURE
// =======================

/**
 * Creates a new typed fstruct.
 *
 * @param {Borjes} type - the type of the tfs.
 * @param {Object} object - see the constructor for FStruct.
 * @param {Object} features - see the constructor for FStruct.
 * @return {TFS} a new tfs.
 * @variation constructor
 */
function TFS ( type, object, features ) {
    var fs = FStruct(object, features);
    /**
     * @typedef TFS
     * @extends {FStruct}
     * @property {String} borjes - 'tfstruct'
     * @property {Borjes} type - the type of the fstruct.
     */
    fs.borjes = 'tfstruct';
    fs.type = type;
    return fs;
}

/**
 * Compares two tfs.
 *
 * @param {TFS} x
 * @param {TFS} y
 * @param {World} wx - the world of x
 * @param {World} wy - the world of y
 * @return {boolean} true if the types are equal and the fstructs are comparable.
 */
function compare_tfs ( x, y, wx, wy ) {
    if (!eq(x.type, y.type)) { return false; }
    return compare_fs(x, y, wx, wy);
}

/**
 * Copies a tfs.
 *
 * @param {TFS} x
 * @param {WorldMap} [map] - a mapping from old world names to new world names.
 * @return {TFS}
 */
function copy_tfs ( x, map ) {
    var r = copy_fs(x, map);
    r.borjes = 'tfstruct';
    r.type = copy(x.type, map);
    return r;
}

// WORLD
// =====

/**
 * Creates a new world.
 *
 * @return {World}
 * @variation constructor
 */
function World () {
    /**
     * A world is an object in which to store other objects. It can be
     * attached to a Borjes object (especially a recursive one) so that values
     * in that object can be variables. Bound variables always refer to a value
     * in a world.
     *
     * @typedef World
     * @property {String} borjes - 'world'
     * @property {Borjes[]} values - an array of values
     * @property {String[]} titles - an array of optional titles for the values
     */
    return {
        borjes: 'world',
        values: [],
        titles: []
    };
}

/**
 * Gets the value for a given name in a world.
 *
 * @param {World} world
 * @param {Name} index - the name of the value.
 */
World.get = function ( world, index ) {
    return world.values[index];
};

/**
 * Gets the final value for a variable, after all renamings have been resolved.
 *
 * @param {World} world
 * @param {Variable|Borjes} x - the variable to resolve. If it's not a variable,
 * it's returned itself.
 * @return {Borjes} the resolved value. Can't be a variable.
 */
World.resolve = function ( world, x ) {
    while (typeof x === 'object' && x.borjes === 'variable') {
        x = world.values[x.index];
    }
    return x;
};

/**
 * Attach a world to an object. This is necessary for unification to know
 * where the variables in the object live.
 *
 * @param {World} world - the world to attach.
 * @param {Borjes} x - the object to which to attach the world.
 */
World.bind = function ( world, x ) {
    x.borjes_bound = world;
};

/**
 * Puts an object in a world.
 *
 * @param {World} world
 * @param {Borjes} x - the object to put.
 * @param {String} [title] - an optional title for the object.
 * @return {Name} the name for the object in the world.
 */
World.put = function ( world, x, title ) {
    world.values.push(x);
    var i = world.values.length-1;
    world.titles.push(title===undefined?i:title);
    return i;
};

/**
 * Changes the value of an object in the world.
 *
 * @param {World} world - the world to which the object belongs.
 * @param {Name} index - the name of the object.
 * @param {Borjes} x - the new value for the name.
 * @param {String} [title] - an optional title for the value.
 */
World.set = function ( world, index, x, title ) {
    world.values[index] = x;
    if (title !== undefined) {
        world.titles[index] = title;
    }
};

/**
 * Copies a world, possibly changing the names of the values.
 *
 * @param {World} x - the world to copy.
 * @param {WorldMap} [map] - a mapping from old names to new ones.
 * @return {World} a copy of the world.
 */
function copy_world ( x, map ) {
    return {
        borjes: 'world',
        values: x.values.map(function(v) {
            return copy(v, map);
        }),
        titles: x.titles.map(function (t) {
            return t;
        })
    };
}

// VARIABLE
// ========

/**
 * Creates a new variable.
 *
 * @param {World} world - the world the variable lives in.
 * @param {Borjes} [value] - a value to which to bind the variable.
 * @return {Variable} a new variable, free if no value was provided, otherwise
 * bound to that value.
 * @TODO free variables (value == undefined)
 * @variation constructor
 */
function Variable ( world, value ) {
    /**
     * A variable is an indirect name for another object. The advantage of
     * variables is that in a recursive object (e.g. an fstruct) many values can
     * point to the same object, thus sharing structure.
     *
     * @typedef Variable
     * @property {String} borjes - 'variable'
     * @property {Name} index - if defined, the name of the bound value.
     */
    return {
        borjes: 'variable',
        index: World.put(world, value)
    };
}

/**
 * Copies a variable, possibly changing the name of the bound value.
 *
 * @param {Variable} x - the variable to copy.
 * @param {WorldMap} [map] - a mapping from old world names to new ones.
 * @return {Variable}
 */
Variable.copy = function ( x, map ) {
    var i;
    if (map) {
        var n = map[x.index];
        if (n !== undefined) {
            if (n == -1) {
                return copy(World.get(map._w, x.index), map);
            } else {
                i = n;
            }
        } else {
            i = World.put(map._nw,
                copy(World.get(map._w, x.index),map));
            map[x.index] = i;
        }
    } else {
        i = x.index;
    }
    return {
        borjes: 'variable',
        index: i
    };
}

// LIST
// ====

/**
 * Creates a new list.
 *
 * @param {Any} [first] - if undefined, the list is empty
 * @param {List} [rest=List()]
 * @return {List}
 */
function List (first, rest) {
    if (first === undefined) {
        /**
         * An empty list.
         * @typedef List.empty
         * @property {String} borjes - 'list_empty'
         * @PRIMITIVE
         */
        return { borjes: 'list_empty' };
    }
    if (rest === undefined) {
        rest = { borjes: 'list_empty' };
    }
    /**
     * A functional-like recursive list data-type.
     *
     * @typedef List
     * @property {String} borjes - 'list'
     * @property {Any} first - the first element.
     * @property {List} rest - a list with the rest of the elements.
     */
    return {
        borjes: 'list',
        first: first,
        rest: rest
    };
}
primitive['list_empty'] = true;

/**
 * Copies a non-empty list, copying its elements.
 *
 * @param {List} x - the list to copy.
 * @param {WorldMap} [map] - a mapping from old world names to new ones.
 * @return {List}
 */
List.copy = function (x, map) {
    return {
        borjes: 'list',
        first: copy(x.first, map),
        rest: copy(x.rest, map)
    };
}

// DISJUNCT
// ========

/**
 * Creates a disjunction.
 *
 * @param {Borjes...} alternatives.
 * @return {Disjunct}
 */
function Disjunct () {
    var a = [];
    for (var i = 0; i<arguments.length; i++) {
        a.push(arguments[i]);
    }
    /**
     * A disjunct, an object which can be a series of different alternatives.
     *
     * @typedef Disjunct
     * @property {String} borjes - 'disjunct'
     * @property {Borjes[]} a - the alternatives.
     */
    return {
        borjes: 'disjunct',
        a: a
    };
}

/**
 * Copies a disjunction.
 *
 * @param {Disjunct} x
 * @param {WorldMap} map
 * @return {Disjunct}
 */
Disjunct.copy = function (x, map) {
    return {
        borjes: 'disjunct',
        a: x.a.map(function(y) {
            return copy(y, map);
        })
    };
}

/**
 * Compares disjuncts.
 *
 * @param {Disjunct} x
 * @param {Disjunct} y
 * @param {World} wx - the world of x
 * @param {World} wy - the world of y
 * @return {boolean} true if all options are comparable (and in the same order).
 */
function compare_disjunct (x, y, wx, wy) {
    if (x.a.length !== y.a.length) {
        return false;
    }
    for (var i=0; i<x.a.length; i++) {
        if (!compare(x.a[i], y.a[i], wx, wy)) {
            return false;
        }
    }
    return true;
}

// SETS
// ====

/**
 * Creates a set.
 *
 * @param {Borjes...} elements
 * @return {Set}
 */
function Set () {
    var a = [];
    for (var i = 0; i<arguments.length; i++) {
        a.push(arguments[i]);
    }
    /**
     * A set is a collection of elements in which order doesn't matter.
     *
     * @typedef Set
     * @property {String} borjes - 'set'
     * @property {Borjes[]} e - the member elements.
     */
    return {
        borjes: 'set',
        e: a
    };
}

/**
 * Copies a set.
 *
 * @param {Set} x
 * @param {WorldMap} map
 * @return {Set}
 */
Set.copy = function (x, map) {
    return {
        borjes: 'set',
        e: x.e.map(function (y) {
            return copy(y, map);
        })
    };
}

/**
 * Creates a direct sum.
 *
 * @param {Borjes} el - element.
 * @param {Variable|Set} rest - the remainder of the set.
 * @return {Set.sum}
 */
Set.sum = function (el, rest) {
    /**
     * A set sum represents a decomposition of an abstract set into a member
     * element and a set with the rest of the elements. This decomposition
     * materializes upon unification.
     *
     * @typedef Set.sum
     * @property {String} borjes - 'set_sum'
     * @property {Borjes} el - the member element.
     * @property {Set} rest - the remainder of the set.
     */
    return {
        borjes: 'set_sum',
        el: el,
        rest: rest
    };
}

/**
 * Copies a direct sum.
 *
 * @param {Set.sum} x
 * @param {WorldMap} map
 * @return {Set.sum}
 */
Set.sum.copy = function (x, map) {
    return {
        borjes: 'set_sum',
        el: copy(x.el, map),
        rest: copy(x.rest, map)
    };
}

// PREDICATE
// =========
// TODO revise

var predicates = {};

function Predicate ( name, params ) {
    return {
        borjes: 'predicate',
        params: params,
        name: name
    };
}

Predicate.create = function ( name, func ) {
    predicates[name] = func;
}

// actually applies it
Predicate.copy = function ( pred, map ) {
    var args = [];
    for (var i=0; i<pred.params.length; i++) {
        var p = pred.params[i];
        if (typeof p !== 'object' || p.borjes !== 'variable') {
            args.push(copy(p, map));
        } else {
            args.push(World.resolve(map._nw, Variable.copy(p, map)));
        }
    }
    return predicates[pred.name].apply(null, args);
}

// UTILITY FUNCTIONS
// =================

/**
 * Compares two borjes objects for strict equality (only useful with primitive
 * types).
 *
 * @param {Borjes} x
 * @param {Borjes} y
 * @return {boolean} whether the objects are equal.
 */
function eq ( x, y ) {
    if (x === y) {
        return true;
    }
    if (x.borjes !== y.borjes) {
        return false;
    }
    if (x.borjes === 'nothing' || x.borjes === 'anything' || x.borjes === 'list_empty') {
        return true;
    }
    if (x.borjes === 'literal') {
        return x.s === y.s;
    }
    if (x.borjes === 'latticeel') {
        return x.l === y.l && x.e === y.e;
    }
    return false;
}

/**
 * Copies a Borjes object.
 *
 * @param {Borjes} x - the object to copy.
 * @param {WorldMap} [map] - a mapping from old world names to new ones.
 * @return {Borjes}
 */
function copy ( x, map ) {
    if (typeof x !== 'object' || primitive[x.borjes]) {
        return x;
    }
    if (x.borjes === 'world') {
        return copy_world(x, map);
    }
    var c = Nothing;
    if (x.borjes === 'fstruct') {
        c = copy_fs(x, map);
    } else if (x.borjes === 'tfstruct') {
        c = copy_tfs(x, map);
    } else if (x.borjes === 'variable') {
        c = Variable.copy(x, map);
    } else if (x.borjes === 'list') {
        c = List.copy(x, map);
    } else if (x.borjes === 'predicate') {
        c = Predicate.copy(x, map);
    } else if (x.borjes === 'disjunct') {
        c = Disjunct.copy(x, map);
    } else if (x.borjes === 'set') {
        c = Set.copy(x, map);
    } else if (x.borjes === 'set_sum') {
        c = Set.sum.copy(x, map);
    }
    if (x.borjes_bound !== undefined) {
        if (map !== undefined) {
            World.bind(map._nw, c);
        } else {
            World.bind(copy(x.borjes_bound), c);
        }
    }
    return c;
}

/**
 * Compares two Borjes objects.
 *
 * @param {Borjes} x
 * @param {Borjes} y
 * @param {World} [wx] - the world where x lives.
 * @param {World} [wy] - the world where y lives.
 * @return {boolean} true if the objects are equivalent.
 */
function compare ( x, y, worldx, worldy ) {
    if (x.borjes_bound) { worldx = x.borjes_bound; }
    if (y.borjes_bound) { worldy = y.borjes_bound; }
    if (x.borjes === 'variable') {
        return compare(World.get(worldx, x.index), y, worldx, worldy);
    }
    if (y.borjes === 'variable') {
        return compare(x, World.get(worldy, y.index), worldx, worldy);
    }
    if (x.borjes !== y.borjes) {
        return false;
    }
    if (primitive[x.borjes]) {
        return eq(x, y);
    }
    if (x.borjes === 'fstruct') {
        return compare_fs(x, y, worldx, worldy);
    }
    if (x.borjes === 'tfstruct') {
        return compare_tfs(x, y, worldx, worldy);
    }
    if (x.borjes === 'list') {
        return compare(x.first, y.first, worldx, worldy)
               && compare(x.rest, y.rest, worldx, worldy);
    }
    if (x.borjes === 'disjunct') {
        return compare_disjunct(x, y, worldx, worldy);
    }
    return false;
}

/**
 * Counts appearances of variables in an object.
 * @param {Borjes} x
 * @param {World} w
 * @param {Object} counts
 */
function ref_count (x, w, counts) {
    if (typeof x !== 'object') { return; }
    switch (x.borjes) {
        case 'variable':
            var i = x.index;
            if (counts[i] !== undefined) {
                counts[i] = counts[i]+1;
            } else {
                counts[i] = 1;
                ref_count(World.get(w, i), w, counts);
            }
            break;
        case 'tfstruct':
            ref_count(x.type, w, counts);
        case 'fstruct':
            for (var i=0; i<x.f.length; i++) {
                ref_count(x.v[x.f[i]], w, counts);
            }
            break;
        case 'list':
            ref_count(x.first, w, counts);
            ref_count(x.rest, w, counts);
            break;
        case 'disjunct':
            for (var i=0; i<x.a.length; i++) {
                ref_count(x.a[i], w, counts);
            }
            break;
        case 'set':
            for (var i=0; i<x.e.length; i++) {
                ref_count(x.e[i], w, counts);
            }
        case 'set_sum':
            ref_count(x.el, w, counts);
            ref_count(x.rest, w, counts);
            break;
    }
}

/**
 * Normalizes a bound object.
 *
 * Removes variables bound to variables, and ones that are only used once.
 * @param {Borjes} x - an object bound to a world.
 * @return {Borjes} a copy with a normalized attached world.
 */
function normalize ( x ) {
    var w = x.borjes_bound;
    var counts = {};
    ref_count(x, w, counts);
    var i = 0;
    var nw = World();
    var map = { _nw: nw, _w: w };
    for (var n in counts) {
        if (counts[n]==1) {
            map[n] = -1;
        }
    }
    return copy(x, map);
}

module.exports = {
    Nothing: Nothing,
    Anything: Anything,
    Literal: Literal,
    Lattice: Lattice,
    FStruct: FStruct,
    TFS: TFS,
    World: World,
    Variable: Variable,
    List: List,
    Disjunct: Disjunct,
    Set: Set,
    Predicate: Predicate,
    eq: eq,
    copy: copy,
    compare: compare,
    normalize: normalize
};
