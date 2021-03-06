/**
 * Created by imsamurai on 25.01.2016.
 */
function XpathExtractor(xPathRefine) {
    var self = this;
    var parser = new XPathParser();
    xPathRefine.setItemsMode(1);
    xPathRefine.setDebugMode(0);

    /**
     * Returns xpath of dOMNode
     *
     * @param dOMNode
     * @param type
     * @returns string
     */
    this.getXpath = function (dOMNode, type) {
        var tr = new xPathRefine.Rect(0, 0, 0, 0);
        var irs = xPathRefine.findIntersection(tr, tr);
        var tagItem = new xPathRefine.TagItem(dOMNode, irs, tr, tr);
        //var refineTagsItems = xPathRefine.refineTagsItems([tagItem], type);
        //return refineTagsItems[0].xpath;
        return tagItem.xpath;
    };

    /**
     * Returns xpath of dOMNode without node number identified as bottom node of rootDOMNode
     *
     * @param dOMNode
     * @param type
     * @returns string
     */
    this.getMultiXpath = function (rootDOMNode, dOMNode, type) {
        var rootXpath = this.getXpath(rootDOMNode, 'text');
        var nodeXpath = this.getXpath(dOMNode, type);
        var rootXpathMulti = rootXpath.replace(/([^\\]*)\[\d+\]([^\\]*)$/, '\$1\$2');
        return nodeXpath.replace(rootXpath, rootXpathMulti);
    };

    /**
     * Returns xpath object
     *
     * @param dOMNode
     * @returns XPathNode
     */
    this.getXpathObject = function(dOMNode) {
        return parser.parse(self.getXpath(dOMNode));
    }

    /**
     * Returns reduced amount of simplified xpath's that must cover all of dOMNodes
     *
     * @param dOMNodes
     * @param type
     * @returns string[]
     */
    this.getMultiItemXpath = function (dOMNodes, type) {
        return reduceXPaths(dOMNodes.map(function (dOMNode) {
            //console.log(self.getXpath(dOMNode, type));
            //console.log(parser.parse(self.getXpath(dOMNode, type)).toString());
            return parser.parse(self.getXpath(dOMNode, type));
        }), []).map(function (path) {
            simplifyXpathNocheck(path);
            return path.toString();
        });
    };

    /**
     * Merge xpaths based on structure equality
     *
     * @param inPaths
     * @param outPats
     * @returns XPathNode[]
     */
    function reduceXPaths(inPaths, outPats) {
        if (inPaths.length < 2) {
            return outPats.concat(inPaths);
        }

        var path1 = inPaths.shift();
        for (var c2 = 0; c2 < inPaths.length; c2++) {
            if (path1.equalsByStructure(inPaths[c2])) {
                var path = path1.merge(inPaths[c2]);
                return reduceXPaths([path].concat(inPaths.slice(0, c2))
                    .concat(inPaths.slice(c2 + 1)), outPats);
            }
        }

        return reduceXPaths(inPaths, outPats.concat([path1]));
    }

    /**
     * Try to simplify xpath
     *
     * @param path
     * @returns XPathNode
     */
    function simplifyXpath(path) {
        var path1 = path.clone();
        var pathCur1 = path1;
        var path2 = path.clone();
        var pathCur2 = path2;
        while (true) {
            var pathStr = pathCur1.toString();
            var elems1 = xPathRefine.xpathEvaluate(path1.toString(), 1);

            if (!pathStr || elems1.length === 0) {
                return path1;
            }

            //if (pathCur2.name) {
            //    pathCur2.skip = true;
            //    var elems2 = xPathRefine.xpathEvaluate(path2.toString(), 1);
            //    if (isSameElems(elems1, elems2)) {
            //        pathCur1.skip = true;
            //    } else {
            //        pathCur2.skip = false;
            //    }
            //}

            if (!pathCur2.skip) {
                pathCur2.skip = false;
                pathCur2.removeAttributes();
                var elems3 = xPathRefine.xpathEvaluate(path2.toString(), 1);
                if (isSameElems(elems1, elems3)) {
                    pathCur1.removeAttributes();
                }
            }

            pathCur1 = pathCur1.children;
            pathCur2 = pathCur2.children;
        }
    }

    /**
     * Try to simplify xpath without check elements
     *
     * @param path
     * @returns XPathNode
     */
    function simplifyXpathNocheck(path) {
        if (path.children instanceof XPathEmptyNode) {
            path.attributes = path.attributes.filter(function(attr) {
              return attr.name === "NUMBER";
            });
        } else {
            simplifyXpathNocheck(path.removeAttributes().children);
        }
    }


    function isSameElems(elems1, elems2) {
        if (elems1.length !== elems2.length) {
            return false;
        }
        return elems1.filter(function (elem) {
                return elems2.indexOf(elem) !== -1;
            }).length === elems1.length;
    }
}

