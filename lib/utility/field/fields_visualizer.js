/**
 * Created by imsamurai on 14.01.2016.
 */
function FieldVisualizer(fieldSet, document) {
    this.run = function () {
        Logger.info('Visualize fieldSet');
        var data = fieldSet.transpose().data;
        var head = Object.keys(data);
        Logger.log('FieldSet for table is', data);
        var table = document.createElement('table');
        table.border = 1;
        var tr = document.createElement('tr');
        var th = document.createElement('th');
        th.innerHTML = '#';
        tr.appendChild(th);

        for (var pos = 0; pos < head.length; pos++) {
            var th = document.createElement('th');
            th.innerHTML = head[pos];
            tr.appendChild(th);

        }
        table.appendChild(tr);
        for (var pos = 0; pos < fieldSet.data.length; pos++) {
            var tr = document.createElement('tr');
            var td = document.createElement('td');
            td.innerHTML = pos;
            tr.appendChild(td);
            for (var posVal = 0; posVal < head.length; posVal++) {
                var td = document.createElement('td');
                var field = data[head[posVal]][pos];
                td.innerHTML = field === undefined ? '<i>-none-</i>' : "<b>"+field.type+"(" + field.typeRate + ")"+":</b> " + field.value;
                tr.appendChild(td);
            }

            table.appendChild(tr);
        }
        document.body.appendChild(table);

    }

}