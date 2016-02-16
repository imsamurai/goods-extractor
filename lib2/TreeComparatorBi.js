/**
 * Created by imsamurai on 13.01.2016.
 */
function TreeComparatorBi(rate, cutoff) {

    this.run = function (tree1, tree2) {
        var comparator = new TreeComparator(rate, cutoff);
        return (comparator.run(tree1, tree2) + comparator.run(tree2, tree1)) / 2;
    }

}

exports.TreeComparatorBi = TreeComparatorBi;