/**
 * Created by imsamurai on 15.02.2016.
 */
function FieldVariant(fields) {
    var self = this;
    this.value = null;
    this.record = null;
    this.tree = null;
    this.rates = null;
    this.fields = fields;
    this.field = null;

    setField(fields[0]);

    function setField(field) {
        self.value = field.value;
        self.record = field.record;
        self.tree = field.tree;
        self.rates = field.rates;
        self.field = field;
    }

    /**
     * Reset to first field
     */
    this.refresh = function() {
        setField(fields[0]);
    };

    /**
     * Add field
     *
     * @param field
     */
    this.addField = function(field) {
        fields.push(field);
    };

    /**
     * Get all fields
     *
     * @returns Field[]
     */
    this.getFields = function() {
        return fields;
    };

    /**
     * Set best field as current depends on type and rate
     *
     * @param type
     */
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

