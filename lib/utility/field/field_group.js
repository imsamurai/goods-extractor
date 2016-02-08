/**
 * Created by imsamurai on 28.01.2016.
 */
function FieldGroup(fields) {
    this.name = fields[0].name;
    this.value = fields.map(function(field){ return field.value;}).join(';;; ');
    this.type = "text";
    this.typeRate = 0.0;
    this.getSeed = function() { return fields[0].seed; };
    this.stringValue = function() {
        return this.value.join ? this.value.join() : this.value;
    }
    this.add = function(field) {
        return new FieldGroup(fields.concat([field]));
    }
    this.getFields = function() {
        return fields;
    }
}