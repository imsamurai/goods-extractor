/**
 * Created by imsamurai on 13.01.2016.
 */
function FieldsMetrics(cutoff) {

    this.rateGroups = function (fieldGroups) {
        var rate = 0;
        if (fieldGroups.length === 0) {
            return rate;
        }
        rate = fieldGroups.reduce(function (sum, fieldGroup) {
                return sum + fieldGroup.rate;
            }, 0) / fieldGroups.length * (1 - 1 / (1 + fieldGroups.length));

        return rate > cutoff ? rate : 0;
    }

}

exports = FieldsMetrics;