/**
 * Created by imsamurai on 15.02.2016.
 */
function FieldOutputHTML() {
    this.run = function (fieldCollection) {
        // var output = '';
        var fieldsByRecords = Object.values(fieldCollection.fieldGroups.reduce(function (records, fieldGroup, groupIndex) {
            return fieldGroup.fields.reduce(function (records, field) {
                if (!records[field.record.id]) {
                    records[field.record.id] = {};
                }
                records[field.record.id][groupIndex] = field;
                return records;
            }, records);
        }, {}));

        var tableHead = '<tr><th>#</th>' +
            fieldCollection.fieldGroups.map(function (fieldGroup) {
                return '<th>' + fieldGroup.name + '(' + fieldGroup.type + ': ' + fieldGroup.rate + ')' + '</th>'
            }).join('') +
            '</tr>';

        var maxKey = Math.max.apply(null, fieldsByRecords.flatMap(function (fields) {
            return Object.keys(fields);
        }));
        var tableBody = fieldsByRecords.map(function (fields, index) {
            var row = '<td>' + (index + 1) + '</td>';
            var counter = 0;
            while (counter <= maxKey) {
                if (fields[counter]) {
                    row += "<td>" + fields[counter].value + "</td>";
                } else {
                    row += "<td></td>";
                }
                counter++;
            }
            return "<tr>" + row + "</tr>";
        }).join('');
        return '<table border="1"><thead>' + tableHead + '</thead><tbody>' + tableBody + '</tbody></table>';
    }
}

