/**
 * Created by imsamurai on 15.01.2016.
 */
function FieldSet(data) {
    this.data = data;

    this.transpose = function() {
        var table = {};
        for (var posSet = 0; posSet < data.length; posSet++) {
            for (var posField = 0; posField < data[posSet].length; posField++) {
                var field = data[posSet][posField];
                if (!field) {
                    continue;
                }
                if (!table[field.name]) {
                    table[field.name] = [];
                }
                table[field.name][posSet] = field;
            }
        }
        return new FieldSetTrans(table);
    }
}

function FieldSetTrans(data) {
    this.data = data;

    this.transpose = function() {
        var table = [];
        var fields = Object.values(data);
        Logger.log(data);
        Logger.log(fields);
        for (var posSet = 0; posSet < fields.length; posSet++) {
            for (var posItem = 0; posItem < fields[posSet].length; posItem++) {
                if (!table[posItem]) {
                    table[posItem] = [];
                }
                table[posItem][posSet] = fields[posSet][posItem];
            }
        }
        return new FieldSet(table);
    }
}