/**
 * Created by imsamurai on 25.01.2016.
 */
 function XPathExtractor(window) {
    var XPathRefine = window.XPathRefine;
    var typesMap = {
        'title': 'text',
        'text': 'text',
        'price': 'text',
        'link': 'link',
        'image': 'image'
    };
    XPathRefine.setItemsMode(1);
    XPathRefine.setDebugMode(0);

    this.getXpath = function(field) {
        var tagType = typesMap[field.type] ? typesMap[field.type] : 'text';
        var tr = new XPathRefine.Rect(0, 0, 0, 0);
        var irs = XPathRefine.findIntersection(tr, tr);
        var tagItem = new XPathRefine.TagItem(field.getSeed().node.DOMNode, irs, tr, tr);
        var refineTagsItems = XPathRefine.refineTagsItems([tagItem], tagType);
        return refineTagsItems[0].xpath;
    };
}