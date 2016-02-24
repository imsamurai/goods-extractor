/**
 * Created by imsamurai on 13.01.2016.
 */
function TreeComparatorFullBi(rate, cutoff) {

    this.run = function (tree1, tree2) {
        var comparator = new TreeComparatorFull(rate, 0);
        var weight = (comparator.run(tree1, tree2) + comparator.run(tree2, tree1)) / 2;
        return weight < cutoff ? 0 : weight;
    }

}

