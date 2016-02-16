/**
 * Created by imsamurai on 15.02.2016.
 */
function FieldCollection(fields, records) {
    var tags = {};
    this.setTag = function(tag) {
        tags[tag.name] = tag;
    }
    this.getTag = function(name) {
        tags[tag.name] = tag;
    }
}

exports.FieldCollection = FieldCollection;