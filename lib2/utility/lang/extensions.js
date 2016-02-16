/**
 * Created by imsamurai on 13.01.2016.
 */
Array.prototype.flatMap = function (lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
};
Array.prototype.unique = function () {
    var a = [];
    for (var i = 0, l = this.length; i < l; i++)
        if (a.indexOf(this[i]) === -1)
            a.push(this[i]);
    return a;
}

Array.prototype.deepUnique = function () {
    var a = {};
    for (var i = 0, l = this.length; i < l; i++) {
        var hash = JSON.stringify(this[i]);
        if (a[hash] === undefined) {
            a[hash] = this[i];
        }
    }
    return Object.values(a);
}

Object.values = function (obj) {
    var vals = [];
    for( var key in obj ) {
        if ( obj.hasOwnProperty(key) ) {
            vals.push(obj[key]);
        }
    }
    return vals;
}

Object.sortByKeys = function (obj) {
    var that = obj;
    return Object.keys(obj).sort().reduce(function (result, key) {
        result[key] = that[key];
        return result;
    }, {});
}
