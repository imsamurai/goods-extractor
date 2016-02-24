/**
 * Created by imsamurai on 12.01.2016.
 */
/**
 *
 * Tree builder
 *
 * @constructor
 */
function TreeBuilder(DOMRootNode, alignComparator, findLikeComparator) {
    var self = this;
    this.alignComparator = alignComparator;
    this.findLikeComparator = findLikeComparator;

    function _build(DOMNode) {
        var children = [];
        if (!isValidDOMNode(DOMNode)) {
            return null;
        }
        for (var n=0;n<DOMNode.children.length;n++) {
            children.push(_build(DOMNode.children[n]));
        }
        return new Tree(new TreeNode(DOMNode, self), children.filter(function(c) { return c!==null;}), self);
    }

    function isValidDOMNode(DOMNode) {
        return !DOMNode.tagName.match(/^(?:script|noscript)$/i);
    }

    this.build = function() {

        return _build(DOMRootNode);
    };

    this.generateNodeID = (function() {
            var counter = 0;
            return function() {
                return counter++;
            }
        })();

}

