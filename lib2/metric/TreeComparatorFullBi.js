/**
 * Created by imsamurai on 13.01.2016.
 */
function TreeComparatorFullBi(rate, cutoff, cache) {
    var comparator = new TreeComparatorFull(rate, 0);
    this.run = function (tree1, tree2) {
        var _key = rate + '$$$' + cutoff + '$$$' + tree1.node.id+'$$$'+tree2.node.id;
        if (cache.get(_key)!==undefined) {
            return cache.get(_key);
        }

        var weight = (comparator.run(tree1, tree2) + comparator.run(tree2, tree1)) / 2;
        cache.set(_key, weight < cutoff ? 0 : weight);
        return weight < cutoff ? 0 : weight;
    }

}

