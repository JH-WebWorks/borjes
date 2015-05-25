"use strict";

function Tree (node, children) {
    if ( children === undefined ) {
        children = [];
    } else if ( !children.length ) {
        children = [ children ];
    }
    return {
        borjes: 'tree',
        node: node,
        children: children
    };
}

Tree.add_children = function (tree, children) {
    tree.children = tree.children.concat(children);
};

var id = function (x) { return x; };
Tree.to_sexp = function (tree, map) {
    if (map === undefined) { map = id; }
    var sexp = [ map(tree.node) ];
    for (var i=0; i<tree.children.length; i++) {
        sexp.push(Tree.to_sexp(tree.children[i], map));
    }
    return sexp;
};

module.exports = Tree;
