/**
 * Created by imsamurai on 12.01.2016.
 */
/**
 *
 * DOM tree node representation
 *
 * @constructor
 */
function TreeNode(DOMNode) {
    this.name = DOMNode.nodeName;
    this.src = DOMNode.src;
    this.href = DOMNode.href;
    this.text = DOMNode.innerText;
    this.id = TreeNodeID();
    this.DOMNode = DOMNode;
    this.texts = function() {
        var text = [];
        var cn = DOMNode.childNodes;
        for (var i = 0; i < cn.length; i++) {
            if (cn[i].nodeName === '#text') {
                text.push(cn[i].nodeValue.trim());
            }
        }
        return text.filter(function(t) {
            return t !== "";
        });
    }

    this.attributes = _getAttributes();
    this.class = this.attributes.class + "";
    this.clone = function() {
        return new TreeNode(DOMNode);
    }
    this.serialize = function() {
        return {name: this.name, src: this.src, href: this.href, text: this.text, texts: this.texts(), attributes: this.attributes, class: this.class};
    }

    function _getAttributes() {
        var atts = DOMNode.attributes;
        var attr = {};
        for (var i = 0; i < atts.length; i++) {
            attr[atts[i].name] = atts[i].value;
        }
        return Object.sortByKeys(attr);
    }
}