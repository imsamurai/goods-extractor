/**
 * Created by imsamurai on 15.02.2016.
 */
function FieldVariant(fields) {
    var self = this;
    this.value = null;
    this.record = null;
    this.tree = null;
    this.rates = null;

    setField(fields[0]);

    function setField(field) {
        self.value = field.value;
        self.record = field.record;
        self.tree = field.tree;
        self.rates = field.rates;
    }

    this.refresh = function() {
        setField(fields[0]);
    }


    this.addField = function(field) {
        fields.push(field);
    }

    this.getFields = function() {
        return fields;
    }

    this.setBestField = function(type) {
        var field = fields.sort(function (field1, field2) {
            if (field1.rates[type] > field2.rates[type]) {
                return -1;
            } else if (field1.rates[type] < field2.rates[type]) {
                return 1;
            }
            return 0;
        })[0];
        if (field) {
            setField(field);
        }
    }
}

