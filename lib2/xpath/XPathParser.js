/**
 * Created by imsamurai on 25.02.2016.
 */
function XPathParser() {
    this.parse = function(xpath) {
        return xpath.split('/').slice(1).reverse().reduce(function(children, pathPart) {
            var nameMatch = pathPart.match(/^[^\[]+/);
            var name = nameMatch ? nameMatch[0] : null;
            var numberAttrMatch = pathPart.match(/\[\d+\]/);
            var numberAttr = numberAttrMatch ? numberAttrMatch.map(removeParentises) : [];

            var notNumberAttrMatch = pathPart.match(/\[@.*\]/g);
            var notNumberAttr = notNumberAttrMatch ? notNumberAttrMatch.map(removeParentises) : [];
            var attributes = numberAttr.map(function(attr) {
                return new XPathAttr('NUMBER', attr);
            }).concat(
                notNumberAttr.map(function(attr) {
                    var data = attr.match(/^(@\w+).*$/);
                    return new XPathAttr(data[1], data[0]);
                })
            );
            return new XPathNode(name, attributes, children);
        }, new XPathEmptyNode());
    }

    function removeParentises(attr) {
        return attr.substr(1, attr.length -2);
    }
}