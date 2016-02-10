/**
 * Created by imsamurai on 15.01.2016.
 */
function FieldsFilter(fieldSet) {
    this.run = function() {
        Logger.info('Filter fieldSet');
        if (!fieldSet) {
            return fieldSet;
        }
        var data = fieldSet.transpose();
        var fieldNames = Object.keys(data.data);
        Logger.log(fieldNames);
        var fieldStatistics = [];
        for (var posName = 0;posName<fieldNames.length;posName++) {
            var values = [];
            var types = [];
            var typesRate = [];
            for (var posField = 0; posField<data.data[fieldNames[posName]].length;posField++) {
                if (data.data[fieldNames[posName]][posField]) {
                    values.push(data.data[fieldNames[posName]][posField].value);
                    types.push(data.data[fieldNames[posName]][posField].type);
                    typesRate.push(data.data[fieldNames[posName]][posField].typeRate);
                }
            }
            Logger.log(values);
            var valueUniq = values.deepUnique();
            if (
                valueUniq.length === 1
                || (values.length / fieldSet.data.length) < 0.5
                || (Math.min.apply(null, typesRate) === 0 && Math.max.apply(null, typesRate) === 0)
            ) {
                Logger.log('delete field', fieldNames[posName]);
                delete data.data[fieldNames[posName]];
            } else {
                var typesCounts = types.reduce(function(countMap, word) {countMap[word] = ++countMap[word] || 1;return countMap}, {});
                var typeNames = Object.keys(typesCounts);
                var typeCounts = Object.values(typesCounts);
                var maxCount = Math.max.apply(null, typeCounts);
                var bestType = typeNames[typeCounts.indexOf(maxCount)];

                if (bestType == 'text') {
                    Logger.log('delete text field', fieldNames[posName]);
                    delete data.data[fieldNames[posName]];
                    continue;
                }

                var rateSum = data.data[fieldNames[posName]]
                        .map(function(field) {
                            if (field instanceof FieldGroup) {
                                var fieldGroup = field;
                                var fields = fieldGroup.getFields().filter(function(field) {return field.type==bestType;})
                                if (!fields) {
                                    return null;
                                }
                                return fields.sort(function (items1, items2) {
                                            if (items1.typeRate > items2.typeRate) {
                                                return -1;
                                            } else if (items1.typeRate < items2.typeRate) {
                                                return 1;
                                            }
                                            return 0;
                                        })[0];
                            }
                            return field;
                        })
                        .filter(function(field) {return field && field.type==bestType;}).reduce(function(acc, field) { return acc + field.typeRate; }, 0) / data.data[fieldNames[posName]].length;

                if (!fieldStatistics[bestType]) {
                    fieldStatistics[bestType] = [];
                }
                fieldStatistics[bestType].push({
                    index: posName,
                    type: bestType,
                    rate: rateSum
                });
            }

        }
        var fieldStatisticsVal = Object.values(fieldStatistics);
        fieldStatisticsVal.forEach(function(stat) {
            var sortedStat = stat.sort(function (items1, items2) {
                if (items1.rate > items2.rate) {
                    return -1;
                } else if (items1.rate < items2.rate) {
                    return 1;
                }
                return 0;
            });
            sortedStat.slice(1).forEach(function(item) {
                Logger.log('delete duplicate field '+item.type+' by rate '+item.rate ,fieldNames[posName]);
                delete data.data[fieldNames[item.index]];
            });
        });
        //console.log(fieldStatistics);
        //Logger.info('Filtered', data.transpose());
        return data.transpose();
    }


}