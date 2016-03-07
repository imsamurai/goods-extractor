/**
 * Created by imsamurai on 07.03.2016.
 */
function Cache() {
    var data = {};

    this.get = function(key) {
        return data[key];
    };

    this.set = function(key, val) {
        return data[key] = val;
    };
}