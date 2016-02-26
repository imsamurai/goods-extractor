/**
 * Created by imsamurai on 25.02.2016.
 */
function XPathEmptyNode() {
    this.name = 'EMPTYNODE';

    this.equalsByStructure = function(node) {
        return node instanceof XPathEmptyNode;
    };

    this.toString = function() {
        return '';
    }

    this.merge = function() {
        return new XPathEmptyNode();
    }

    this.clone = function () {
        return new XPathEmptyNode();
    };

    this.removeAttributes = function() {
        return this;
    };
}