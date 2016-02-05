/**
 * Created by imsamurai on 14.01.2016.
 */
function FieldBuilder(fieldValueExtractor, fieldTagger) {
    //var fieldValueExtractor = new FieldValueExtractor();
    //var fieldTagger = new FieldsTaggerProduct();
    this.getTagger = function () {
        return fieldTagger;
    };
    this.build = function (seed, fieldNum, treeItems, tree) {
        var value = fieldValueExtractor.run(treeItems);
        var result = [];
        if (value.single) {
            var field = new Field('field#' + fieldNum, value.value, seed, treeItems);
            //field.metadata = {seed:seed, fieldNum:fieldNum, treeItems:treeItems, tree:tree};

            result = [fieldTagger.run(field, seed, fieldNum, treeItems, tree)];

        } else {

            var num = 0;
            for (var pos = 0; pos < value.value.length; pos++) {
                if (value.value[pos] instanceof Array) {


                for (var posVal = 0; posVal < value.value[pos].length; posVal++) {
                    var field = new Field('field#' + fieldNum + '_' + num, [value.value[pos][posVal]].join(''), seed, treeItems);
                    //field.metadata = {seed:seed, fieldNum:fieldNum, treeItems:treeItems, tree:tree};
                    result.push(fieldTagger.run(field, seed, fieldNum + '_' + num, treeItems, tree));
                    num++;
                }
            } else {
                    var field = new Field('field#' + fieldNum + '_' + num, value.value[pos], seed, treeItems);
                    result.push(fieldTagger.run(field, seed, fieldNum + '_' + num, treeItems, tree));
                    num++;
                }
            }

        }
        return result
            .filter(function(field) {
            return [field.value].join('').trim() !== "";
        });
    }
}