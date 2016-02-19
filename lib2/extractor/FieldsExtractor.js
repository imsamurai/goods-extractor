/**
 * Created by imsamurai on 15.02.2016.
 */
function FieldsExtractor(fieldValueExtractor, fieldTagger, metricRate) {
    this.run = function (recordCollection) {
        var fieldGroups = extract(recordCollection.tree.children, recordCollection.records.map(function (record) {
            return record.tree;
        }), recordCollection.records, []);

        var fieldCollection = fieldTagger.run(new FieldCollection(fieldGroups, recordCollection));

        var filterType = {};
        fieldCollection.fieldGroups = fieldCollection.fieldGroups.filter(function (fieldGroup) {
            return fieldGroup.rate > 0;
        }).sort(function (fieldGroup1, fieldGroup2) {
            if (fieldGroup1.rate > fieldGroup2.rate) {
                return -1;
            } else if (fieldGroup1.rate < fieldGroup2.rate) {
                return 1;
            }
            return 0;
        }).filter(function (fieldGroup) {
            if (filterType[fieldGroup.type]) {
                return false;
            }
            filterType[fieldGroup.type] = 1;
            return true;
        });

        fieldCollection.rate = metricRate.rateGroups(fieldCollection.fieldGroups);
        return fieldCollection;
    };


    function extract(seedTrees, trees, records, fieldGroupsAcc) {
        return fieldGroupsAcc.concat(
            seedTrees.flatMap(function (seedTree) {
                var extractors = fieldValueExtractor.detectExtractors(seedTree);
                var fieldGroups = extractors.map(function (extractor) {
                    var extractorName = extractor[0];
                    var extractorMethod = extractor[1];

                    var fields = records.flatMap(function (record, index) {
                        var tree = trees[index];
                        //TODO: implement case if findLike returns more than 1 tree
                        return tree.findLike(seedTree).slice(0,1).map(function (matchTree) {
                            return new Field(extractorMethod(matchTree), record, matchTree);

                        });
                    });

                    return new FieldGroup(fields, 'field#' + seedTree.node.id + '_' + extractorName, null, 0.0, seedTree);

                });

                fieldGroupsAcc = fieldGroupsAcc.concat(fieldGroups.filter(function(fg) {
                    return fg.fields.filter(function(field) {
                            return field.value !== "";
                        }).length > 0;
                }));

                var subTreesRecords = fieldGroups.slice(0,1).flatMap(function(fieldGroup) {
                    return fieldGroup.fields.map(function (field) {
                        return [field.tree, field.record];
                    });
                });

                return extract(seedTree.children, subTreesRecords.map(function (it) {
                    return it[0];
                }), subTreesRecords.map(function (it) {
                    return it[1];
                }), fieldGroupsAcc);
            })
        );
    }

}

