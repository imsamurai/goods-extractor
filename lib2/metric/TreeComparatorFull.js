/**
 * Created by imsamurai on 13.01.2016.
 */
function TreeComparatorFull(rate, cutoff) {
    var nameRate = 0.51;
    var attributesRate = 0.39;
    var attributeClassRate = 0.8;
    var attributeIdRate = 0.1;
    var attributeOtherRate = 0.1;
    var textPresentRate = 0.1;

    this.run = function (tree1, tree2) {
        var weight = compare(tree1, tree2, 1);
        return weight < cutoff ? 0 : weight;
    };

    function compare(t1, t2, parentWeight) {
        var weight = 0;
        if (t2 === undefined) {
            return weight;
        }
        var r = getRate(t1.node, t2.node);
        if (r >= nameRate) {
            if (t1.children.length > 0) {
                weight = parentWeight * rate * r;
                for (var i = 0; i < t1.children.length; i++) {
                    weight += compare(t1.children[i], t2.children[i], parentWeight * (1 - rate) / t1.children.length)
                }
            } else {
                weight = parentWeight * r;
            }
        }
        return weight;
    }

    function getRate(node1, node2) {
        return compareByName(node1, node2) * nameRate
            + compareByAttributesValue(node1, node2) * attributesRate
        + compareByTextPresent(node1, node2) * textPresentRate;
    }

    function compareByName(node1, node2) {
        return node1.name == node2.name ? 1 : 0;
    }

    function compareByAttributesValue(node1, node2) {
        var attributes = getAttributesRates(Object.keys(node1.attributes).unique());
        return attributes.reduce(function (weight, attr) {
            return weight
                + compareAttributeValue(node1.attributes[attr.attr], node2.attributes[attr.attr]) * attr.rate;
        }, 0);
    }

    function compareByTextPresent(node1, node2) {
        var text1 = node1.texts().join('');
        var text2 = node2.texts().join('');
        if (
            (text1 == "" && text2 == "")
            || (text1 != "" && text2 != "")
        ) {
            return 1;
        }
        return 0;
    }

    function compareAttributeValue(attr1, attr2) {
        if (attr1 == attr2) {
            return 1;
        }
        if (attr1 === undefined || attr2 === undefined) {
            return 0;
        }
        var attrNorm1 = normalizeAttribute(attr1);
        var attrNorm2 = normalizeAttribute(attr2);

        var attrNormStr1 = attrNorm1.join(' ');
        var attrNormStr2 = attrNorm2.join(' ');

        if (attrNormStr1 == attrNormStr2) {
            return 0.5;
        }

        var weight = attrNorm1.reduce(function (weight, word) {
            if (attrNorm2.indexOf(word) !== -1) {
                weight += 1;
            } else if (attrNormStr2.indexOf(word) !== -1) {
                weight += 0.5;
            }
            return weight;
        }, 0);
        return attrNorm1.length == 0 ? 0 : weight / attrNorm1.length;
    }


    function getAttributesRates(attributes) {
        var otherAttributes = attributes.filter(function(attr) {
            return attr !== 'class' && attr !== 'id';
        });
        var noOthersRate = otherAttributes.length === 0 ? attributeOtherRate /2 : 0;
        return [
            {attr: 'class', rate: attributeClassRate + noOthersRate},
            {attr: 'id', rate: attributeIdRate + noOthersRate}
        ].concat(
            otherAttributes.map(function(attr) {
                return {attr: attr, rate: attributeOtherRate/otherAttributes.length};
            })
        );
    }

    function normalizeAttribute(attr) {
        return attr.split(/\s+|[!@#$%^&*()_+\-=\[\]{};':~`¹"\\|,.<>\/? ]+|\d+/g).filter(function (s) {
            return s != "";
        });
    }
}

