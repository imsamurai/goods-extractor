/**
 * Created by imsamurai on 14.01.2016.
 */
function Field(name, value, seed, treeItems) {
    this.name = name;
    this.value = value;
    this.type = "text";
    this.getSeed = function() { return seed; };
    this.getTreeItems = function() { return treeItems; };
    this.stringValue = function() {
        return this.value.join ? this.value.join() : this.value;
    }
}