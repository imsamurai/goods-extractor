/**
 * Created by imsamurai on 15.01.2016.
 */
function FieldsFilter(fieldSet) {
    this.run = function() {
        Logger.info('Filter fieldSet');
        var data = fieldSet.transpose();
        var fieldNames = Object.keys(data.data);
        console.log(fieldNames);
        for (var posName = 0;posName<fieldNames.length;posName++) {
            var values = [];
            for (var posField = 0; posField<data.data[fieldNames[posName]].length;posField++) {
                if (data.data[fieldNames[posName]][posField]) {
                    values.push(data.data[fieldNames[posName]][posField].value);
                }
            }
            console.log(values);
            var valueUniq = values.deepUnique();
            if (valueUniq.length === 1 && [valueUniq].join().match(/^,*$/)) {
                console.log(fieldNames[posName]);
                delete data.data[fieldNames[posName]];
            }

        }
        //Logger.info('Filtered', data.transpose());
        return data.transpose();
    }


}