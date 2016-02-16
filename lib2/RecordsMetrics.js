
/**
 * Created by imsamurai on 13.01.2016.
 */
function RecordsMetrics(metricCompare, metricComplexity, cutoff) {

    this.rateTrees = function(tree1, tree2) {
        var similarity = metricCompare.run(tree1, tree2);
        var complexity = metricComplexity.run(tree1, tree2);
        return similarity * complexity;
    }

    this.rateAvg = function (records) {
        return records.reduce(function (acc, record) {
                return acc + record.rate;
            }, 0) / records.length;
    }

    this.rateTotal = function (records) {
        var avgRate = this.rateAvg(records);
        var lengthRate = 1 - 1/(1+records.length);
        var rate = avgRate * lengthRate;
        return rate < cutoff ? 0 : rate;
    }

}

exports.RecordsMetrics = RecordsMetrics;