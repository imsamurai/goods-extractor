/**
 * Created by imsamurai on 14.01.2016.
 */
function FieldsTaggerProduct(network, model) {
    this.run = function(field, seed, fieldNum, treeItems, tree) {
        if (!treeItems[0] || !field.value) {
            return field;
        }
        var m = new model(treeItems[0].DOMNode, field.value.toString(), network.dic);
        var type = network.likely(m.getSample());
        if (type!==false) {
            field.type = type[0];
            field.typeRate = type[1];
        }
        return field;
    };

    this.validate = function(fieldSet) {
        var fieldsGroups = Object.values(fieldSet.transpose().data);
        Logger.log('FieldsTaggerProduct got fields to validate', fieldsGroups);
        if (fieldsGroups.length < 3) {
            return false;
        }
        var types = fieldsGroups.map(function(fields) {
            var typesCounts = fields.map(function(field) {
                return field.type;
            }).reduce(function(countMap, word) {countMap[word] = ++countMap[word] || 1;return countMap}, {});

            var types = Object.keys(typesCounts);
            var count = Object.values(typesCounts);
            var maxCount = Math.max.apply(null, count);
            return {
                type: types[count.indexOf(maxCount)],
                rate: maxCount/fields.length
            };
        }).filter(function(type) {
            return type.rate>=0.5;
        }).map(function(type) {
            return type.type;
        }).unique();
        Logger.log('Found types', types);
        if (
         types.indexOf('price') === -1
        || types.indexOf('link') === -1
        || types.indexOf('title') === -1
        || types.indexOf('image') === -1
        ) {
            return false;
        }
        return true;
    }

}