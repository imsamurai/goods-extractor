/**
 * Created by imsamurai on 13.01.2016.
 */
function FieldValueExtractor() {

    this.detectExtractors = function(tree) {
        if (tree.node.name === 'IMG') {
            return [['image', extractImage]];
        } else if (tree.node.name === 'A') {
            return [['link', extractLink], ['linkText', extractLinkText]];
        } else {
            return [['text', extractText]];
        }
    };

    function extractText(tree) {
        return tree.node.texts().join(' ').trim();
    }

    function extractLink(tree) {
        return tree.node.href ? tree.node.href : findLink(tree.node);
    }

    function extractLinkText(tree) {
        var childText = tree.node.texts().join(' ').trim();
        return childText ? childText : tree.node.text;
    }

    function extractImage(tree) {
        return tree.node.src ? tree.node.src : findLink(tree.node);
    }

    function findLink(node) {
        var possibleLinks = Object.values(node.attributes).filter(function(val) {
            return val.match(/^(?:https?:|)\/\/\S+$/)
        });
        return possibleLinks.length > 0 ? possibleLinks[0] : "";
    }
}

exports = FieldValueExtractor;