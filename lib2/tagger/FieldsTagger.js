/**
 * Created by imsamurai on 15.02.2016.
 */
function FieldsTagger(neuralNet, neuralModel, cutoff) {
    var labels = Object.keys(neuralNet.outputLookup);

    this.run = function (fieldCollection) {
        fieldCollection.fieldGroups.forEach(function (fieldGroup) {
            var bestLabel = getBestLabel(fieldGroup.fields, fieldCollection);
            if (bestLabel.rate > cutoff) {
                fieldGroup.rate = bestLabel.rate;
                fieldGroup.type = bestLabel.label;
            }
        });

        return fieldCollection;
    }

    function getBestLabel(fields, fieldCollection) {
        var rates = getRates(fields, fieldCollection);

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

    function getRates(fields, fieldCollection) {
        var rates = fields.map(function (field) {
            return neuralNet.run(neuralModel.getSampleFromField(field));
        });

        var avgRates = rates.reduce(function (acc, rate) {
            labels.forEach(function (label) {
                acc[label] += rate[label];
            });
            return acc;
        }, getInitRates());


        var length = fields.length;//Math.max(fieldCollection.recordCollection.records.length, fieldGroup.fields.length);
        var lengthRate = length / Math.max(fieldCollection.recordCollection.records.length, fields.length);

        labels.forEach(function (label) {
            avgRates[label] = 0.2 * lengthRate + 0.8 * avgRates[label] / length;
        });
        return avgRates;
    }
}

