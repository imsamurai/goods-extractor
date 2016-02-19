/**
 * Created by imsamurai on 12.01.2016.
 */
/**
 *
 * DOM tree node representation
 *
 * @constructor
 */
function TreeNode(DOMNode, builder) {
    this.name = DOMNode.nodeName;
    this.src = DOMNode.src;
    this.href = DOMNode.href;
    this.text = DOMNode.innerHTML.replace(/<\/?[^>]+>/gi, '').trim();
    this.id = builder.generateNodeID();
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
    this.class = this.attributes.class ? this.attributes.class : "";
    this.clone = function() {
        return new TreeNode(DOMNode, builder);
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

