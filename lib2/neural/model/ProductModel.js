/**
 * Created by imsamurai on 01.02.2016.
 */
function ProductModel(dic, complexityMetric) {
    var VALUES_SOURCES = ['href', 'innerText', 'src', 'title', 'alt'];
    var INT_TRUE = 1;
    var INT_FALSE = 0;
    var props = {};

    this.getLabeledSample = function(element, value, labels) {
        return {
            input: this.getSample(element, value),
            output: labels
        };
    };

    this.getSample = function(element, value) {
        construct(element, value);
        return props;
    };

    this.getSampleFromField = function(field) {
        construct(field.tree.node.DOMNode, field.value);
        return props;
    };

    function construct(element, value) {
        props = {};
        var classes = getClassesChunk(element);
        var parentClasses = getClassesChunk(element.parentElement);
        var grandParentClasses = getClassesChunk(element.parentElement.parentElement);
        var currencies = getCurrencies(value);
        var parentCurrencies = getCurrencies(getAttribute(element.parentElement, 'innerText'));
        var grandParentCurrencies = getCurrencies(getAttribute(element.parentElement.parentElement, 'innerText'));

        addProp('tag', getNormalizedTagName(element), INT_TRUE);
        addProp('tag', 'complexity', getComplexityRate(element));
        addProp('tag',  'hasChars', getCharsCount(value) ? INT_TRUE: INT_FALSE);
        addProp('tag',  'hasDigits', getDigitsCount(value) ? INT_TRUE: INT_FALSE);
        addProp('tag',  'hasSpecials', getSpecialsCount(value) ? INT_TRUE: INT_FALSE);
        addProp('tag',  'hasSpaces', getSpacesCount(value) ? INT_TRUE: INT_FALSE);
        addProp('tag',  'uppercasePercent', getUppercasePercent(value));
        addProp('tag',  'normalizedLength', getNormalizedLength(value));
        addProp('tag',  'charsPercent', getCharsPercent(value));
        addProp('tag',  'digitsPercent', getDigitsPercent(value));
        addProp('tag',  'specialsPercent', getSpecialsPercent(value));
        addProp('tag',  'spacesPercent', getSpacesPercent(value));

        addProp('parentTag', getNormalizedTagName(element.parentElement), INT_TRUE);
        addProp('parentTag', 'complexity', getComplexityRate(element.parentElement));
        addProp('grandParentTag', getNormalizedTagName(element.parentElement.parentElement), INT_TRUE);
        addProp('grandParentTag', 'complexity', getComplexityRate(element.parentElement.parentElement));
        getChildrens(element).forEach(function(elem) {
            addProp('childTag', getNormalizedTagName(elem), INT_TRUE);
            addPropMult('childClass', getClassesChunk(elem), INT_TRUE);

        });

        addPropMult('class', classes, INT_TRUE);
        addPropMult('parentClass', parentClasses, INT_TRUE);
        addPropMult('grandParentClass', grandParentClasses, INT_TRUE);

        addPropMult('currency', currencies, INT_TRUE);
        addPropMult('parentCurrency', parentCurrencies, INT_TRUE);
        addPropMult('grandParentCurrency', grandParentCurrencies, INT_TRUE);

        addProp('tag', 'digitsToTextPercent', getDigitsToTextPercent(value));
        addProp('tag', 'spacesToTextPercent', getSpacesToTextPercent(value));
        addProp('tag', 'specialsToTextPercent', getSpecialsToTextPercent(value));
        addProp('tag', 'hasDecimal', hasDecimal(value));
        addProp('tag', 'hasLink', hasLink(value));


        addPropMult('hasSpecialChar', getSpecials(value), INT_TRUE);
        addPropMultVal('specialCharPercent', getSpecialsPercentage(value));

        addPropMultVal('tagPropertySource', VALUES_SOURCES.map(function (attr) {
            return {
                name: attr,
                value: getAttribute(element, attr) == value ? INT_TRUE: INT_FALSE
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
        }));
    }

    function addProp(prefix, name, value) {
        var propName = prefix+'_' + name;
        props[propName] = value;
    }

    function addPropMult(prefix, names, value) {
        for(var cNum=0;cNum<names.length;cNum++) {
            addProp(prefix, names[cNum], value);
        }
    }

    function addPropMultVal(prefix, namesValues) {
        for(var cNum=0;cNum<namesValues.length;cNum++) {
            addProp(prefix, namesValues[cNum].name, namesValues[cNum].value);
        }
    }

    function getComplexityRate(elem) {
        return complexityMetric.run(elem);
    }

    function getNormalizedLength(val) {
        return normalize01(val.length);;
    }

    function getUppercasePercent(val) {
        var upper = 0;
        var lower = 0;
        for(var c=0;c<val.length;c++) {
            if (val[c] == val[c].toLowerCase() && val[c] == val[c].toUpperCase()) {
                continue;
            }
            if (val[c] == val[c].toLowerCase()) {
                lower++;
            } else {
                upper++;
            }
        }
        return lower == 0 ? 1 : upper/lower;
    }

    function getCurrencies(val) {
        return val ? dic.findCurrencies(val) : [];
    }

    function getChildrens(elem) {
        return Array.prototype.slice.call(elem.children, 0);
    }

    function getAttribute(elem, attr) {
        if (attr == 'innerText') {
            return  elem.innerHTML.replace(/<\/?[^>]+>/gi, '').trim();
        }
        return elem[attr] ? elem[attr] : "";
    }

    function isAttributeNonEmpty(elem, attr) {
        return getAttribute(elem, attr) ? INT_TRUE : INT_FALSE;
    }

    function hasLink(val) {
        return val.match(/^(?:https?:|)\/\/\S+$/) == null ? INT_FALSE : INT_TRUE;
    }

    function hasDecimal(val) {
        return val.match(/\d+\.\d+/) == null ? INT_FALSE : INT_TRUE;
    }
    function getSpecialsToTextPercent(val) {
        var characters = getCharsCount(val) + getDigitsCount(val);
        var specials = getSpecialsCount(val);

        return normRate(specials, characters);
    }
    function getSpacesToTextPercent(val) {
        var characters = getCharsCount(val) + getDigitsCount(val);
        var spaces = getSpacesCount(val);

        return normRate(spaces, characters);
    }

    function getDigitsToTextPercent(val) {
        var characters = getCharsCount(val);
        var digits = getDigitsCount(val);
        return normRate(digits, characters);
    }

    function getDigitsCount(val) {
        var digits = val.match(/\d+/g);
        if (!digits) {
            return 0;
        } else {
            return digits.join('').length;
        }
    }

    function getDigitsPercent(val) {
        return normalize01(getDigitsCount(val));
    }

    function getCharsCount(val) {
        var characters = val.match(/\D+/g);
        if (!characters) {
            return 0;
        } else {
            return characters.join('').length;
        }
    }

    function getCharsPercent(val) {
        return normalize01(getCharsCount(val));
    }

    function getSpacesCount(val) {
        var spaces = val.match(/\s+/g);
        if (!spaces) {
            return 0;
        } else {
            return spaces.join('').length;
        }
    }

    function getSpacesPercent(val) {
        return normalize01(getSpacesCount(val));
    }

    function getSpecials(val) {
        var specials = val.match(/[!@#$%^&*()_+\-=\[\]{};':~`¹"\\|,.<>\/? ]/g);
        if (!specials) {
            return [];
        } else {
            return specials;
        }
    }

    function getSpecialsPercentage(val) {
        var charsLen = getCharsCount(val);
        var specials = getSpecials(val);
        if (!specials) {
            return [];
        } else {
            return Object.values(specials.reduce(function(count, char) {
                if (!count[char]) {
                    count[char] = {name: char, count: 0};
                }
                count[char].count++;
                return count;
            }, {})).map(function(count) {
                if (charsLen == 0 || charsLen <= count['count']) {
                    count['value'] = 1;
                } else {
                    count['value'] = count['count']/charsLen;
                }
                return count;
            });
        }
    }

    function getSpecialsCount(val) {
        var specials = getSpecials(val);
        if (!specials) {
            return 0;
        } else {
            return specials.filter(function(item) { return item!=" "; }).join('').length;
        }
    }

    function getSpecialsPercent(val) {
        return normalize01(getSpecialsCount(val));
    }

    function getNormalizedTagName(elem) {
        return elem.tagName.replace(/\d/g, '');
    }

    function getClassesChunk(elem) {
        var classes = elem.className.toLowerCase().split(/-|\W+|\d+/);
        if (classes) {
            return classes.flatMap(function(str) {return chunk(str, 3);}).filter(dic.isWordInDic);
        }
        return [];
    }

    function normRate(val, to) {
        if (to == 0 && val !=0) {
            return 1
        } else if (to == 0 && val ==0) {
            return 0;
        } else {
            return val < to ? val / to : 1;
        }
    }

    function chunk(str, minLen) {
        var maxLen = str.length;
        var minLen = minLen ? minLen : 1;
        var chunks = [];
        for(var length = minLen; length<=maxLen; length++) {
            for (var i = 0, charsLength = str.length; i <= charsLength - length; i += 1) {
                chunks.push(str.substring(i, i + length));
            }
        }
        return chunks;
    }

    function normalizedEditDistance(a, b) {
        a = a.toLowerCase().replace(/\s+|[!@#$%^&*()_+\-=\[\]{};':~`¹"\\|,.<>\/? ]+|\d+/g, '');
        b = b.toLowerCase().replace(/\s+|[!@#$%^&*()_+\-=\[\]{};':~`¹"\\|,.<>\/? ]+|\d+/g, '');
        if (a.indexOf(b) !== -1 || b.indexOf(a) !== -1) {
            return 1;
        }
        var distance = getEditDistance(a, b);
        if (distance==0) {
            return distance;
        }
        return 1 - (distance / Math.max(a.length, b.length, 1))
    }

    function getEditDistance(a, b){
        if(a.length == 0) return b.length;
        if(b.length == 0) return a.length;

        var matrix = [];

        // increment along the first column of each row
        var i;
        for(i = 0; i <= b.length; i++){
            matrix[i] = [i];
        }

        // increment each column in the first row
        var j;
        for(j = 0; j <= a.length; j++){
            matrix[0][j] = j;
        }

        // Fill in the rest of the matrix
        for(i = 1; i <= b.length; i++){
            for(j = 1; j <= a.length; j++){
                if(b.charAt(i-1) == a.charAt(j-1)){
                    matrix[i][j] = matrix[i-1][j-1];
                } else {
                    matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                        Math.min(matrix[i][j-1] + 1, // insertion
                            matrix[i-1][j] + 1)); // deletion
                }
            }
        }

        return matrix[b.length][a.length];
    }

    function normalize01(val) {
        return 1 - 1/(1+val);
    }
}

