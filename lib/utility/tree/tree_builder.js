/**
 * Created by imsamurai on 12.01.2016.
 */
/**
 *
 * Tree builder
 *
 * @constructor
 */
function TreeBuilder(DOMRootNode) {

    var _build = function(DOMNode) {
        var children = [];
        for (var n=0;n<DOMNode.children.length;n++) {
            children.push(_build(DOMNode.children[n]));
        }
        return new Tree(new TreeNode(DOMNode), children);
    };


    this.build = function() {
        return _build(DOMRootNode);
    }


}