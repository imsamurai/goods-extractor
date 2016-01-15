/**
 * Created by imsamurai on 30.11.2015.
 */
exports.run = function (callback) {
    var MongoClient = require('mongodb').MongoClient;
    var assert = require('assert');
    var url = 'mongodb://localhost:27017/structure-comparator';
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server.");
        callback(db);
        db.close();
    });
}
