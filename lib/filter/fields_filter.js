/**
 * Created by imsamurai on 15.01.2016.
 */
function FieldsFilter(fieldSet) {
    this.run = function() {
        Logger.info('Filter fieldSet');
        var data = fieldSet.transpose();
        var fieldNames = Object.keys(data.data);
        Logger.log(fieldNames);
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
            }

        }
        //Logger.info('Filtered', data.transpose());
        return data.transpose();
    }


}