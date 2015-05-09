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

module.exports = Tree;
