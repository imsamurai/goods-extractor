/**
 * Created by imsamurai on 14.01.2016.
 */
function Field(name, value) {
    this.name = name;
    this.value = value;
    this.type = "text";
    this.stringValue = function() {
        return this.value.join ? this.value.join() : this.value;
    }
}