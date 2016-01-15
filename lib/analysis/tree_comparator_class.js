/**
 * Created by imsamurai on 13.01.2016.
 */
function TreeComparatorClass(deep) {
    var comparatorBi = new TreeComparatorBi();
    this.run = function (tree1, tree2, rate) {
        if (tree1.node.name != tree2.node.name) {
            return 0;
        }

        if (deep && ((tree1.node.class == tree2.node.class && tree2.node.class) || (comparatorBi.run(tree1, tree2, 0.38) > 90))) {
            return rate;
        }
        if (!deep && tree1.node.class == tree2.node.class) {
            return rate;
        }
        return 0;
    }

}