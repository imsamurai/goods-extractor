/**
 * Created by imsamurai on 25.01.2016.
 */
 function XpathExtractor(xPathRefine) {
    //var typesMap = {
    //    'title': 'text',
    //    'text': 'text',
    //    'price': 'text',
    //    'link': 'link',
    //    'image': 'image'
    //};
    xPathRefine.setItemsMode(1);
    xPathRefine.setDebugMode(0);

    this.getXpath = function(dOMNode, type) {
        //var tagType = typesMap[type] ? typesMap[type] : 'text';
        var tr = new xPathRefine.Rect(0, 0, 0, 0);
        var irs = xPathRefine.findIntersection(tr, tr);
        var tagItem = new xPathRefine.TagItem(dOMNode, irs, tr, tr);
        //var refineTagsItems = xPathRefine.refineTagsItems([tagItem], tagType);
        //return refineTagsItems[0].xpath;
        return tagItem.xpath;
    };
}

exports = XPathExtractor;