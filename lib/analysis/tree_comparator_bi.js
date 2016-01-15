/**
 * Created by imsamurai on 13.01.2016.
 */
function TreeComparatorBi() {

    this.run = function (tree1, tree2, rate) {
        var comparator = new TreeComparator();
        return (comparator.run(tree1, tree2, rate) + comparator.run(tree2, tree1, rate)) / 2;
    }

}