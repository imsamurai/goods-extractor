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
        var candidates = sortCandidates(findCandidatesDeep(findCandidates(tree), []));
        Logger.log('Candidates', candidates);
        return candidates;
    }

    function findCandidatesDeep(inCandidates, outCandidates) {
        if (inCandidates.length < 2) {
            return outCandidates.concat(inCandidates);
        }

        var candidate1 = inCandidates.shift();
        for (var c2=0;c2<inCandidates.length;c2++) {
            var seedTree = new Tree(new TreeNodeEmpty(), [candidate1.seedTree, inCandidates[c2].seedTree]);
            var seedCandidates = findCandidatesOne(seedTree);
            if (seedCandidates.length > 0) {
                var tree = new Tree(new TreeNodeEmpty(), candidate1.tree.children.concat(inCandidates[c2].tree.children));
                var candidates = findCandidatesOne(tree);
                return findCandidatesDeep(candidates.concat(inCandidates.slice(0, c2)).concat(inCandidates.slice(c2+1)), outCandidates)
            }
        }
        return findCandidatesDeep(inCandidates, outCandidates.concat(candidate1));
    }

    function findCandidates(tree) {
        var res = findCandidatesOne(tree);
        var childRes = [];
        for (var i = 0; i < tree.children.length; i++) {
            childRes = childRes.concat(findCandidates(tree.children[i]));

        }
        return res.concat(childRes);
    }

    function findCandidatesOne(tree) {
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
                var seedTree = uniqItems[0].simplify();
                for (var pos = 1; pos < uniqItems.length; pos++) {
                    seedTree = seedTree.mergeAligned(uniqItems[pos].clone());
                }
                res.push({
                    tree: itemsTree,
                    seedTree: seedTree,
                    length: itemsTree.children.length,
                    rate: rate
                });
            }
        }
        return res;
    }

    function sortCandidates(candidates) {
        return candidates.sort(function (items1, items2) {
            if (items1.rate.score > items2.rate.score) {
                return -1;
            } else if (items1.rate.score < items2.rate.score) {
                return 1;
            }
            return 0;
        });
    }


}