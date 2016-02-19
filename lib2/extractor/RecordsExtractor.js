/**
 * Created by imsamurai on 15.02.2016.
 */
function RecordsExtractor(metricRate) {

    this.run = function(tree) {
        return sortRecords(findRecordsDeep(findRecords(tree), []));
    }

    function findRecordsDeep(inRecordCollections, outRecordCollections) {
        if (inRecordCollections.length < 2) {
            return outRecordCollections.concat(inRecordCollections);
        }

        var recordCollectionFirst = inRecordCollections.shift();
        for (var c2=0;c2<inRecordCollections.length;c2++) {
            var seedTree = recordCollectionFirst.tree.merge(inRecordCollections[c2].tree);
            var seedRecords = findRecordsOne(seedTree);
            if (!seedRecords.rate) {
                continue;
            }
            var tree = recordCollectionFirst.tree.mergeChildren((inRecordCollections[c2].tree));
            var recordCollection = findRecordsOne(tree);
            if (!recordCollection.rate) {
                continue;
            }
            return findRecordsDeep([recordCollection]
                .concat(inRecordCollections.slice(0, c2))
                .concat(inRecordCollections.slice(c2+1)), outRecordCollections);

        }
        return findRecordsDeep(inRecordCollections, outRecordCollections.concat(recordCollectionFirst));
    }

    function findRecords(tree) {
        var res = findRecordsOne(tree);
        var childRes = [];
        for (var i = 0; i < tree.children.length; i++) {
            childRes = childRes.concat(findRecords(tree.children[i]));

        }
        return [res].concat(childRes).filter(function(records) {
            return !!records.rate;
        });
    }

    function findRecordsOne(tree) {
        if (tree.children.length <= 1) {
            return new RecordCollection();
        }
        var recordsRawObj = {};
        for (var i = 0; i < tree.children.length - 1; i++) {
            for (var k = i + 1; k < tree.children.length; k++) {
                var tree1 = tree.children[i];
                var tree2 = tree.children[k];
                var rate = metricRate.rateTrees(tree1, tree2);

                if (rate > 0) {
                    recordsRawObj[tree1.node.id] = recordsRawObj[tree1.node.id] ? recordsRawObj[tree1.node.id] : [];
                    recordsRawObj[tree1.node.id].push(new Record(tree1, rate));

                    recordsRawObj[tree2.node.id] = recordsRawObj[tree2.node.id] ? recordsRawObj[tree2.node.id] : [];
                    recordsRawObj[tree2.node.id].push(new Record(tree2, rate));
                }
            }
        }

        var recordsRaw = Object.values(recordsRawObj);
        if (recordsRaw.length === 0) {
            return new RecordCollection();
        }
        var records = recordsRaw.map(function (records) {
            var rank = metricRate.rateAvg(records);
            return new Record(records[0].tree, rank);
        });

        var seed = records.slice(1).reduce(function (seed, record) {
            return seed.mergeAligned(record.tree.clone());
        }, records[0].tree.simplify());
        return new RecordCollection(seed, metricRate.rateTotal(records), records);
    }

    function sortRecords(recordCollections) {
        return recordCollections.sort(function (recordCollection1, recordCollection2) {
            if (recordCollection1.rate > recordCollection2.rate) {
                return -1;
            } else if (recordCollection1.rate < recordCollection2.rate) {
                return 1;
            }
            return 0;
        });
    }
}

