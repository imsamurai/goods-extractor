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
        if (single)  {
            var v = value.filter(function(t) {
                return t !== "";
            });

            if (v.length===1) {
                value = v[0];
            } else if (v.length===0) {
                value = "";
            } else {
                value = v;
            }
        }
        return {value: value, single: single};
    }

    function extract(tree) {
        if (tree.node.name === 'IMG') {
            return {value: tree.node.src ? tree.node.src : findLink(tree.node), single: true};
        } else if (tree.node.name === 'A') {
            return {value: [tree.node.href ? tree.node.href : findLink(tree.node), tree.node.texts()], single: false};
        } else {
            return {value: tree.node.texts().join(' '), single: true};
        }
    }

    function findLink(node) {
        var possibleLinks = Object.values(node.attributes).filter(function(val) {
            return val.match(/^(?:https?:|)\/\/\S+$/)
        });
        return possibleLinks.length > 0 ? possibleLinks[0] : "";
    }
}