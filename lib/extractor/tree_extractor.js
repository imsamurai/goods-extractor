/**
 * Created by imsamurai on 13.01.2016.
 */
function TreeExtractor(DOMNode, options) {
    var topElement = DOMNode,
        compareRate = options.compareRate,
        complexityNeigbourRate = options.complexityNeigbourRate,
        complexityDeepRate = options.complexityDeepRate,
        similarityCutoff = options.similarityCutoff,
        complexityCutoff = options.complexityCutoff;

    var comparator = new TreeComparatorBi();
    var bicomplexity = new TreeComplexityBi();
    var candidateItemsRate = new CandidateItemsRate();

    this.run = function () {
        Logger.info('Start tree extraction');
        var treeBuilder = new TreeBuilder(topElement);
        var tree = treeBuilder.build();
        Logger.log('Build tree', tree, 'from element', topElement);
        var candidates = findCandidates(tree);
        Logger.log('Candidates', candidates);
        var selected = selectCandidate(candidates);
        Logger.info('End tree extraction');
        return selected.tree;
    }

    function findCandidates(tree) {
        var res = [];
        if (tree.children.length > 1) {
            var items = [];
            for (var i = 0; i < tree.children.length - 1; i++) {
                for (var k = i + 1; k < tree.children.length; k++) {
                    var tree1 = tree.children[i];
                    var tree2 = tree.children[k];
                    var item = {
                        tree1: tree1,
                        tree2: tree2,
                        similarity: comparator.run(tree1, tree2, compareRate),
                        complexity: bicomplexity.run(tree1, tree2, complexityNeigbourRate, complexityDeepRate)
                    };
                    if (item.similarity >= similarityCutoff && item.complexity >= complexityCutoff) {
                        items.push(item)
                    }
                }
            }

            if (items.length > 0) {
                var uniqItems = items.flatMap(function (item) {
                    return [item.tree1, item.tree2];
                }).unique();
                var itemsTree = new Tree(new TreeNodeEmpty(), uniqItems);
                var rate = candidateItemsRate.run(items);
                res.push({
                    tree: itemsTree,
                    length: itemsTree.children.length,
                    rate: rate
                });
            }
        }
        for (var i = 0; i < tree.children.length; i++) {
            res = res.concat(findCandidates(tree.children[i]));
        }
        return res;
    }

    function selectCandidate(candidates) {
        return candidates.sort(function (items1, items2) {
            if (items1.rate.score > items2.rate.score) {
                return -1;
            } else if (items1.rate.score < items2.rate.score) {
                return 1;
            }
            return 0;
        })[0];
    }


}