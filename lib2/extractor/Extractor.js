/**
 * Created by imsamurai on 15.02.2016.
 */
function Extractor(recordsExtractor, fieldsExtractor, fieldsTagger) {
    this.run = function (tree) {
        return recordsExtractor.run(tree).map(fieldsExtractor.run).filter(function (fieldCollection) {
            return fieldCollection.rate > 0;
        }).sort(function (fieldCollection1, fieldCollection2) {
            if (fieldCollection1.rate > fieldCollection2.rate) {
                return -1;
            } else if (fieldCollection1.rate < fieldCollection2.rate) {
                return 1;
            }
            return 0;
        });

    }
}

