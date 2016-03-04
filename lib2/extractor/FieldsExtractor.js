/**
 * Created by imsamurai on 15.02.2016.
 */
function FieldsExtractor(fieldValueExtractor, fieldTagger, metricRate, fieldCutoff) {
    this.run = function (recordCollection) {
        var trees = recordCollection.records.map(function (record) {
            return record.tree.transformInsideOut();
        });
        var seedTrees = completeSeeds(recordCollection.tree.transformInsideOut(), trees);
        var fieldGroups = extract(seedTrees, trees, recordCollection.records, []);
        var fieldCollection = fieldTagger.run(groupFields(new FieldCollection(groupFieldGroups(fieldGroups), recordCollection)));

        fieldCollection.fieldGroups = filterGroups(fieldCollection.fieldGroups).sort(function (fieldGroup1, fieldGroup2) {
            if (fieldGroup1.rate > fieldGroup2.rate) {
                return -1;
            } else if (fieldGroup1.rate < fieldGroup2.rate) {
                return 1;
            }
            return 0;
        }).map(filterFields);


        fieldCollection.rate = (metricRate.rateGroups(fieldCollection.getBestGroups()) + recordCollection.rate) / 2;
        //console.log(fieldCollection);
        return fieldCollection;
    };

    function completeSeeds(seedTrees, trees) {
        return trees.reduce(function(seeds, tree) {
            return seeds.concat(tree.filter(function(treeItem) {
                return treeItem.findLikeMany(seeds).length === 0;
            }));
        }, seedTrees);
    }


    function extract(seedTrees, trees, records) {
        return seedTrees.flatMap(function (seedTree) {
            var extractors = fieldValueExtractor.detectExtractors(seedTree);
            return extractors.map(function (extractor) {
                var extractorName = extractor[0];
                var extractorMethod = extractor[1];

                var fields = records.flatMap(function (record, index) {
                    return seedTree.findLikeMany(trees[index]).map(function (matchTree) {
                        var val = extractorMethod(matchTree);
                        return new Field(val, record, matchTree);

                    });
                });

                return new FieldGroup(fields, 'field#' + seedTree.node.id + '_' + extractorName, null, 0.0, seedTree);

            });
        });
    }

    function groupFields(fieldCollection) {
        fieldCollection.fieldGroups.forEach(function (fieldGroup) {
            var fields = fieldGroup.fields.reduce(function (acc, field) {
                if (!acc[field.record.id]) {
                    acc[field.record.id] = new FieldVariant([field]);
                } else {
                    acc[field.record.id].addField(field);
                }
                return acc;
            }, {});
            fieldGroup.fields = Object.values(fields);
        });
        return fieldCollection;
    }

    function groupFieldGroups(fieldGroups) {
        return Object.values(fieldGroups.reduce(function (groups, fieldGroup) {
            var valuesHash = fieldGroup.fields.map(function(field) {
                return field.tree.node.outerHTML+field.value;
            }).join('###');
            if (!groups[valuesHash]) {
                groups[valuesHash] = fieldGroup;
            }
            return groups;
        }, {}));
    }

    function filterGroups(fieldGroups) {
        return fieldGroups.filter(function (fieldGroup) {
            var fieldValues = fieldGroup.fields.map(function (field) {
                return field.value;
            });
            return fieldValues.unique().length > 1;
        });
    }

    function filterFields(fieldGroup) {
        fieldGroup.fields = fieldGroup.fields.filter(function (field) {
            return fieldGroup.type == null || field.rates[fieldGroup.type] > fieldCutoff;
        });
        return fieldGroup;
    }

}

