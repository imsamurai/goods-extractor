/**
 * Created by imsamurai on 15.02.2016.
 */
function Extractor(recordsExtractor, fieldsExtractor, fieldsTagger) {
    this.run = function(tree) {
        return recordsExtractor.run(tree).map(fieldsExtractor.run).map(fieldsTagger.run);
    }
}

exports.Extractor = Extractor;