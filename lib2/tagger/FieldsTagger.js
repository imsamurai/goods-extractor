/**
 * Created by imsamurai on 15.02.2016.
 */
//var debug;
function FieldsTagger(neuralNet, neuralModel, cutoff, fieldCutoff) {
    var labels = Object.keys(neuralNet.outputLookup);

    this.run = function (fieldCollection) {
        fieldCollection.fieldGroups.forEach(function (fieldGroup) {
            //if (fieldGroup.name=="field#6909_text") {
            //    debug = 1;
            //} else {
            //    debug = 0;
            //}
            rateFields(fieldGroup.fields);
            var bestLabel = getBestLabel(fieldGroup.fields, fieldCollection);
            chooseBestFields(fieldGroup.fields, bestLabel.label);
            bestLabel = getBestLabel(fieldGroup.fields, fieldCollection, true);
            if (bestLabel.rate > cutoff) {
                fieldGroup.rate = bestLabel.rate;
                fieldGroup.type = bestLabel.label;
            }
        });

        return fieldCollection;
    }

    function getBestLabel(fields, fieldCollection, rateByBestField) {
        var rates = getRates(fields, fieldCollection, rateByBestField);

        var bestLabel = labels.reduce(function (rate, label) {
            if (rate.rate <= rates[label]) {
                rate = {label: label, rate: rates[label]}
            }
            return rate;
        }, {label: "", rate: 0.0});

        var fieldsValues = fields.map(function(field) {
            return field.value;
        });
        var rateUnique = fieldsValues.unique().length / fieldsValues.length;
        bestLabel.rate = 0.9 * bestLabel.rate + 0.1 * rateUnique;
        return bestLabel;
    }

    function getInitRates() {
        return labels.reduce(function (acc, label) {
            acc[label] = 0;
            return acc;
        }, {});
    }

    function getRates(fields, fieldCollection, rateByBestField) {
        var rates = fields.flatMap(function (fieldVariant) {
            if (rateByBestField) {
                varRates = fieldVariant.rates;
            } else {

                var varRates = sumRates(fieldVariant.getFields().map(function (field) {
                    return field.rates;
                }));
                labels.forEach(function (label) {
                    varRates[label] = varRates[label] / fieldVariant.getFields().length;
                });
            }
            return labels.filter(function (label) {
                return varRates[label] > fieldCutoff;
            }).length > 0 ? [varRates] : [];
        });

        var avgRates = sumRates(rates);

        var length = rates.length;//Math.max(fieldCollection.recordCollection.records.length, fieldGroup.fields.length);
        var lengthRate = length / Math.max(fieldCollection.recordCollection.records.length, rates.length);

        labels.forEach(function (label) {
            avgRates[label] = 0.2 * lengthRate + 0.8 * avgRates[label] / length;
        });
        return avgRates;
    }

    function sumRates(rates) {
        return rates.reduce(function (acc, rate) {
            labels.forEach(function (label) {
                acc[label] += rate[label];
            });
            return acc;
        }, getInitRates());
    }

    function rateFields(fields) {
        fields.forEach(function (fieldVariant) {
            fieldVariant.getFields().forEach(function (field) {
                field.rates = neuralNet.run(neuralModel.getSampleFromField(field));

            });
            fieldVariant.refresh();
        });
    }

    function chooseBestFields(fields, type) {
        fields.forEach(function (fieldVariant) {
            fieldVariant.setBestField(type);
        });
    }
}

