/**
 * Created by imsamurai on 13.01.2016.
 */
function FieldsExtractor(tree, fieldBuilder) {
    //var comparator = new TreeComparatorClass();
    //var fieldBuilder = new FieldBuilder();

    this.run = function() {
        Logger.info('Start fields extraction');
        Logger.log('Tree is', tree);
        //console.log(JSON.stringify(tree.children[0].serialize()));
        var seedTree = tree.children[0].simplify();
        Logger.log('Initial simplified seed tree is', seedTree);

        for (var pos = 1; pos < tree.children.length; pos++) {
            seedTree = seedTree.mergeAligned(tree.children[pos].clone());
        }

        Logger.log('Updated seed is', seedTree);
        var fieldSet = extract(seedTree, tree.children);
        Logger.log('Extracted fieldSet is', fieldSet);

        Logger.info('End fields extraction');
        return fieldSet;
    }



    function extract(seedTree, trees) {
        var data = [];
        for (var i = 0; i < trees.length; i++) {
            data.push(extractOne(seedTree, trees[i]));
        }
        var fieldsetBuilder = new FieldsetBuilder();
        return fieldsetBuilder.build(data);
    }

    function extractOne(seedTree, tree) {
        var fieldSet = [];
        for (var pos = 0; pos < seedTree.children.length; pos++) {
            var treeItems = tree.findLike(seedTree.children[pos]);
            if (seedTree.children[pos].node.id==14897) {
                var r = 3;
            }
            fieldSet = fieldSet.concat(fieldBuilder.build(
                seedTree.children[pos],
                seedTree.children[pos].node.id,
                treeItems,
                tree
            ));

            for (var num = 0; num < treeItems.length; num++) {
                fieldSet = fieldSet.concat(extractOne(seedTree.children[pos], treeItems[num]));
            }

        }
        return fieldSet;
    }

}