/**
 * Created by imsamurai on 15.02.2016.
 */
function FieldsTagger(neuralNet, neuralModel, cutoff) {
    var labels = Object.keys(neuralNet.outputLookup);

    this.run = function(fieldCollection) {
        fieldCollection.fieldGroups.forEach(function(fieldGroup) {
            var bestLabel = getBestLabel(fieldGroup, fieldCollection);
            if (bestLabel.rate > cutoff) {
                fieldGroup.rate = bestLabel.rate;
                fieldGroup.type = bestLabel.label;
            }
        });

        return fieldCollection;
    }

    function getBestLabel(fieldGroup, fieldCollection) {
        var rates = getRates(fieldGroup, fieldCollection);

        return labels.reduce(function(rate, label) {
            if (rate.rate <= rates[label]) {
                rate = {label: label, rate: rates[label]}
            }
            return rate;
        }, {label: "", rate: 0.0});

    }

    function getInitRates() {
        return labels.reduce(function(acc, label) {
            acc[label] = 0;
            return acc;
        }, {});
    }

    function getRates(fieldGroup, fieldCollection) {
        var initRates = getInitRates();
        var rates = fieldGroup.fields.map(function(field) {
            return neuralNet.run(neuralModel.getSampleFromField(field));
        }).reduce(function(acc, rate) {
            labels.forEach(function(label) {
                acc[label] += rate[label];
            });
            return acc;
        }, initRates);

        labels.forEach(function(label) {
            rates[label] /= fieldCollection.recordCollection.records.length;
        });
        return rates;
    }
}

