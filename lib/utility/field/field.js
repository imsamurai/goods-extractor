/**
 * Created by imsamurai on 14.01.2016.
 */
function Field(name, value, seed) {
    this.name = name;
    this.value = value;
    this.type = "text";
    this.typeRate = 0.0;
    this.getSeed = function() { return seed; };
    this.stringValue = function() {
        return this.value.join ? this.value.join() : this.value;
    }
}