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

//Object.prototype.equals = function (iObj) {
//    if (this.constructor !== iObj.constructor)
//        return false;
//    var aMemberCount = 0;
//    for (var a in this) {
//        if (!this.hasOwnProperty(a))
//            continue;
//        if (typeof this[a] === 'object' && typeof iObj[a] === 'object' ? !this[a].equals(iObj[a]) : this[a] !== iObj[a])
//            return false;
//        ++aMemberCount;
//    }
//    for (var a in iObj)
//        if (iObj.hasOwnProperty(a))
//            --aMemberCount;
//    return aMemberCount ? false : true;
//}

Object.sortByKeys = function (obj) {
    var that = obj;
    return Object.keys(obj).sort().reduce(function (result, key) {
        result[key] = that[key];
        return result;
    }, {});
}

function UID() {
    var counter = 0;
    return function() {
        return counter++;
    }
}

var TreeNodeID = UID();