/**
 * Created by imsamurai on 30.11.2015.
 */
exports.save = function(request, response) {
    var database = require('../db/db');
    //database.run(function(db){
    //    db.collection('data').insertOne( {
    //        "url": request.param('url'),
    //        "options": request.param('options')
    //    } );
    //});
    database.run(function(db){
        var cursor = db.collection('data').find();
        cursor.each(function(err, doc) {
            console.dir(doc);
        });
    });
    //response.send(request.param('options'));
}