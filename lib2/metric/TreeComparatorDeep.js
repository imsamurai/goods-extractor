/**
 * Created by imsamurai on 13.01.2016.
 */
function TreeComparatorDeep(deep, simple) {
    var comparatorBi = new TreeComparatorBi();
    var complexityMetric = new TreeComplexity(1, 2, 0);
    this.run = function (tree1, tree2, rate) {
        if (tree1.node.name != tree2.node.name) {
            return 0;
        } else if (simple) {
            return rate;
        }

        if (deep && (
                (tree1.node.class == tree2.node.class && tree2.node.class)
                || compareClassAndComplexity(tree1, tree2)
                || compareClassAndComplexity(tree2, tree1)
                || (!tree2.node.class && comparatorBi.run(tree1, tree2, 0.38) > 90)
            )
        ) {
            return rate;
        }
        if (!deep && tree1.node.class == tree2.node.class) {
            return rate;
        }

        if (!deep && (compareClassAndComplexity(tree1, tree2)
            || compareClassAndComplexity(tree2, tree1))) {
            return rate;
        }

        return 0;
    }

    function compareClassAndComplexity(tree1, tree2) {
        return (tree1.node.class.indexOf(tree2.node.class) != -1)
            && (complexityMetric.run(tree1) === complexityMetric.run(tree2));
    }
}

