/**
 * Created by imsamurai on 13.01.2016.
 */
function TreeComplexity() {

    this.run = function (tree, rateNeigbour, rateDeep) {
        return complexity(tree, rateNeigbour, rateDeep);
    }

    function complexity(t1, rateNeigbour, rateDeep) {
        var weight = 0;
        if (t1.children.length > 0) {
            weight = rateDeep + t1.children.length * rateNeigbour;
            for (var i = 0; i < t1.children.length; i++) {
                weight += complexity(t1.children[i], rateNeigbour, rateDeep)
            }
        }
        return weight;
    }

}