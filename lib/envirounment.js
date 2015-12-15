/**
 * Created by imsamurai on 15.12.2015.
 */

function Envirounment(storage) {
    storage = storage ? storage : {};

    this.set = function (name, val) {
        storage[name] = val;
    };

    this.get = function (name) {
        return storage[name];
    };

    this.clone = function () {
        return new Envirounment(JSON.parse(JSON.stringify(storage)));
    };

    this.getStorage = function() {
        return storage;
    };

    this.setStorage = function(value) {
        storage = value;
    };

    this.modify = function(env) {
        this.setStorage(env.getStorage());
    };
}