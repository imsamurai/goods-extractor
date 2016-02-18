/**
 * The xpath refine module.
 *
 * Helps to get pretty xpathes as a result of collecting of xpathes from visible
 * tags of some DOM in some HTML page. Designed as a part of the HCE project
 * web tools.
 * Requires the JQuery minimal.
 *
 * @author Gennady Baranov bgv <bgv.hce@gmail.com>
 * @link http://hierarchical-cluster-engine.com/
 * @copyright Copyright &copy; 2015, Gennady Baranov
 * @license http://hierarchical-cluster-engine.com/license/
 * @package HCE project web tools.
 * @version 0.2.2
 * @since 0.1
 */
var XPathRefine = (function() {
    var ITEMS_ARRAY_COMPARE_METHOD_INNER_TEXT = 0;
    var ITEMS_ARRAY_COMPARE_METHOD_INNER_HTML = 1;
    var ITEMS_ARRAY_COMPARE_METHOD_IMG_TAG = 2;
    var MODE_BEST_ITEM = 0;
    var MODE_MULTI_ITEM = 1;
    var MODE_SINGLE_ITEM = 2;
    var DEBUG_MODE_OFF = 0;
    var DEBUG_MODE_ON = 1;
    var TOOLTIPSTER_CLASS_NAME_DEFAULT = "tooltipstered";

    //Tags will be included in to the path even if they are not visible
    this.tagsAllowedIfInvisible = ["a", "span", "strong", "pre", "b", "i", "font"];
    //If value of max suffix is 0 - no one digital characters in suffix allowed, if -1 - any allowed
    this.maxDigitSuffixId = 3;
    this.maxDigitSuffixClass = 3;
    this._document = document;
    this._window = window;
    this._jQuery = jQuery;
    this._itemsMode = this.MODE_BEST_ITEM;
    this._debugMode = this.DEBUG_MODE_OFF;
    //The re strings array that will be used while xpath class attribute evaluation to replace with empty string 
    this._classesToRemove = [this.TOOLTIPSTER_CLASS_NAME_DEFAULT];

    function isVisible(ele) {
        return ele.clientWidth !== 0 &&
            ele.clientHeight !== 0 &&
            ele.style.opacity !== 0 &&
            ele.style.visibility !== 'hidden';
    }

    function replaceXPathImportantChars(src, direction) {
        var ret = "";
        
        if (direction > 0) {
            ret = src.replace(/6666cd76f96956469e7be39d750cc7d9/g, "/");
        } else {
            ret = src.replace(/\//g, "6666cd76f96956469e7be39d750cc7d9");
        }

        return ret;
    }

    /**
     * Grab and collect the intersected areas of selected rectangle canvas and visible DOM nodes.
     *
     *
     * @param {object} sr - selecton rect object
     * @param {string} selCanvasId - the id of node that used as visual selection
     * to skip it
     * @return {array} an array of XPathRefine.TagItem instances of intersected
     * nodes of DOM
     */
    function grabIntersected(sr, selCanvasId) {
        var grabbed = [];
        var d = getDocument();
        var nodes = _jQuery(d).find('*');
        for (var i = 0; i < nodes.length; i++) {
            var nodeName = nodes[i].nodeName.toLowerCase();
            if (!isVisible(nodes[i]) && (tagsAllowedIfInvisible.indexOf(nodeName) == -1))
                continue;
            try {
                var o = _jQuery(nodes[i]).offset(),
                    tx1 = o.left,
                    ty1 = o.top,
                    tx2 = tx1 + _jQuery(nodes[i]).width(),
                    ty2 = ty1 + _jQuery(nodes[i]).height();
            } catch(e){
                console.log("Tag " + nodeName + " offset() call error : " + e);
                continue;
            }

            if (tx1 != null && ty1 != null && tx2 != null && ty2 != null) {
                var tr = new XPathRefine.Rect(tx1, ty1, tx2, ty2);
                var irs = findIntersection(tr, sr);

                if (/*irs.casesMask > 0*/ (irs != null) && _jQuery(nodes[i]).prop("id") != selCanvasId) {
                    var ti = new XPathRefine.TagItem(nodes[i], irs, tr, sr);
                    grabbed.push(ti);
                }
            }
        }

        return grabbed;
    }

    /**
     * Get xpath string from DOM node element
     *
     *
     * @param {object} element - DOM node element
     * @return {string} the full long xpath string of DOM node element
     */
    function getXPath(element) {
        try {
            var path = _jQuery(element).parents().addBack();
        } catch(e) {
            //TODO: for the simple test only if the jQuery possible < v1.8
            var path = _jQuery(element).parents().andSelf();
        }
        var xpath = "/";

        for (var i = 0; i < path.length; i++) {
            var nd = path[i].nodeName.toLowerCase();
            xpath += "/";
            if (nd != "html" && nd != "body") {
                xpath += nd;
                if (path[i].id != "" && !isDigitSuffixTooLong(path[i].id, maxDigitSuffixId, 1)) {
                    xpath += "[@id='" + replaceXPathImportantChars(path[i].id, 0) + "']";
                } else {
                    xpath += "[" + (_jQuery(path[i - 1]).children(nd).index(path[i]) + 1) + "]";
                    if (path[i].className != "") {
                        var c = path[i].className;
                        for (var j = 0; j < _classesToRemove.length; j++) {
                            if ( c.indexOf(_classesToRemove[j]) != -1) {
                                c = c.replace(RegExp(_classesToRemove[j], "gi"), "").trim();
                            }
                        }
                        if (c != "" && !isDigitSuffixTooLong(c, maxDigitSuffixClass, 1)) {
                            xpath += "[@class='" + replaceXPathImportantChars(c, 0) + "']";
                        }
                    }
                }
            } else {
                xpath += nd;
            }
        }

        return xpath;
    }

    /**
     * Find intersection of two rectangular areas
     *
     * Detects types of intersection and fills mask and string of names
     *
     * @param {object} tr - the rect of DOM node HTML tag
     * @param {object} sr - the rect of visual selection
     * @return {object} the instance of XPathRefine.Intersection
     */
    function findIntersection(tr, sr) {
        var tx1 = tr.x1,
            ty1 = tr.y1,
            tx2 = tr.x2,
            ty2 = tr.y2,
            sx1 = sr.x1,
            sy1 = sr.y1,
            sx2 = sr.x2,
            sy2 = sr.y2;
        var cases = "",
            casesMask = 0;

        if ((tx1 >= sx1 && tx2 <= sx2 && ty1 >= sy1 && ty2 <= sy2)) {
            casesMask |= 1;
            cases += "in,";
        }
        if ((tx1 <= sx1 && tx2 >= sx2 && ty1 <= sy1 && ty2 >= sy2)) {
            casesMask |= 2;
            cases += "out,";
        }
        if ((tx1 >= sx1 && tx1 <= sx2 && ty1 >= sy1 && ty1 <= sy2) && (casesMask & 1) == 0) {
            casesMask |= 4;
            cases += "topleft,";
        }
        if ((tx2 >= sx1 && tx2 <= sx2 && ty2 >= sy1 && ty2 <= sy2) && (casesMask & 1) == 0) {
            casesMask |= 8;
            cases += "bottomright,";
        }
        if ((tx2 >= sx1 && tx2 <= sx2 && ty1 >= sy1 && ty1 <= sy2) && (casesMask & 1) == 0) {
            casesMask |= 16;
            cases += "topright,";
        }
        if ((tx1 >= sx1 && tx1 <= sx2 && ty2 >= sy1 && ty2 <= sy2) && (casesMask & 1) == 0) {
            casesMask |= 32;
            cases += "bottomleft,";
        }
        if ((ty1 >= sy1 && ty1 <= sy2) && (sx1 >= tx1 && sx1 <= tx2) && (sx2 >= tx1 && sx2 <= tx2) && (casesMask & 1) == 0) {
            casesMask |= 64;
            cases += "topv,";
        }
        if ((ty2 >= sy1 && ty2 <= sy2) && (sx1 >= tx1 && sx1 <= tx2) && (sx2 >= tx1 && sx2 <= tx2) && (casesMask & 1) == 0) {
            casesMask |= 128;
            cases += "bottomv,";
        }
        if ((tx1 >= sx1 && tx1 <= sx2) && (sy1 >= ty1 && sy1 <= ty2) && (sy2 >= ty1 && sy2 <= ty2) && (casesMask & 1) == 0) {
            casesMask |= 256;
            cases += "lefth,";
        }
        if ((tx2 >= sx1 && tx2 <= sx2) && (sy1 >= ty1 && sy1 <= ty2) && (sy2 >= ty1 && sy2 <= ty2) && (casesMask & 1) == 0) {
            casesMask |= 512;
            cases += "righth,";
        }

        if (casesMask > 0) {
            var xpi = new XPathRefine.Intersection(casesMask, cases);
        } else {
            var xpi = null;
        }

        return xpi;
    }

    /**
     * Evaluate the xpath with current document DOM
     *
     *
     * @param {string} xpath - the xpath to evaluate
     * @param {numeric} type - the type of return data, positive mans array of
     * DOM nodes
     * @return {array} an array of DOM nodes returned after evaluation of xpath
     * with this document DOM
     */
    function xpathEvaluate(xpath, type) {
        var ret = [];

        try {
            var w = getWindow();
            var d = getDocument();
            
            if ((typeof d.evaluate != 'function') && (typeof wgxpath == 'object')) {
                wgxpath.install(w);
                if (isDebugMode())
                    console.log('xpathEvaluate: install evaluate method to window');
            }
            
            var itemsByXpath = d.evaluate(xpath, d, null, XPathResult.ANY_TYPE, null);
            if (type > 0) {
                var itemTag = itemsByXpath.iterateNext(),
                    tagsArray = [];
                while (itemTag) {
                    tagsArray.push(itemTag);
                    itemTag = itemsByXpath.iterateNext();
                }
                ret = tagsArray;
            }
        } catch(e) {
            ret = [];
        }

        return ret;
    }

    /**
     * Filter array of tagItem object
     *
     * Filtration with set of rules to leave only high-quality DOM nodes
     * This is one and first of most important procedure of refining
     *
     * @param {array} itemsArr - an array of taggItem objects grabbed
     * @param {numeric} tagType - the type of DOM node ("html", "text", "image", "link",
     * "datetime", etc), to precise filtration process
     * @return {array} array of taggItem objects filtered
     */
    function filterTagsItems(itemsArr, tagType) {
        var ret = [];

        //Save only nodes that has max Y value of the left top corner of the node area, because it can be not in order of DOM tree
        //Also not empty innerHTML and are not HTML tags: META, SCRIPT, LINK, A, IMG
        var items = [];
        var emptyContentAllowedTags = ["meta", "script", "link", "a", "img", "time"]
        var minAreaY = (itemsArr[itemsArr.length-1].selRect.y1-itemsArr[itemsArr.length-1].tagRect.y1) + (itemsArr[itemsArr.length-1].tagRect.y2-itemsArr[itemsArr.length-1].selRect.y2);
        var minAreaYXPath = itemsArr[itemsArr.length-1].xpath;

        for (var i = 0; i < itemsArr.length; i++) {
            //Check does the tag not in set of allowed empty content and content is not empty
            if ((_jQuery.inArray(itemsArr[i].tagObject.nodeName.toLowerCase(), emptyContentAllowedTags) == -1) && (itemsArr[i].tagObject.innerHTML.trim() == "")){
                continue;
            }
            //console.log("cMask:"+itemsArr[i].intersection.casesMask);
            //If intersection type is "outer" and type is "text"
            if ((itemsArr[i].intersection.casesMask & 2) > 0 && tagType=="text") {
                //console.log("xp:" + itemsArr[i].xpath + ":" + minAreaY +":" + ((itemsArr[i].selRect.y1-itemsArr[i].tagRect.y1) + (itemsArr[i].tagRect.y2-itemsArr[i].selRect.y2)));
                //If more close node found or node is child for last closed
                if ((minAreaY >= ((itemsArr[i].selRect.y1-itemsArr[i].tagRect.y1) + (itemsArr[i].tagRect.y2-itemsArr[i].selRect.y2))) || (itemsArr[i].xpath.indexOf(minAreaYXPath) != -1)) {
                    minAreaY = (itemsArr[i].selRect.y1-itemsArr[i].tagRect.y1) + (itemsArr[i].tagRect.y2-itemsArr[i].selRect.y2);
                    items.push(itemsArr[i].getCopy());
                    minAreaYXPath = itemsArr[i].xpath;
                    //console.log(minAreaY);
                    //console.log("filter1-t item xp:" + itemsArr[i].xpath);
                }
            } else {
                //console.log("filter1-nt item xp:" + itemsArr[i].xpath);
                items.push(itemsArr[i].getCopy());
            }
        }

        if (!items.length) {
            return ret;
        }

        switch (tagType) {
            case "link":
                //If tag type is anchor (link) - seek from bottom, and find in sibling first "A" node
                for (var i = items.length - 1; i >= 0; i--) {
                    var childrensA = _jQuery(items[i].tagObject).find("a");
                    var newItem = null;
                    for (var j = 0; j < childrensA.length; j++) {
                        //Take only none empty link
                        if ((_jQuery(childrensA[j]).attr('href') !== undefined) && (_jQuery(childrensA[j]).attr('href') !== "")) {
                            if (newItem == null) {
                                //Create new tagItem and set all fields from parent visible but tagObjct for case of no intersected found
                                newItem = new XPathRefine.TagItem(childrensA[j], items[i].intersection, items[i].tagRect, items[i].selRect);
                            }
                            //Try to find first intersected
                            var o = _jQuery(childrensA[j]).offset(),
                                tx1 = o.left,
                                ty1 = o.top,
                                tx2 = tx1 + _jQuery(childrensA[j]).width(),
                                ty2 = ty1 + _jQuery(childrensA[j]).height();

                            if (tx2 != null && ty2 != null) {
                                var tr = new XPathRefine.Rect(tx1, ty1, tx2, ty2);
                                var irs = findIntersection(tr, items[i].selRect);
                                //if (irs.casesMask > 0) {
                                if (irs != null) {
                                    newItem = new XPathRefine.TagItem(childrensA[j], irs, tr, items[i].selRect);
                                    break;
                                }
                            }
                        }
                    }
                    if (newItem != null) {
                        //Push first good or intersected found
                        ret.push(newItem);
                        break;
                    }
                }
                break;
            case "datetime":
                //If tag type is datetime - seek from bottom, and find in child first "time" node with textual content that has "good" date-time string
                for (var i = items.length - 1; i >= 0; i--) {
                    var newItem = null;
                    //Try to get TIME tag from this node
                    var childrensA = _jQuery(items[i].tagObject).find("time");
                    if (isDebugMode())
                        console.log("l0:"+childrensA.length);
                    for (var j = 0; j < childrensA.length; j++) {
                        //Take first "good" node
                        if (isDateTimeEntrance(_jQuery(childrensA[j]).attr("datetime")) || (isDateTimeEntrance(childrensA[j].innerText) || isDateTimeEntrance(childrensA[j].innerHTML))) {
                            //Create new tagItem and set all fields from parent visible but tagObjct
                            newItem = new XPathRefine.TagItem(childrensA[j], items[i].intersection, items[i].tagRect, items[i].selRect);
                            break;
                        }

                    }
                    if (newItem != null) {
                        newItem.xpathSimple = "";
                        newItem.xpathExact = "";
                        ret.push(newItem);
                        break;
                    }
                }
                if (isDebugMode())
                    console.log("l1:"+ret.length);
                //If no good date tag found try worse way - just first TIME tag value on a page
                if (ret.length == 0) {
                    var childrensA = _jQuery("time");
                    for (var j = 0; j < childrensA.length; j++) {
                        if (_jQuery(childrensA[j]).attr("datetime")!="" || childrensA[j].innerText != "") {
                            //Create new tagItem and set all fields from bottom tagItem (fake)
                            var newItem = new XPathRefine.TagItem(childrensA[j], items[items.length - 1].intersection, items[items.length - 1].tagRect, items[items.length - 1].selRect);
                            newItem.xpathSimple = "";
                            newItem.xpathExact = "";
                            ret.push(newItem);
                            break;
                        }
                    }
                }
                if (isDebugMode())
                    console.log("l2:"+ret.length);
                //If still no date tag found try more worse way - to find tag META with "itemprop" attribute value with the "date" or "publish" keywords entrance
                if (ret.length == 0) {
                    var childrensA = _jQuery("meta[itemprop*='date'],meta[itemprop*='publish'],meta[itemprop*='Date'],meta[itemprop*='Publish']");
                    for (var j = 0; j < childrensA.length; j++) {
                        if (_jQuery(childrensA[j]).attr("content") != undefined && isDateTimeEntrance(_jQuery(childrensA[j]).attr("content"))) {
                            //Create new tagItem and set all fields from bottom tagItem (fake)
                            var newItem = new XPathRefine.TagItem(childrensA[j], items[items.length - 1].intersection, items[items.length - 1].tagRect, items[items.length - 1].selRect);
                            newItem.xpathSimple = "";
                            newItem.xpathExact = "";
                            newItem.xpath+="[@itemprop='" + _jQuery(childrensA[j]).attr("itemprop") + "']";
                            ret.push(newItem);
                            break;
                        }
                    }
                }
                //If still no date tag found try more worse way - to find tag META with "name" attribute value with the "date" or "publish" keywords entrance
                if (ret.length == 0) {
                    var childrensA = _jQuery("meta[name*='date'],meta[name*='publi']");
                    for (var j = 0; j < childrensA.length; j++) {
                        if (_jQuery(childrensA[j]).attr("content") != undefined && isDateTimeEntrance(_jQuery(childrensA[j]).attr("content"))) {
                            //Create new tagItem and set all fields from bottom tagItem (fake)
                            var newItem = new XPathRefine.TagItem(childrensA[j], items[items.length - 1].intersection, items[items.length - 1].tagRect, items[items.length - 1].selRect);
                            newItem.xpathSimple = "";
                            newItem.xpathExact = "";
                            newItem.xpath+="[@name='" + _jQuery(childrensA[j]).attr("name") + "']";
                            ret.push(newItem);
                            break;
                        }
                    }
                }
                //If still no date tag found try more worse way - to find tag META with "property" attribute value with the "article:published_time" keywords entrance
                if (ret.length == 0) {
                    var childrensA = _jQuery("meta[property*='article:published_time']");
                    for (var j = 0; j < childrensA.length; j++) {
                        if (_jQuery(childrensA[j]).attr("content") != undefined && isDateTimeEntrance(_jQuery(childrensA[j]).attr("content"))) {
                            //Create new tagItem and set all fields from bottom tagItem (fake)
                            var newItem = new XPathRefine.TagItem(childrensA[j], items[items.length - 1].intersection, items[items.length - 1].tagRect, items[items.length - 1].selRect);
                            newItem.xpathSimple = "";
                            newItem.xpathExact = "";
                            newItem.xpath+="[@property='" + _jQuery(childrensA[j]).attr("property") + "']";
                            ret.push(newItem);
                            break;
                        }
                    }
                }
                if (isDebugMode())
                    console.log("l3:"+ret.length);
                //If still no date tag found try bad way - seek from bottom, and find first node with textual content that has "good" date-time string
                if (ret.length == 0) {
                    for (var i = items.length - 1; i >= 0; i--) {
                        var newItem = null;
                        var childrensA = _jQuery(items[i].tagObject);
                        for (var j = 0; j < childrensA.length; j++) {
                            //Take first "good" node
                            if ((childrensA[j].nodeName.toLowerCase() != "script") && (isDateTimeEntrance(childrensA[j].innerText) || isDateTimeEntrance(childrensA[j].innerHTML))) {
                                newItem = new XPathRefine.TagItem(childrensA[j], items[i].intersection, items[i].tagRect, items[i].selRect);
                                break;
                            }
                        }
                        if (newItem != null) {
                            newItem.xpathSimple = "";
                            newItem.xpathExact = "";
                            ret.push(newItem);
                            break;
                        }
                    }
                }
                if (isDebugMode())
                    console.log("l4:"+ret.length);
                //If still no date tag found try worst way - to find any tag with "class" attribute value with the "date" or "publish" keywords entrance
                if (ret.length == 0) {
                    var childrensA = _jQuery("*[class*='date'],*[class*='Date'],*[class*='publi'],*[class*='Publi']");
                    for (var j = 0; j < childrensA.length; j++) {
                        if (isDateTimeEntrance(_jQuery(childrensA[j]).text()) || isDateTimeEntrance(_jQuery(childrensA[j]).html())) {
                            //Create new tagItem and set all fields from bottom tagItem (fake)
                            var newItem = new XPathRefine.TagItem(childrensA[j], items[items.length - 1].intersection, items[items.length - 1].tagRect, items[items.length - 1].selRect);
                            newItem.xpathSimple = "";
                            newItem.xpathExact = "";
                            ret.push(newItem);
                            break;
                        }
                    }
                }
                if (isDebugMode())
                    console.log("l5:"+ret.length);
                //If still no date tag found try very bad way - just use default filtration
                if (ret.length == 0) {
                    ret = filterTagsItemsDefault(items);
                }
                if (isDebugMode())
                    console.log("l6:"+ret.length);
                    
                break;
            case "image":
                //If tag type is img - seek from top and leave only the IMG tags items
                for (var i = 0; i < items.length; i++) {
                    if (items[i].tagObject.nodeName.toLowerCase() == "img") {
                        ret.push(items[i].getCopy());
                    }
                }
                break;
            default:
                ret = filterTagsItemsDefault(items);
        }

        return ret;
    }

    /**
     * Filter array of tagItem object by default tag type
     *
     * Filtration with set of rules to leave only high-quality DOM nodes
     * This is one and first of most important procedure of refining
     *
     * @param {array} items - an array of taggItem objects grabbed
     * @param {numeric} tagType - the type of DOM node ("html", "text", "image", "link",
     * "datetime", etc), to precise filtration process
     * @return {array} array of taggItem objects filtered
     */
    function filterTagsItemsDefault(items) {
        var ret = [];

        if (((items[items.length - 1].intersection.casesMask) & 2) > 0) {
            //Save only last tag if it is an outer
            ret.push(items[items.length - 1].getCopy());
        } else {
            //Remove all outers tags from bottom
            var i = 0;
            //Find first outer tag from bottom
            for (i = items.length - 1; i >= 0; i--) {
                if (((items[i].intersection.casesMask) & 2) == 0) {
                    continue;
                } else {
                    break;
                }
            }
            //Fill resulted list from next of found to bottom
            for (i = i + 1; i < items.length; i++) {
                ret.push(items[i].getCopy());
            }
            //Remove nested items
            var removed;
            do {
                removed = 0;
                for (i = ret.length - 1; i > 0; i--) {
                    if ((ret[i].xpath != ret[i - 1].xpath) && (ret[i].xpath.indexOf(ret[i - 1].xpath) > -1)) {
                        ret.splice(i, 1);
                        removed = 1;
                    }
                }
            } while (removed);
        }

        return ret;
    }

    /**
     * Refine array of tagItem object
     *
     * Refining with set of rules to make the xpath view more short
     * and unique from point of view of the DOM structure and possible
     * more stable extraction of data from pages with DOM structure variations
     *
     * This is one and second of most important procedure of refining
     *
     * @param {array} items - an array of taggItem objects grabbed
     * @return {array} array of taggItem objects refined
     */
    function refineTagsItems(items, tagType) {
        var domItemsArr = [],
            domItemsArr2 = [],
            xpathArr = [],
            f = 0,
            xp = "",
            xpPrev = "",
            pos = 0,
            pos1 = 0;

        for (var i = 0; i < items.length; i++) {
            //Removing the leading path compounds if possible to get the same results of the xpath evaluation
            if (isDebugMode())
                console.log("refine1b:" + items[i].xpath);
            xp = removeLeadingSlashesXPath(items[i].xpath);
            domItemsArr = xpathEvaluate(items[i].xpath, 1);
            xpPrev = "";
            do {
                f = 0;
                var idOrClassBefore = isXPathHasIdOrClass(xp);
                xpathArr = xp.split("/");
                if (xpathArr.length > 1) {
                    xpathArr.shift();
                }
                xp = xpathArr.join("/");
                domItemsArr2 = xpathEvaluate("//" + xp, 1);
                if (isDebugMode())
                    console.log("refine1b1-xp:" + xp + ", domItemsArr.length: " + domItemsArr.length + ", domItemsArr2.length:" + domItemsArr2.length);
                if (((domItemsArr.length == domItemsArr2.length) && (compareItemArrays(domItemsArr, domItemsArr2, ITEMS_ARRAY_COMPARE_METHOD_INNER_TEXT) == -1)) || (getItemsMode() == MODE_MULTI_ITEM) ) {
                    if (idOrClassBefore && !isXPathHasIdOrClass(xp)) {
                        break;
                    } else {
                        xpPrev = xp;
                        if (xpathArr.length > 1) {
                            f = 1;
                        }
                    }
                } else {
                    break;
                }
            } while (f);
            if (xpPrev != "") {
                items[i].xpath = "//" + xpPrev;
            }
            if (isDebugMode())
                console.log("refine1e:" + items[i].xpath);
            
            //Removing the trailing path compounds in case of no "id" and "class" attributes up to tag that has one of them and if tag is not in specialNodes and tagType is not "datetime"
            var idProp = _jQuery(items[i].tagObject).prop("id"),
                classProp = _jQuery(items[i].tagObject).prop("class");
            var specialNodes = ["img", "a", "h1", "h2", "h3", "h4", "h5", "h6"];
            if ((!idProp || idProp == "") && (!classProp || classProp == "") && (_jQuery.inArray(items[i].tagObject.nodeName.toLowerCase(), specialNodes)==-1) && (tagType != "datetime") &&
               (getItemsMode() != MODE_SINGLE_ITEM)) {
                if (isDebugMode())
                    console.log("refine2b:" + items[i].xpath);
                xpPrev = "";
                domItemsArr2 = [];
                xp = removeLeadingSlashesXPath(items[i].xpath);
                xpathArr = xp.split("/");
                for (var j = xpathArr.length - 1; j > 0; j--) {
                    if (xpathArr.length > 1) {
                        xpathArr.pop();
                    }
                    xp = "//" + xpathArr.join("/");
                    domItemsArr2 = xpathEvaluate(xp, 1);
                    //If las component has id or class attribute - compare the items number and content of innerText of reduced and original DOM path evaluated
                    if (((xpathArr[xpathArr.length - 1].indexOf("[@id=") !=-1 || xpathArr[xpathArr.length - 1].indexOf("[@class=") !=-1) && (domItemsArr.length == domItemsArr2.length)) &&
                        (compareItemArrays(domItemsArr, domItemsArr2, ITEMS_ARRAY_COMPARE_METHOD_INNER_TEXT) == -1)) {
                        xpPrev = xp;
                    } else {
                        break;
                    }
                }
                if (xpPrev != "") {
                    items[i].xpath = xp;
                }
                if (isDebugMode())
                    console.log("refine2e:" + items[i].xpath);
            }

            //Refining by remove tag number in path and tag; Fix id or class value by cut trailing numeric characters for the img (TODO: now for all, but experimental) type only
            if (isDebugMode())
                console.log("refine3b:" + items[i].xpath);
            xpItemTmp = "";
            compArr = [];
            domItemsArr2 = [];
            xp = removeLeadingSlashesXPath(items[i].xpath);
            xpathArr = xp.split("/");
            var changedItem = 0;
            for (var j = xpathArr.length - 1; j >= 0; j--) {
                var xpItemTmp = xpathArr[j];
                if (isDebugMode())
                    console.log("1) xpItemTmp:" + xpItemTmp + ", xpathArr[j]:" + xpathArr[j]);
                //Remove tag number in path and tag
                compArr = splitXPAthComponent(xpathArr[j]);
                for (var k = 0; k < compArr.length; k++) {
                    //Find component that is index operation like [1]
                    if ((isXPathComponentIndex(compArr[k]) == 1)) {
                        compArr[k] = "";
                        xpathArr[j] = compArr.join("");
                        break;
                    }
                }
                if (isDebugMode())
                    console.log("2) xpItemTmp:" + xpItemTmp + ", xpathArr[j]:" + xpathArr[j]);
                //Fix id or class value by cut trailing numeric characters for the "image" type and intersect type not "in"
                //TODO: experimental fix for all tag types
                if (/*tagType == "image" &&*/ items[i].intersection.casesMask != 1) {
                    var compArr = splitXPAthComponent(xpathArr[j]);
                    for (var k = 0; k < compArr.length; k++) {
                        var cut = cutXPathComponentValue(compArr[k], 0);
                        if (cut != null) {
                            compArr[k] = cut;
                            xpathArr[j] = compArr.join("");
                        }
                    }
                }
                if (isDebugMode())
                    console.log("3) xpItemTmp:" + xpItemTmp + ", xpathArr[j]:" + xpathArr[j]);
                if (xpItemTmp != xpathArr[j]) {
                    xp = "//" + xpathArr.join("/");
                    domItemsArr2 = xpathEvaluate(xp, 1);
                    //Compare the items number and content of innerText by reduced and original DOM path
                    if (((domItemsArr.length == domItemsArr2.length) && (compareItemArrays(domItemsArr, domItemsArr2, ITEMS_ARRAY_COMPARE_METHOD_INNER_TEXT) == -1)) || (getItemsMode() == MODE_MULTI_ITEM)) {
                        changedItem = 1;
                    } else {
                        if (tagType == "image") {
                            if (compareItemArrays(domItemsArr, domItemsArr2, ITEMS_ARRAY_COMPARE_METHOD_IMG_TAG) == -1) {
                                changedItem = 1;
                            } else {
                                xpathArr[j] = xpItemTmp;
                            }
                        } else {
                            xpathArr[j] = xpItemTmp;
                        }
                    }
                }
                if (isDebugMode())
                    console.log("4) xpItemTmp:" + xpItemTmp + ", xpathArr[j]:" + xpathArr[j]);

                //Fix class name value by cut any additional names but first only for multi-item mode
                if (getItemsMode() == MODE_MULTI_ITEM) {
                    var compArr = splitXPAthComponent(xpathArr[j]);
                    for (var k = 0; k < compArr.length; k++) {
                        var cut = cutXPathComponentValue(compArr[k], 1);
                        if (cut != null) {
                            compArr[k] = cut;
                            xpathArr[j] = compArr.join("");
                            changedItem = 1;
                        }
                    }
                }
                if (isDebugMode())
                    console.log("5) xpItemTmp:" + xpItemTmp + ", xpathArr[j]:" + xpathArr[j]);
            }
            if (changedItem == 1) {
                xp = "//" + xpathArr.join("/");
                items[i].xpath = xp;
            }
            if (isDebugMode())
                console.log("refine3e:" + items[i].xpath);
            
            //Generate short common * xpath if not yet, if "id" or "class" is defined and type is not an "image" or "datetime" and path item is not last
            xpItemTmp = "";
            domItemsArr2 = [];
            pos = 0;
            pos1 = 0;
            changedItem = 0;
            xp = removeLeadingSlashesXPath(items[i].xpath);
            xpathArr = xp.split("/");
            if (isDebugMode())
                console.log("refine4b:" + items[i].xpath);
            for (var j = xpathArr.length - 1; j >= 0; j--) {
                if (((j != xpathArr.length - 1)) || ((j == xpathArr.length - 1) && (tagType != "image") && (tagType != "datetime"))) {
                    pos = xpathArr[j].indexOf("[@id=");
                    pos1 = xpathArr[j].indexOf("[@class=");
                    if ((pos != -1 || pos1 != -1)) {
                        if ((pos > pos1 && pos1 != -1) || (pos1 != -1 && pos == -1)) {
                            pos = pos1;
                        }
                        if (xpathArr[j].substr(0, pos) != "*") {
                            xpItemTmp = xpathArr[j];
                            xpathArr[j] = "*" + xpathArr[j].substr(pos);
                            xp = "//" + xpathArr.join("/");
                            domItemsArr2 = xpathEvaluate(xp, 1);
                            //Compare the items number and content of innerText by reduced and original DOM path
                            if ((domItemsArr.length == domItemsArr2.length) && (compareItemArrays(domItemsArr, domItemsArr2, ITEMS_ARRAY_COMPARE_METHOD_INNER_TEXT) == -1)) {
                                changedItem = 1;
                            } else {
                                xpathArr[j] = xpItemTmp;
                            }
                        }
                    }
                }
            }
            if (changedItem == 1) {
                xp = "//" + xpathArr.join("/");
                items[i].xpath = xp;
                items[i].xpathSimple = "";
                items[i].xpathExact = "";
            }
            if (isDebugMode())
                console.log("refine4e:" + items[i].xpath);
        }

        return items;
    }

    /**
     * Merge items of an array of tagItem object
     *
     * Merge items of an input array with xpath simplification
     * to get more common xpath for regular set of nodes like
     * "<P>", "<SPAN>", "<DIV>" tags on the same DOM level differs
     * with indexed access number.
     *
     *
     * This is one and third of most important procedure of refining
     *
     * @param {array} itemsArr - an array of taggItem objects grabbed
     * @return {array} array of taggItem objects merged
     */
    function mergeTagsItems(itemsArr) {
        var ret = [];

        var items = [];
        for (var i = 0; i < itemsArr.length; i++) {
            items.push(itemsArr[i].getCopy());
        }

        do {
            var f = 0;
            //Seek items and try to find similar to unite
            for (var i = 0; i < items.length; i++) {
                var xpi = removeLeadingSlashesXPath(items[i].xpath),
                    xpathArri = xpi.split("/");
                for (var j = i + 1; j < items.length; j++) {
                    //Similarity by last component in the xpath, all another must be equal
                    var xpj = removeLeadingSlashesXPath(items[j].xpath),
                        xpathArrj = xpj.split("/");
                    if (xpathArri.length == xpathArrj.length) {
                        var isEqual = 1;
                        //Check is only last component is not equal
                        for (var k = 0; k < xpathArri.length; k++) {
                            if (xpathArri[k] !== xpathArrj[k] && k != xpathArri.length - 1) {
                                isEqual = 0;
                                break;
                            }
                        }
                        if (isEqual) {
                            //TODO: Process last component, but possible need to be done for any component
                            var compArri = splitXPAthComponent(xpathArri[xpathArri.length - 1]);
                            var compArrj = splitXPAthComponent(xpathArrj[xpathArrj.length - 1]);
                            if (compArri.length == compArrj.length) {
                                var indexComponent = -1,
                                    classOrIdComponent = -1;
                                for (var k = 0; k < compArri.length; k++) {
                                    //Find number of the component that is index operation like [1], [@class='...'] or [@id='...'] and not equal
                                    if (compArri[k] != compArrj[k]) {
                                        if ((isXPathComponentIndex(compArri[k]) == 1) && (isXPathComponentIndex(compArrj[k]) == 1)) {
                                            indexComponent = k;
                                        }
                                        if ((isXPathComponentClass(compArri[k]) == 1) && (isXPathComponentClass(compArrj[k]) == 1)) {
                                            classOrIdComponent = k;
                                        }
                                        if ((isXPathComponentId(compArri[k]) == 1) && (isXPathComponentId(compArrj[k]) == 1)) {
                                            classOrIdComponent = k;
                                        }
                                        break;
                                    }
                                }
                                if (indexComponent != -1) {
                                    //Cut index operation component to make xpath component more similar
                                    compArrj[indexComponent] = "";
                                    xpathArrj[xpathArrj.length - 1] = compArrj.join("");
                                    //Set new xpath for i-th and j-th items
                                    items[j].xpath = "//" + xpathArrj.join("/");
                                    items[i].xpath = items[j].xpath;
                                    f = 1;
                                }
                                if (classOrIdComponent != -1) {
                                    //merge XPath component expression to make xpath component more similar
                                    var merged = mergeXPathComponentExpression(compArri[classOrIdComponent], compArrj[classOrIdComponent]);
                                    if (merged != null) {
                                        compArrj[classOrIdComponent] = merged;
                                        xpathArrj[xpathArrj.length - 1] = compArrj.join("");
                                        //Set new xpath for i-th and j-th items
                                        items[j].xpath = "//" + xpathArrj.join("/");
                                        items[i].xpath = items[j].xpath;
                                        f = 1;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } while (f);

        //Fill result array only with different items by .xpath field
        for (var i = 0; i < items.length; i++) {
            var inRet = 0;
            for (var j = 0; j < ret.length; j++) {
                if (ret[j].xpath == items[i].xpath) {
                    inRet = 1;
                    break;
                }
            }
            if (!inRet) {
                items[i].xpathSimple = "";
                items[i].xpathExact = "";
                ret.push(items[i]);
            }
        }

        return ret;
    }

    function splitXPAthComponent(xpathComponent) {
        var ret = [],
            compound = "",
            br = 0;

        for (var i = 0; i < xpathComponent.length; i++) {
            if (xpathComponent.charAt(i) == "]") {
                if ((--br) == 0) {
                    ret.push(compound + xpathComponent.charAt(i));
                    compound = "";
                } else {
                    compound += xpathComponent.charAt(i);
                }
            } else {
                if (xpathComponent.charAt(i) == "[") {
                    if (compound != "" && br == 0) {
                        ret.push(compound);
                        compound = "";
                    }
                    br++;
                }
                compound += xpathComponent.charAt(i);
            }
        }

        if (compound != "") {
            ret.push(compound);
        }

        return ret;
    }

    function isXPathComponentIndex(xpathComponent) {
        var ret = 0;

        if (xpathComponent.length > 2 && xpathComponent.charAt(0) == "[" && xpathComponent.charAt(xpathComponent.length - 1) == "]" && !isNaN(xpathComponent.slice(1, -1))) {
            ret = 1;
        }

        return ret;
    }

    function isXPathComponentClass(xpathComponent) {
        var ret = 0;

        if ((xpathComponent.length > 2) && (xpathComponent.charAt(0) == "[") && (xpathComponent.charAt(xpathComponent.length - 1) == "]") && (xpathComponent.indexOf("@class") != -1)) {
            ret = 1;
        }

        return ret;
    }

    function isXPathComponentId(xpathComponent) {
        var ret = 0;

        if ((xpathComponent.length > 2) && (xpathComponent.charAt(0) == "[") && (xpathComponent.charAt(xpathComponent.length - 1) == "]") && (xpathComponent.indexOf("@id") != -1)) {
            ret = 1;
        }

        return ret;
    }

    function mergeXPathComponentExpression(component1, component2) {
        var ret = null;

        //Try the initial form
        var re = /\[@([^=]+)='(.*?)'\]/ig;
        var value1 = re.exec(component1);
        re.lastIndex = 0;
        var value2 = re.exec(component2);

        if (value1 == null || value2 == null || !(value1.length > 2 && value1.length == value2.length)) {
            //Try the once merged form
            re = /\[@([^\[]+)\[starts-with\(\.\, '(.*?)'\)\]\]/ig;
            value1 = re.exec(component1);
            re.lastIndex = 0;
            value2 = re.exec(component2);
        }

        if (value1 != null && value2 != null && value1.length > 2 && value1.length == value2.length) {
            //Find equal part
            for (var i = 0; i < (value1[2].length > value2[2].length ? value2[2].length : value1[2].length); i++) {
                if (value1[2].charAt(i) != value2[2].charAt(i)) {
                    break;
                }
            }
            if (i > 0) {
                ret = "[@" + value1[1] + "[starts-with(., '" + value1[2].substr(0, i) + "')]]";
            }
        }

        return ret;
    }

    function cutXPathComponentValue(component, mode) {
        var ret = null;

        var re = /\[@([^=]+)='(.*?)'\]/ig;
        var value = re.exec(component);
        if (value != null) {
            //Reduce trailing numeric part
            if (mode == 0) {
                for (var i = value[2].length - 1; i >= 0; i--) {
                    if (isNaN(Number(value[2].charAt(i)))) {
                        break;
                    }
                }
                if (i > 0 && i != value[2].length - 1) {
                    ret = "[@" + value[1] + "[starts-with(., '" + value[2].substr(0, i + 1) + "')]]";
                }
            } else if ( mode == 1 ) {
                //Reduce names to first one
                var names = value[2].split(' ');
                if ( names.length >1 ) {
                    ret = "[@" + value[1] + "[starts-with(., '" + names[0] + " ')]]";
                }  
            }
        }

        return ret;
    }

    function isXPathHasIdOrClass(xpath) {
        var ret = 0;

        if (xpath.indexOf("[@id=") != -1 || xpath.indexOf("[@class=") != -1) {
            ret = 1;
        }

        return ret;
    }

    function isDateTimeEntrance(content) {
        var ret = 0;

        if ((content!=undefined) && (content!=null)) {
            var c = content.trim();
            
            if (c.length>0) {
                //Prepare Japan year divider
                c = c.replace(RegExp(decodeHtmlEntity("&#24180;"), "gi"), "/");
                //Prepare Japan month divider
                c = c.replace(RegExp(decodeHtmlEntity("&#26376;"), "gi"), "/");
                //Prepare Japan day divider
                c = c.replace(RegExp(decodeHtmlEntity("&#26085;"), "gi"), " ");
                //Prepare Japan hour divider
                c = c.replace(RegExp(decodeHtmlEntity("&#26178;"), "gi"), ":");
                //Prepare Japan minutes divider
                c = c.replace(RegExp(decodeHtmlEntity("&#20998;"), "gi"), " ");
                //Replace some stupid ": " entrances
                c = c.replace(/\:\s/g, " ");
                
                //Try to find date
                //console.log("1: [" + content + "] : [" + c + "] : " + (!isNaN(Date.parse(c))) + " : " + ((new Date(c)).toString() != "Invalid Date"));
                if (c.length>3) {
                    ret = findDateInString(c);
                    if (ret == 0) {
                        //Remove all alpha chars
                        c = c.replace(/[^\d.\-:/]/g, ' ').trim();
                        //Try to find date
                        //console.log("2: [" + content + "] : [" + c + "] : " + (!isNaN(Date.parse(c))) + " : " + ((new Date(c)).toString() != "Invalid Date"));
                        if (c.length>3) {
                            ret = findDateInString(c);
                        }
                    }
                }
            }
        }

        return ret;
    }

    function findDateInString(s) {
        var ret = 0;

        //Cut from right
        for (var i = s.length - 1; i > 3; i--) {
            var s1 = s.substr(0, i);
            if ((s1 != "") && (!isNaN(Date.parse(s1)) || ((new Date(s1)).toString() != "Invalid Date"))) {
                //console.log("1:s1="+s1+" : i="+i+" : "+s.length);
                ret = 1;
                break;
            }
        }

        if (ret == 0) {
            //Cut from left
            for (var i = 0; i >= s.length - 4; i++) {
                var s1 = s.substr(i);
                if ((s1 != "") && (!isNaN(Date.parse(s1)) || ((new Date(s1)).toString() != "Invalid Date"))) {
                    //console.log("2:s1="+s1+" : i="+i+" : "+s.length);
                    ret = 1;
                    break;
                }
            }
        }

        return ret;
    }

    function decodeHtmlEntity(str) {
        var s = decodeHTMLEntitiesBasic(str);

        return s.replace(/&#(\d+);/g, function(match, dec) {
            return String.fromCharCode(dec);
        });
    }

    function decodeHTMLEntitiesBasic(text) {
        var entities = [
            ['apos', '\''],
            ['amp', '&'],
            ['lt', '<'],
            ['gt', '>']
        ];
        
        for (var i = 0, max = entities.length; i < max; ++i) 
            text = text.replace(new RegExp('&'+entities[i][0]+';', 'g'), entities[i][1]);
        
        return text;
    }

    /**
     * Compare an DOM node elements arrays
     *
     *
     * @param {array} arr1 - an array of DOM node objects to compare
     * @param {array} arr2 - an array of DOM node objects to compare with
     * @param {numeric} method - comparison method: 0 - innerText,
     * 1 - innerHTML, 2 - img tags presence
     * @return {numeric} -1 - if arrays are equal, another value is index
     * of first different item
     */
    function compareItemArrays(arr1, arr2, method) {
        var ret = -1;

        for (var i = 0; i < arr1.length; i++) {
            if (arr1[i].nodeName.toLowerCase() == "img") {
                if (method == 2) {
                    //Check presence of all items type img from arr1 in arr2 by src value
                    var present = 0;
                    for (var j = 0; j < arr2.length; j++) {
                        if (arr2[j].nodeName.toLowerCase() == "img" && arr1[i].src != arr2[j].src) {
                            present = 1;
                        }
                    }
                    if (present == 0) {
                        ret = i;
                        break;
                    }
                } else {
                    if (arr2[i].nodeName.toLowerCase() != "img" || arr1[i].src != arr2[i].src) {
                        ret = i;
                        break;
                    }
                }
            } else {
                if (method == 0) {
                    if (_jQuery(arr1[i]).text().trim() != _jQuery(arr2[i]).text().trim()) {
                        ret = i;
                        break;
                    }
                } else {
                    if (method == 1) {
                        if (_jQuery(arr1[i]).html().trim() != _jQuery(arr2[i]).html().trim()) {
                            ret = i;
                            break;
                        }
                    }
                }
            }
        }

        return ret;
    }

    function removeLeadingSlashesXPath(xpath) {
        var ret = xpath;

        if (ret.substring(0, 2) == "//") {
            ret = xpath.substring(2);
        } else {
            if (ret.substring(0, 1) == "/") {
                ret = ret.substring(1);
            }
        }

        return ret;
    }

    /**
     * Get more simple xpath
     *
     *
     * Main simplification principle is usage of the "id" instead of the
     * DOM structure
     *
     * @param {string} xpath - source xpath
     * @param {object} tagObject - DOM node object from current document
     * that is source of this xpath
     * @return {string} simplified xpath or empty string
     */
    function getSimpleXPath(xpath, tagObject) {
        var ret = "";

        var id = _jQuery(tagObject).prop("id");
        //Is node has "id"
        if (id && id != "") {
            ret = "//*[@id='" + id + "']";
        }

        //Is node has "class"
        var classProp = _jQuery(tagObject).prop("class");
        if (classProp && classProp != "") {
            if (ret == "") {
                ret += "//*";
            }
            ret += "[@class='" + classProp + "']";
        }

        //If no id or class - try simplify path from right
        if (ret != "") {
            //Compare the items number by Id and by DOM path
            var domItemsArr = xpathEvaluate(xpath, 1);
            var idItemsArr = xpathEvaluate(ret, 1);
            if (idItemsArr.length < 1 || domItemsArr.length < idItemsArr.length) {
                ret = "";
            }
        }

        //TODO: If node has name

        return ret;
    }

    /**
     * Get more exact xpath from simple
     *
     *
     * Main principle is to use general qualifier "*" instead exact DOM
     * node tag name
     *
     * @param {string} simpleXpath - source xpath, supposs a result of
     * the getSimpleXPath()
     * @param {object} tagObject - DOM node object from current document
     * that is source of this xpath
     * @return {string} exact xpath or empty sring
     */
    function getExactXPath(simpleXpath, tagObject) {
        var ret = "";

        if (simpleXpath != "") {
            ret = simpleXpath.replace(/\*/g, tagObject.nodeName.toLowerCase());
        } else {
            //TODO: add alternate method
        }

        return ret;
    }

    function escapeHTML(html) {
        return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    /**
     * Get best tagItem array after filtration, refining and merging
     *
     *
     * Most simple and common way to get good xpaths
     *
     * @param {array} grabbedTagsItems - array if tagItem objects grabbed
     * from this DOM
     * @param {string} tagType - the code of the tagret information of DOM
     * node tag type, for example: "text", "html" or "img"
     * @return {array} an array of tagItem objects contains best xpaths
     */
    function getBestTagsItems(grabbedTagsItems, tagType) {
        var tagsItems = mergeTagsItems(refineTagsItems(filterTagsItems(grabbedTagsItems, tagType), tagType));

        //Replace back some important characters like the slash "/"
        for (var i = 0; i < tagsItems.length; i++) {
            tagsItems[i].xpath = replaceXPathImportantChars(tagsItems[i].xpath, 1);
            tagsItems[i].xpathSimple = replaceXPathImportantChars(tagsItems[i].xpathSimple, 1);
            tagsItems[i].xpathExact = replaceXPathImportantChars(tagsItems[i].xpathExact, 1);
        }

        return tagsItems;
    }

    /**
     * Get best xpaths array after filtration, refining and merging
     *
     *
     * The same as the getBestTagsItems(), but returns array of xpath string
     *
     * @param {array} grabbedTagsItems - array if tagItem objects grabbed
     * from this DOM
     * @param {string} tagType - the code of the tagret information of DOM
     * node tag type, for example: "text", "html" or "img"
     * @return {array} an array of xpath string
     */
    function getBestXPaths(grabbedTagsItems, tagType) {
        var ret = [];

        var bestItems = getBestTagsItems(grabbedTagsItems, tagType);

        for (var i = 0; i < bestItems.length; i++) {
            var xp = "";

            if (bestItems[i].xpathSimple != "") {
                xp = bestItems[i].xpathSimple;
            } else {
                if (bestItems[i].xpathExact != "") {
                    xp = bestItems[i].xpathExact;
                } else {
                    xp = bestItems[i].xpath;
                }
            }

            if (xp != "") {
                ret.push(xp);
            }
        }

        return ret;
    }

    /**
     * Get the pattern for given URL string that can be used to collect URLs with the regular expression
     *
     *
     *
     * @param {string} urlStr - the URL candidate to make a pattern
     * @return {string} a pattern string
     */
    function getLinkChainPattern(urlStr) {
        var ret = urlStr;

        var urlArr = urlStr.split("/");
        if (urlArr.length>1){
            for (var j = urlArr.length - 1; j > 0; j--) {
                if (/\d/.test(urlArr[j])){
                    urlArr[j] = urlArr[j].replace(/[0-9]/g, "0");
                    urlArr[j] = urlArr[j].replace(/0+/g, "0");
                    urlArr[j] = urlArr[j].replace(/0/g, "\\d*");
                    break;
                }
            }
            /*
            if(j>0){
                if(urlArr[0] == "http:"){
                    
                }else{
                    
                }
            }
            */
            ret = urlArr.join("\\/");
            ret = ret.replace(/\./g, "\\.");
        }

        return ret;
    }

    /**
     * Checks is the attribute string (supposed id or class value) digit characters suffix len
     *
     *
     *
     * @param {string} attrStr - the attribute string value
     * @param {digit} suffixMaxLen - the max limit of digit characters suffix lenght
     * @param {algorithm} algorithm: 0 - only sequential order from right side, 1 - any position  
     * @return {bool} True if lenght of the suffix is okay
     */
    function isDigitSuffixTooLong(attrStr, suffixMaxLen, algorithm) {
        var ret = false;

        if (suffixMaxLen == -1){
            return;
        }

        var s = attrStr.replace(/\-/g, " ");        
        s = s.replace(/\_/g, " ");
        var sa = s.split(" ");
        for (var i = 0; i < sa.length; i++) {
            if (algorithm == 0) {
                for (var j = sa[i].length - 1; j >= 0; j--) {            
                    if (isNaN(sa[i].charAt(j))) {
                        break;
                    }
                }
                if((sa[i].length - 1) - j >= suffixMaxLen){
                    ret = true;
                    break;
                }
            } else {
                var t = sa[i].replace(/[^\d]/g, '');
                if (t.length > suffixMaxLen) {
                    ret = true;
                    break;
                }                
            }
        }        
        
        return ret;
    }

    function setDocument(obj) {
        _document = obj;
    }

    function getDocument() {
        if(_document){
            return _document;
        }else{
            return document;
        }
    }

    function setWindow(obj) {
        _window = obj;
    }

    function getWindow() {
        if(_window){
            return _window;
        }else{
            return window;
        }
    }

    function setJQuery(obj) {
        _jQuery = obj;
    }

    function getJQuery() {
        if(_jQuery){
            return _jQuery;
        }else{
            return jQuery;
        }
    }

    function setItemsMode(mode) {
        _itemsMode = mode;
    }

    function getItemsMode() {
        return _itemsMode;
    }

    function setDebugMode(mode) {
        _debugMode = mode;
    }

    function getDebugMode() {
        return _debugMode;
    }
    function isDebugMode() {
        return (_debugMode == DEBUG_MODE_ON);
    }

    function getClassesToRemove() {
        return _classesToRemove;
    }

    function setClassesToRemove(reStringsArray) {
        _classesToRemove = reStringsArray;
    }

    return {
        isVisible: isVisible,
        grabIntersected: grabIntersected,
        getXPath: getXPath,
        findIntersection: findIntersection,
        xpathEvaluate: xpathEvaluate,
        filterTagsItems: filterTagsItems,
        refineTagsItems: refineTagsItems,
        mergeTagsItems: mergeTagsItems,
        splitXPAthComponent: splitXPAthComponent,
        isXPathComponentIndex: isXPathComponentIndex,
        isXPathHasIdOrClass: isXPathHasIdOrClass,
        compareItemArrays: compareItemArrays,
        removeLeadingSlashesXPath: removeLeadingSlashesXPath,
        getSimpleXPath: getSimpleXPath,
        getExactXPath: getExactXPath,
        escapeHTML: escapeHTML,
        getBestTagsItems: getBestTagsItems,
        getBestXPaths: getBestXPaths,
        decodeHtmlEntity: decodeHtmlEntity,
        getLinkChainPattern: getLinkChainPattern,
        getDocument: getDocument,
        setDocument: setDocument,
        setWindow: setWindow,
        getWindow: getWindow,
        getJQuery: getJQuery,
        setJQuery: setJQuery,
        setItemsMode: setItemsMode,
        getItemsMode: getItemsMode,
        setDebugMode: setDebugMode,
        getDebugMode: getDebugMode,
        setClassesToRemove: setClassesToRemove,
        getClassesToRemove: getClassesToRemove
    };

})();

/**
 * The tag item object.
 *
 * This is main unit of object model to store xpath information, node object
 * reference, intersection information, rectangles of selection and DOM node
 * and another useful information.
 *
 * @tagObject {object} The DOM node instance from HTML tag
 * @interSect {object} The intersection object instance
 * @tRect {object} The rect object instance of tag node from DOM
 * @sRect {object} The rect object instance of selection capturing area
 * @return {object} tagItem object instance
 */
XPathRefine.TagItem = function(tagObject, interSect, tRect, sRect) {
    this.tagObject = tagObject;
    this.intersection = interSect;
    this.xpath = XPathRefine.getXPath(tagObject);
    this.xpathSimple = XPathRefine.getSimpleXPath(this.xpath, tagObject);
    this.xpathExact = XPathRefine.getExactXPath(this.xpathSimple, tagObject);
    this.tagRect = tRect;
    this.selRect = sRect;

    this.getCopy = function() {
        var ti = new XPathRefine.TagItem(this.tagObject, this.intersection, this.tagRect, this.selRect);
        ti.xpath = this.xpath;
        ti.xpathSimple = this.xpathSimple;
        ti.xpathExact = this.xpathExact;
        return ti;
    };
};

/**
 * The rectangle object.
 *
 * This is object to store area coordinates.
 *
 * @x1 {numeric} The x coordinate of left top corner.
 * @y1 {numeric} The y coordinate of left top corner.
 * @x2 {numeric} The x coordinate of right bootom corner.
 * @y2 {numeric} The y coordinate of right bootom corner.
 * @return {object} rect object instance
 */
XPathRefine.Rect = function(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
};

/**
 * The intersection object.
 *
 * This is object to store the mask of supported intersections types of
 * rectangular areas.
 *
 * @cMask {numeric} The binary mask of an intersection types detected
 * @cList {string} The csv string of intersections names accumulated during
 * detection process.
 * @return {object} intersection object instance
 */
XPathRefine.Intersection = function(cMask, cList) {
    this.casesMask = cMask;
    this.casesList = cList;
};
