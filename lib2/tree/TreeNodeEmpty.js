/**
 * Created by imsamurai on 12.01.2016.
 */
/**
 *
 * DOM tree node representation
 *
 * @constructor
 */
function TreeNodeEmpty() {
    this.name = "EMPTYNODE";
    this.attributes = [];
    this.class = "";
    this.id = -1;
    this.src = '';
    this.href = '';
    this.text = '';
    this.DOMNode = null;
    this.texts = function() { return ""; };

    this.clone = function() {
        return new TreeNodeEmpty();
    };

}

exports = TreeNodeEmpty;