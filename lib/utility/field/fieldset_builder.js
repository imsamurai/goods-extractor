/**
 * Created by imsamurai on 28.01.2016.
 */
function FieldsetBuilder() {
    this.build = function(data) {
        for (var setNum=0;setNum<data.length;setNum++) {
            var fields = {};
            for (var fieldNum=0;fieldNum<data[setNum].length;fieldNum++) {
                var field = data[setNum][fieldNum];
                if (!fields[field.name]) {
                    fields[field.name] = field;
                } else if (fields[field.name] instanceof Field) {
                    fields[field.name] = new FieldGroup([fields[field.name], field]);
                } else if (fields[field.name] instanceof FieldGroup) {
                    fields[field.name] = fields[field.name].add(field);
                }
            }
            data[setNum] = Object.values(fields);
        }
        return normalizeFields(new FieldSet(data));
    }

    function normalizeFields(fieldSet) {
        var fieldSetTrans = fieldSet.transpose();

        for(field in fieldSetTrans.data) {
            var types = {};
            for (var posField = 0; posField<fieldSetTrans.data[field].length;posField++) {
                if (fieldSetTrans.data[field][posField]) {
                    var type = fieldSetTrans.data[field][posField].type;
                    if (!types[type]) {
                        types[type] = 0;
                    }
                    types[type]++;
                }
            }
            if (Object.keys(types).length > 1) {
                var maxType = Object.keys(types).reduce(function(ob1, type){
                    if (types[type] > ob1.value) {
                        return {type: type, value: types[type]};
                    } else {
                        return ob1;
                    }
                }, {type: null, value: 0});

                for (var posField = 0; posField<fieldSetTrans.data[field].length;posField++) {
                    if (fieldSetTrans.data[field][posField]) {
                       // fieldSetTrans.data[field][posField].type = maxType.type;
                    }
                }
            }
            //console.log(maxType);
        }
        return fieldSetTrans.transpose();
    }

}