/**
 * Created by imsamurai on 25.02.2016.
 */
function XPathAttr(name, value) {
    this.name = name;
    this.value = value;

    this.toString = function () {
        return this.value;
    };

    this.equals = function (attr) {
        return this.name == attr.name;
    };

    this.merge = function (attr) {
        if (attr === undefined) {
            return null;
        }
        if(this.value == attr.value) {
            return new XPathAttr(this.name, this.value);
        }
        if (!this.value || !attr.value) {
            return null;
        }
        if (this.name == 'NUMBER') {
            return null;
        }

        var value = this.value;
        if (value.indexOf(attr.value) === -1) {
            value+=' or '+ attr.value;
        }
        return new XPathAttr(this.name, value);
    }

    this.clone = function() {
        return new XPathAttr(this.name, this.value);
    }
}