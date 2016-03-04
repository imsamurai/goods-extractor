/**
 * Created by imsamurai on 13.01.2016.
 */
function FieldValueExtractor() {

    var formattingTags = /^(?:SPAN|B|STRONG|I|H\d+|FONT)$/;

    this.detectExtractors = function(tree) {
        if (tree.node.name === 'IMG') {
            return findLinks(tree.node).map(function(link) {
                return ['image_'+link.attr, getAttributeExtractor(link.attr)]
            });
        } else if (tree.node.name === 'A') {
            return findLinks(tree.node, ['href']).map(function(link) {
                return ['link_'+link.attr, getAttributeExtractor(link.attr)]
            }).concat([['link_href', getAttributeExtractor('href')]]).concat([['linkText', extractText]]).concat([['linkTextInner', extractInnerText]]);
        } else if (tree.node.name.match(formattingTags)) {
            return [['text', extractText], ['textInner', extractInnerText]];
        } else {
            return [['text', extractText]];
        }
    };

    function getAttributeExtractor(attr) {
        return function(tree) {
            return tree.node.attributes[attr] ? tree.node.attributes[attr] : "";
        }
    }

    function extractText(tree) {
        return tree.node.texts().join(' ').trim();
    }

    function extractInnerText(tree) {
        return tree.node.text;
    }

    function findLinks(node, excludeAttributes) {
        var attrs = Object.keys(node.attributes).filter(function(attr) {
            return !excludeAttributes || excludeAttributes.indexOf(attr) === -1;
        });
        var possibleLinks = attrs.map(function(attr) {
            return {attr: attr, val: node.attributes[attr]};
        }).filter(function(link) {
            return link.val.match(/^(?:https?:|)\/?\/\S+$/)
        });
        return possibleLinks;
    }
}

