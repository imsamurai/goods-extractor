/**
 * Created by imsamurai on 13.01.2016.
 */
function TreeComplexity(rateNeigbour, rateDeep, cutoff) {

    this.run = function (tree) {
        var weight = 1-1/(1+complexity(tree));
        return weight < cutoff ? 0 : weight;
    }

    function complexity(t1) {
        var weight = 0;
        if (t1.children.length > 0) {
            weight = rateDeep + t1.children.length * rateNeigbour;
            for (var i = 0; i < t1.children.length; i++) {
                weight += complexity(t1.children[i])
            }
        }
        return weight;
    }

}

exports = TreeComplexity;