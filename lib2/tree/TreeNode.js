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
    this.text = getInnerText(DOMNode);
    this.outerHTML = DOMNode.outerHTML;
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

    this.attributes = getAttributes(DOMNode);
    this.class = this.attributes.class ? this.attributes.class : "";
    this.clone = function() {
        return new TreeNode(DOMNode, builder);
    }
}

