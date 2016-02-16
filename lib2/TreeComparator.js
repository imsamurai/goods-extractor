/**
 * Created by imsamurai on 13.01.2016.
 */
function TreeComparator(rate, cutoff) {
    this.run = function (tree1, tree2) {
        var weight = compare(tree1, tree2, 1);
        return weight < cutoff ? 0 : weight;
    }

    function compare(t1, t2, parentWeight) {
        var weight = 0;
        if (t2 !== undefined && (t1.node.name == t2.node.name)) {
            if (t1.children.length > 0) {
                weight = parentWeight * rate;
                for (var i = 0; i < t1.children.length; i++) {
                    weight += compare(t1.children[i], t2.children[i], parentWeight * (1 - rate) / t1.children.length)
                }
            } else {
                weight = parentWeight;
            }
        }
        return weight;
    }

}

exports.TreeComparator = TreeComparator;