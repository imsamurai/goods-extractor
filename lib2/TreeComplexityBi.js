/**
 * Created by imsamurai on 13.01.2016.
 */
function TreeComplexityBi(rateNeigbour, rateDeep, cutoff) {

    this.run = function (tree1, tree2) {
        var complexity = new TreeComplexity(rateNeigbour, rateDeep, cutoff);
        if (!tree2) {
            return complexity.run(tree1);
        }
        return (complexity.run(tree1) + complexity.run(tree2)) / 2;
    }
}

exports.TreeComplexityBi = TreeComplexityBi;