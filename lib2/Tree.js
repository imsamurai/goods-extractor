/**
 * Created by imsamurai on 12.01.2016.
 */
/**
 *
 * DOM tree representation
 *
 * @constructor
 */
function Tree(node, children, builder) {
    this.node = node;
    this.DOMNode = node.DOMNode;
    this.children = children;

    this.clone = function() {
        return new Tree(this.node.clone(), this.children.map(function(tree) {
            return tree.clone();
        }), builder);
    };

    this.findLike = function(tree) {
        var items = [];
        for (var pos = 0; pos < this.children.length; pos++) {
            if (builder.findLikeComparators[0].run(tree, this.children[pos], 1) === 1) {
                items.push(this.children[pos]);
            }
        }
        if (items.length == 0) {
            for (var pos = 0; pos < this.children.length; pos++) {
                if (builder.findLikeComparators[1].run(tree, this.children[pos], 1) === 1) {
                    items.push(this.children[pos]);
                }
            }
        }
        return items;

    };

    this.simplify = function() {
        var that = this.clone();
        var s =0;
        while (s<that.children.length) {
            if (!that.children[s]) {
                continue;
            }
            var ai = that.alignIndex(that.children[s]);
            if (ai!==s) {
                that.children[ai] = that.children[ai].mergeAligned(that.children[s]);
                that.children = that.children.slice(0,s).concat(that.children.slice(s+1))
            } else {
                s++;
                that.children[ai] = that.children[ai].simplify();
            }


        }
        return that;
    };

    this.merge = function(tree) {
        return new Tree(new TreeNodeEmpty(), [this.clone(), tree.clone()], builder);
    };

    this.mergeChildren = function(tree) {
        return new Tree(new TreeNodeEmpty(), this.clone().children.concat(tree.clone().children), builder);
    };

    this.mergeAligned = function (tree) {
        var that = this.clone();

        for (var pos = 0; pos < tree.children.length; pos++) {

            var alignPos = that.alignIndex(tree.children[pos]);
            if (alignPos === -1) {
                var bottomPos = that.alignIndex(tree.children[pos - 1]);
                var upperPos = tree.alignIndex(that.children[bottomPos + 1]);

                //check items between pos and upperPos
                var validItems = true;
                for (var i = pos + 1; i < upperPos; i++) {
                    if (that.alignIndex(tree.children[i]) !== -1) {
                        validItems = false;
                    }
                }

                if (validItems && bottomPos === -1 && upperPos !== -1) {
                    that.children = tree.children.slice(pos, upperPos).concat(that.children);
                } else if (validItems && upperPos === -1 && bottomPos !== -1) {
                    that.children = that.children.concat(tree.children.slice(pos, pos + 1));
                } else if (validItems && (bottomPos !== -1 || upperPos !== -1 || tree.children.length === 0)) {
                    that.children = that.children.slice(0, bottomPos + 1).concat(tree.children.slice(pos, upperPos === -1 ? undefined : upperPos)).concat(that.children.slice(bottomPos + 1));
                }

            } else {
                that.children[alignPos] = that.children[alignPos].mergeAligned(tree.children[pos]);
            }
        }
        return that;
    };

    this.alignIndex = function(tree, comparator) {
        if (!tree) {
            return -1;
        }
        for (var pos = 0; pos < this.children.length; pos++) {
            if (builder.alignComparator.run(this.children[pos], tree, 1) === 1) {
                return pos;
            }
        }
        return -1;
    };
}