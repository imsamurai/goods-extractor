/**
 * Created by imsamurai on 25.02.2016.
 */
function XPathNode(name, attributes, children) {
    this.name = name;
    this.attributes = attributes;
    this.children = children;
    this.skip = false;

    this.clone = function () {
        return new XPathNode(this.name, this.attributes.map(function(attr) {
            return attr.clone();
        }), this.children.clone());
    };

    this.removeAttributes = function () {
        this.attributes = [];
        return this;
    };

    this.equalsByStructure = function(node) {
        if (this.name == node.name) {
            return this.children.equalsByStructure(node.children);
        } else {
            return false;
        }
    };

    this.toString = function() {
        return this.skip ? this.children.toString() : '/'+(this.name ? this.name : '')+this.attributes.map(function(attr) {
                return '['+attr.toString()+']';
            }).join('')+this.children.toString();
    };

    this.merge = function(node) {
        var name = this.name;
        var attributes = this.attributes.map(function(attr) {
            return attr.merge(
                node.attributes.filter(function(nodeAttr) {
                    return nodeAttr.equals(attr);
                })[0]
            )
        }).filter(function(attr) {
            return attr!==null;
        });

        return new XPathNode(name, attributes, this.children.merge(node.children));
    }
}