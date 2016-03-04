/**
 * Created by imsamurai on 15.02.2016.
 */
function FieldOutputHTML() {
    this.run = function (fieldCollection) {
        var bestGroups = fieldCollection.getBestGroups();
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
                var out = '';
                if (bestGroups.indexOf(fieldGroup) !== -1) {
                    out += '<th style="background-color: darkgrey;">';
                } else {
                    out += '<th>';
                }
                return out + fieldGroup.name + '(' + fieldGroup.type + ': ' + fieldGroup.rate + ')' + '</th>'
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
                    row += '<td><strong title="' + JSON.stringify(fields[counter].rates).replace(/"/g, "") + '">'+ fields[counter].value + '</strong>';
                    row += fields[counter].getFields().filter(function(field) {
                        return field !== fields[counter].field;
                    }).map(function(field) {
                        return '<span style="color: gray;" title="' + JSON.stringify(field.rates).replace(/"/g, "") + '">'+ field.value + '</span>'
                    }, row).join(' ||| ');
                    row += "</td>";
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

