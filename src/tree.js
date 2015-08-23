"use strict";

/**
 * Creates a new tree, with a parent node and its direct children.
 *
 * @param {Any} node - the parent/root node of the tree.
 * @param {Borjes[]} [children] - the children of the root.
 * @return {Tree}
 */
function Tree (node, children) {
    if ( children === undefined ) {
        children = [];
    } else if ( !children.length ) {
        children = [ children ];
    }
    /**
     * A recursive tree data structure.
     *
     * @typedef Tree
     * @property {String} borjes - 'tree'
     * @property {Any} node - the (unboxed) root of the tree.
     * @property {Tree[]} children - the subtrees children of the root.
     */
    return {
        borjes: 'tree',
        node: node,
        children: children
    };
}

/**
 * Adds some children to the root node of a tree.
 *
 * @param {Tree} tree
 * @param {Borjes[]} children
 */
Tree.add_children = function (tree, children) {
    tree.children = tree.children.concat(children);
};

var id = function (x) { return x; };

/**
 * Converts a tree into a sexp, that is an array where the first element is the
 * root of the tree, and the next elements are sexp's corresponding to the
 * children of the root.
 *
 * @param {Tree} tree
 * @param {function} map - this function can be used to transform the tree nodes
 * before including them in the sexp. It must take an object (the node) and
 * return another object (what to include in the sexp array).
 * @return {Any[]}
 */
Tree.to_sexp = function (tree, map) {
    if (map === undefined) { map = id; }
    if (tree.borjes !== 'tree') {
        return map(tree);
    }
    var sexp = [ map(tree.node) ];
    for (var i=0; i<tree.children.length; i++) {
        sexp.push(Tree.to_sexp(tree.children[i], map));
    }
    return sexp;
};

module.exports = Tree;
