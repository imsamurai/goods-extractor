/**
 * Created by imsamurai on 13.01.2016.
 */
function TreeComplexityBi() {

    this.run = function (tree1, tree2, rateNeigbour, rateDeep) {
        var complexity = new TreeComplexity();
        return (complexity.run(tree1, rateNeigbour, rateDeep) + complexity.run(tree2, rateNeigbour, rateDeep)) / 2;
    }


}