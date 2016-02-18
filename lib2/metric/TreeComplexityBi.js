/**
 * Created by imsamurai on 13.01.2016.
 */
function TreeComplexityBi(rateNeigbour, rateDeep, cutoff) {

    this.run = function (tree1, tree2) {
        var complexity = new TreeComplexity(rateNeigbour, rateDeep, 0);
        if (!tree2) {
            var weight = complexity.run(tree1);
        } else {
            var weight = (complexity.run(tree1) + complexity.run(tree2)) / 2;
        }
        return weight < cutoff ? 0 : weight;
    }
}

exports = TreeComplexityBi;