/**
 * Created by imsamurai on 13.01.2016.
 */
function FieldValueExtractor() {
    this.run = function(trees) {
        if (!trees) {
            return '';
        }
        var value = [];
        var single = true;
        for (var pos = 0; pos < trees.length; pos++) {
            var v = extract(trees[pos]);
            single = single && v.single;
            value.push(v.value);
        }
        if (single && value.length === 1)  {
            value = value[0];
        }
        return {value: value, single: single};
    }

    function extract(tree) {
        if (tree.node.name === 'IMG') {
            return {value: tree.node.src, single: true};
        } else if (tree.node.name === 'A') {
            return {value: [tree.node.href, tree.node.texts()], single: false};
        } else {
            return {value: tree.node.texts().join(' '), single: true};
        }
    }
}