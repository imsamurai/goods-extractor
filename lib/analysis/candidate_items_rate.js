/**
 * Created by imsamurai on 13.01.2016.
 */
function CandidateItemsRate() {
    this.run = function (items) {
        var similarity = items.reduce(function (acc, item) {
                return acc + item.similarity;
            }, 0) / items.length;
        var complexity = items.reduce(function (acc, item) {
                return acc + item.complexity;
            }, 0) / items.length;

        return {
            score: Math.pow(items.length, 3) * similarity * complexity,
            similarity: similarity,
            complexity: complexity
        };
    }
}