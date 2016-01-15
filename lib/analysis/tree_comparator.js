/**
 * Created by imsamurai on 13.01.2016.
 */
function TreeComparator() {
    this.run = function (tree1, tree2, rate) {
        return compare(tree1, tree2, 100, rate);
    }

    function compare(t1, t2, parent_weight, rate) {
        var weight = 0;
        if (t2 !== undefined && (t1.node.name == t2.node.name)) {
            if (t1.children.length > 0) {
                weight = parent_weight * rate;
                for (var i = 0; i < t1.children.length; i++) {
                    weight += compare(t1.children[i], t2.children[i], parent_weight * (1 - rate) / t1.children.length, rate)
                }
            } else {
                weight = parent_weight;
            }
        }
        return weight;
    }

}