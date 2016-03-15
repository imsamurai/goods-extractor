/**
 * Created by imsamurai on 01.02.2016.
 */
function ProductModel(dic) {
    //var VALUES_SOURCES = ['href', 'innerText', 'src', 'title', 'alt'];
    var DICT_TYPES_CLASS = [
        dic.dicts.title,
        dic.dicts.link,
        dic.dicts.image,
        dic.dicts.price,
        dic.dicts.skip
    ];
    var CORRELATION_ATTRIBUTES = ['title', 'alt'];
    var NUM_PAT = '(?:\\d+[0-9 ]*|)\\d+(?:[\.,]\\d+|)';
    var TAG_TYPES = [
        {
            type: 'FORMATTING',
            pattern: new RegExp('^(?:SPAN|STRONG|B|I|FONT|EM|U|PRE|CODE|TT|BLOCKQUOTE|CENTER|P|NOBR)$')
        },
        {
            type: 'FORMATTING_HIDDEN',
            pattern: new RegExp('^(?:STRIKE|SMALL|DEL|SUB|SUP)$')
        },
        {
            type: 'HEADING',
            pattern: new RegExp('^H\\d+$')
        },
        {
            type: 'LINK',
            pattern: new RegExp('^A$')
        },
        {
            type: 'IMAGE',
            pattern: new RegExp('^IMG$')
        },
        {
            type: 'OTHER',
            pattern: new RegExp('^.*$')
        }
    ];
    var TRUE = 1.0;
    var FALSE = 0.0;
    var props = {};

    this.getLabeledSample = function (element, value, labels) {
        return {
            input: this.getSample(element, value),
            output: labels
        };
    };

    this.getSample = function (element, value) {
        construct(element, value);
        return props;
    };

    this.getSampleFromField = function (field) {
        construct(field.tree.node.DOMNode, field.value);
        return props;
    };

    function construct(element, value) {
        props = {};
        if (value === undefined || value.length === 0) {
            return;
        }

        var prefix = 't';

        var currency = getCurrency(value);
        var numbers = getNumbers(value);
        var price = getPrice(value, currency);
        var specials = getSpecials(value);
        var words = getWords(value);
        var wordsCapitalized = getWordsCapitalized(words);
        var link = isLink(value);

        /**
         * Common props
         */
        addCommonProps(element, value, prefix);
        /**
         * Price should contain currency from dic
         */
        addProp(prefix, 'currency', currency ? TRUE : FALSE);
        /**
         * Price should have numbers count in range 1..2
         */
        addProp(prefix, 'numbers', normalizeDiscrete(numbers.count, 1, 2));
        /**
         * Price must present or not
         */
        addProp(prefix, 'price', price ? TRUE : FALSE);
        /**
         * Value without price rate
         */
        addProp(prefix, 'lenWOPrice', rate(value.length, value.replace(price, '').length));
        /**
         * Special chars in value
         */
        addPropMult(prefix + '_specialChar', specials, TRUE);
        /**
         * Value length
         */
        addProp(prefix, 'length', normalize01(value.length, 20));
        /**
         * Words length
         */
        addProp(prefix, 'words', normalize01(words.length, 5));
        /**
         * Words capitalized rate
         */
        addProp(prefix, 'wordsCap', rate(words.length, wordsCapitalized.length));
        /**
         * Is link value
         */
        addProp(prefix, 'link', link ? TRUE : FALSE);
        /**
         * Correlation between value and attributes
         */
        addPropMultVal(prefix, CORRELATION_ATTRIBUTES.map(function (attr) {
            if (link) {
                return {
                    name: 'corr_' + attr,
                    value: getCorrelationLink(value, getAttribute(element, attr))
                }
            } else {
                return {
                    name: 'corr_' + attr,
                    value: getCorrelationText(value, getAttribute(element, attr))
                }
            }
        }));

        /**
         * Correlation attributes analysis
         */
        addPropMultVal(prefix, CORRELATION_ATTRIBUTES.flatMap(function (attr) {
            var words = getWords(getAttribute(element, attr));
            var wordsCapitalized = getWordsCapitalized(words);
            return [
                {
                    name: 'words_' + attr,
                    value: normalize01(words.length, 5)
                },
                {
                    name: 'wordsCap_' + attr,
                    value: rate(words.length, wordsCapitalized.length)
                }
            ]
        }));


        var parent = getParent(element);
        addParentProps(parent, value, 'pt');
        var grandParent = getParent(parent);
        addParentProps(grandParent, value, 'gpt');
        var grandGrandParent = getParent(grandParent);
        addParentProps(grandGrandParent, value, 'ggpt');


        /* var classes = getClassesChunk(element);
         var parentClasses = getClassesChunk(element.parentElement);
         var grandParentClasses = getClassesChunk(element.parentElement.parentElement);
         var hasCurrency = getCurrencies(value).length ? TRUE: FALSE;
         var parentHasCurrency = getCurrencies(getAttribute(element.parentElement, 'innerText')).length ? TRUE: FALSE;
         var grandParentHasCurrency = getCurrencies(getAttribute(element.parentElement.parentElement, 'innerText')).length ? TRUE: FALSE;

         addProp('tag', getNormalizedTagName(element), TRUE);
         //addProp('tag', 'complexity', getComplexityRate(element));
         addProp('tag',  'hasChars', getCharsCount(value) ? TRUE: FALSE);
         addProp('tag',  'hasDigits', getDigitsCount(value) ? TRUE: FALSE);
         addProp('tag',  'hasSpecials', getSpecialsCount(value) ? TRUE: FALSE);
         addProp('tag',  'hasSpaces', getSpacesCount(value) ? TRUE: FALSE);
         addProp('tag',  'uppercasePercent', getUppercasePercent(value));
         addProp('tag',  'normalizedLength', getNormalizedLength(value));
         addProp('tag',  'charsPercent', getCharsPercent(value));
         addProp('tag',  'digitsPercent', getDigitsPercent(value));
         addProp('tag',  'specialsPercent', getSpecialsPercent(value));
         addProp('tag',  'spacesPercent', getSpacesPercent(value));

         addProp('parentTag', getNormalizedTagName(element.parentElement), TRUE);
         //addProp('parentTag', 'complexity', getComplexityRate(element.parentElement));
         addProp('grandParentTag', getNormalizedTagName(element.parentElement.parentElement), TRUE);
         //addProp('grandParentTag', 'complexity', getComplexityRate(element.parentElement.parentElement));
         getChildrens(element).forEach(function(elem) {
         addProp('childTag', getNormalizedTagName(elem), TRUE);
         addPropMult('childClass', getClassesChunk(elem), TRUE);

         });

         addPropMult('class', classes, TRUE);
         addPropMult('parentClass', parentClasses, TRUE);
         addPropMult('grandParentClass', grandParentClasses, TRUE);

         addProp('tag', 'hasCurrency', hasCurrency);
         addProp('parentTag', 'hasCurrency', parentHasCurrency);
         addProp('grandParentTag', 'hasCurrency', grandParentHasCurrency);

         addProp('tag', 'digitsToTextPercent', getDigitsToTextPercent(value));
         addProp('tag', 'spacesToTextPercent', getSpacesToTextPercent(value));
         addProp('tag', 'specialsToTextPercent', getSpecialsToTextPercent(value));
         addProp('tag', 'hasDecimal', hasDecimal(value));
         addProp('tag', 'hasLink', hasLink(value));


         addPropMult('hasSpecialChar', getSpecials(value), TRUE);
         addPropMultVal('specialCharPercent', getSpecialsPercentage(value));

         addPropMultVal('tagPropertySource', VALUES_SOURCES.map(function (attr) {
         return {
         name: attr,
         value: getAttribute(element, attr) == value ? TRUE: FALSE
         }
         }));

         addPropMultVal('attr', VALUES_SOURCES.map(function (attr) {
         return {
         name: attr,
         value: isAttributeNonEmpty(element, attr)
         }
         }));
         addPropMultVal('attrDistance', VALUES_SOURCES.map(function (attr) {
         return {
         name: attr,
         value: normalizedEditDistance(value, getAttribute(element, attr))
         }
         }));

         addPropMultVal('parentAttr', VALUES_SOURCES.map(function (attr) {
         return {
         name: attr,
         value: isAttributeNonEmpty(element.parentElement, attr)
         }
         }));
         addPropMultVal('parentAttrDistance', VALUES_SOURCES.map(function (attr) {
         return {
         name: attr,
         value: normalizedEditDistance(value, getAttribute(element.parentElement, attr))
         }
         }));

         addPropMultVal('grandParentAttr', VALUES_SOURCES.map(function (attr) {
         return {
         name: attr,
         value: isAttributeNonEmpty(element.parentElement.parentElement, attr)
         }
         }));
         addPropMultVal('parentAttrDistance', VALUES_SOURCES.map(function (attr) {
         return {
         name: attr,
         value: normalizedEditDistance(value, getAttribute(element.parentElement.parentElement, attr))
         }
         }));*/

    }

    function addProp(prefix, name, value) {
        var propName = prefix + '_' + name;
        props[propName] = value;
    }

    function addPropMult(prefix, names, value) {
        for (var cNum = 0; cNum < names.length; cNum++) {
            addProp(prefix, names[cNum], value);
        }
    }

    function addPropMultVal(prefix, namesValues) {
        for (var cNum = 0; cNum < namesValues.length; cNum++) {
            addProp(prefix, namesValues[cNum].name, namesValues[cNum].value);
        }
    }

    function getParent(element) {
        if (!element) {
            return null;
        }
        return element.parentElement ? element.parentElement : null;
    }

    function addParentProps(element, value, prefix) {
        if (!element) {
            return;
        }
        addCommonProps(element, value, prefix);
    }

    function addCommonProps(element, value, prefix) {
        if (!element) {
            return;
        }

        /**
         * Class names by type present
         */
        addPropMultVal(prefix, DICT_TYPES_CLASS.map(function (type) {
                return {
                    name: 'class_' + type,
                    value: getClassNames(element, type).length ? TRUE : FALSE
                }
        }));

        /**
         * Tag type
         */
        addProp(prefix, 'type_' + getTagType(element), TRUE);

        /**
         * Have hidden style
         */
        addProp(prefix, 'hiddenStyle', haveHiddenStyle(element) ? TRUE : FALSE);

        /**
         * Have hidden class
         */
        addProp(prefix, 'hiddenClass', haveHiddenClass(element) ? TRUE : FALSE);
    }

    function getCurrency(val) {
        var currencies = dic.findEntries(val, dic.dicts.currency, true);
        if (currencies.length === 0) {
            return null;
        }
        return currencies.sort(function (cur1, cur2) {
            if (cur1.length > cur2.length) {
                return -1;
            } else if (cur1.length < cur2.length) {
                return 1;
            }
            return 0;
        })[0];
    }

    function getNumbers(val) {
        var numbers = val.match(new RegExp(NUM_PAT, 'g'));
        return numbers || [];
    }

    function getPrice(value, currency) {
        if (!currency) {
            return null;
        }
        var cur = escapeRegExpr(currency);
        var sep = '[^0-9\\n]{1,10}';
        var sepOrN = '(?:' + sep + '|)';
        var patterns = [
            new RegExp(cur + sepOrN + NUM_PAT + sep + cur + sepOrN + NUM_PAT, "i"),
            new RegExp(NUM_PAT + sepOrN + cur + NUM_PAT + sepOrN + cur, "i"),
            new RegExp(cur + sepOrN + NUM_PAT + sep + NUM_PAT, "i"),
            new RegExp(NUM_PAT + sep + NUM_PAT + sepOrN + cur, "i"),
            new RegExp(cur + sepOrN + NUM_PAT, "i"),
            new RegExp(NUM_PAT + sepOrN + cur, "i")
        ];
        return patterns.flatMap(function (pattern) {
                return value.match(pattern) || [];
            }).sort(function (pattern1, pattern2) {
                if (pattern1.length > pattern2.length) {
                    return -1;
                } else if (pattern1.length < pattern2.length) {
                    return 1;
                }
                return 0;
            })[0] || "";
    }

    function getSpecials(val) {
        //var specials = val.match(/[!@#$%^&*()_+\-=\[\]{};':~`¹"\\|,.<>\/? ]/g) || [];
        var specials = val.match(/[()|/:;+%,.]/g) || [];
        return specials.unique();
    }

    function getClassNames(elem, type) {
        var className = getAttribute(elem, 'className');
        return dic.findEntries(className, type);
    }

    function getTagType(elem) {
        var tagName = getTagName(elem);
        return TAG_TYPES.find(function (type) {
            return !!tagName.match(type.pattern);
        }).type;
    }

    function getWords(val) {
        return val.match(/[^\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\| 0-9]\S*/g, '') || [];
    }

    function getWordsCapitalized(words) {
        return words.filter(function (word) {
            return word[0].toUpperCase() === word[0];
        });
    }

    function isLink(val) {
        return !!val.match(/^(?:https?:|)\/\/\S+$/);
    }

    function normalize01(val, midBound) {
        midBound = midBound ? midBound : 1;
        return 1 - midBound / (midBound + val);
    }

    function rate(one, two) {
        return one === 0 ? 0 : two / one;
    }

    function normalizeDiscrete(val, min, max) {
        if (min > val || val > max) {
            return 0;
        }
        return 1;
    }

    function escapeRegExpr(val) {
        return val.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    function getAttribute(elem, attr) {
        if (attr == 'innerText') {
            return getInnerText(elem);
        }
        return elem[attr] ? elem[attr].replace(/\s{2,}/gi, ' ').trim() : "";
    }

    function getTagName(elem) {
        return elem.tagName.toUpperCase();
    }

    function getCorrelationText(a, b) {
        return normalizedEditDistance(a, b);
    }

    function getCorrelationLink(link, text) {
        var linkPart = link.replace(/\?.*$/, '').split('/').sort(function (part1, part2) {
            if (part1.length > part2.length) {
                return -1;
            } else if (part1.length < part2.length) {
                return 1;
            }
            return 0;
        })[0];
        return getCorrelationText(linkPart, text);
    }

    function haveHiddenStyle(elem) {
        var style = elem.style;
        return style.display === 'none'
            || style.visiblity === 'hidden'
            || style.visiblity === 'collapse'
            || style.width === '0px'
            || style.height === '0px';
    }

    function haveHiddenClass(elem) {
        var className = getAttribute(elem, 'className');
        return dic.findEntries(className, dic.dicts.skip).length > 0;
    }

    function normalizedEditDistance(a, b) {
        a = a.toLowerCase().replace(/\s+|[!@#$%^&*()_+\-=\[\]{};':~`¹"\\|,.<>\/? ]+|\d+/g, '');
        b = b.toLowerCase().replace(/\s+|[!@#$%^&*()_+\-=\[\]{};':~`¹"\\|,.<>\/? ]+|\d+/g, '');

        var distance = getEditDistance(a, b);
        if (distance == 0) {
            return distance;
        }
        return 1 - (distance / Math.max(a.length, b.length, 1))
    }

    function getEditDistance(a, b) {
        if (a.length == 0) return b.length;
        if (b.length == 0) return a.length;

        var matrix = [];

        // increment along the first column of each row
        var i;
        for (i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        // increment each column in the first row
        var j;
        for (j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        // Fill in the rest of the matrix
        for (i = 1; i <= b.length; i++) {
            for (j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) == a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1)); // deletion
                }
            }
        }

        return matrix[b.length][a.length];
    }

}

