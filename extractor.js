/**
 * Created by imsamurai on 23.11.2015.
 */
function extractor(topElement, compareRate, complexityNeigbourRate, complexityDeepRate, similarityCutoff, complexityCutoff) {
    var extracted;

    this.run = function(show) {
        extracted = bestmatch(filter(rate(extract(topElement))));
        if (show) {
            highlight(extracted);
        }
        return extracted;
    }

    //function process(elements) {
    //    var template = {};
    //    for (var i = 0; i < elements.length - 1; i++) {
    //        for (var k = i + 1; k < elements.length; k++) {
    //            var el1 = elements[i];
    //            var el2 = elements[k];
    //        }
    //    }
    //    return weight;
    //}

    function extractFields(elem) {
        var data = [];
        if (elem.nodeName === '#text' && elem.data.trim() !== "") {
            data.push({field: elem.data.trim()});

        }

        for (var i = 0; i < elem.childNodes.length; i++) {
            var childData = extractFields(elem.childNodes[i]);
            if (childData.length > 0) {
                data = data.concat(childData);
            } else if (childData.length > 1) {
                data.push(childData);
            }
        }

        return data;
    }

    function extract(el) {
        var res = [];
        if (el.children.length > 1) {
            var items = [];
            for (var i = 0; i < el.children.length - 1; i++) {
                for (var k = i + 1; k < el.children.length; k++) {
                    var el1 = el.children[i];
                    var el2 = el.children[k];
                    var item = {
                        el1: el1,
                        el2: el2,
                        similarity: bicompare(el1, el2, 100, compareRate),
                        complexity: bicomplexity(el1, el2, complexityNeigbourRate, complexityDeepRate)
                    }
                    if (item.similarity >= similarityCutoff && item.complexity >= complexityCutoff) {
                        items.push(item)
                    }

                }
            }
            res.push({
                items: items,
                len: items.length,
                score: 0
            });
        }
        for (var i = 0; i < el.children.length; i++) {
            res = res.concat(extract(el.children[i]));
        }
        return res;

    }

    function filter(data) {
        var res = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].similarity >= similarityCutoff && data[i].complexity >= complexityCutoff) {
                res.push(data[i]);
            }
        }
        return res;
    }

    function rate(data) {
        for (var i = 0; i < data.length; i++) {
            var similarity = data[i].items.reduce(function(acc, item) {
                    return acc + item.similarity;
                }, 0) / data[i].items.length;
            var complexity = data[i].items.reduce(function(acc, item) {
                    return acc + item.complexity;
                }, 0) / data[i].items.length;
            data[i].score = data[i].len * data[i].len * data[i].len * similarity * complexity
            data[i].similarity = similarity;
            data[i].complexity = complexity;
        }
        return data;
    }

    function bestmatch(data) {
        return data.sort(function(items1, items2) {
            if(items1.score > items2.score) {
                return -1;
            } else if (items1.score < items2.score) {
                return 1;
            }
            return 0;
        })[0];
    }

    function highlight(data) {
        for (var i = 0; i < data.items.length; i++) {
            data.items[i].el1.style.background="yellow";
            data.items[i].el1.style.border="solid 5px red";
            data.items[i].el2.style.background="yellow";
            data.items[i].el2.style.border="solid 5px red";
        }
    }

    function compare(el1, el2, parent_weight, rate) {
        var weight = 0;
        if (el2 !== undefined && (el1.tagName == el2.tagName)) {
            if (el1.children.length > 0) {
                weight = parent_weight * rate;
                for (var i = 0; i < el1.children.length; i++) {
                    weight += compare(el1.children[i], el2.children[i], parent_weight * (1 - rate) / el1.children.length, rate)
                }
            } else {
                weight = parent_weight;
            }
        }
        return weight;
    }

    function bicompare(el1, el2, parent_weight, rate) {
        return (compare(el1, el2, parent_weight, rate) + compare(el2, el1, parent_weight, rate)) / 2;
    }

    function complexity(el, rateNeigbour, rateDeep) {
        var weight = 0;
        if (el.children.length > 0) {
            weight = rateDeep + el.children.length * rateNeigbour;
            for (var i = 0; i < el.children.length; i++) {
                weight += complexity(el.children[i], rateNeigbour, rateDeep)
            }
        }
        return weight;
    }

    function bicomplexity(el1, el2, rateNeigbour, rateDeep) {
        return (complexity(el1, rateNeigbour, rateDeep) + complexity(el2, rateNeigbour, rateDeep)) / 2;
    }
}

var extr = new extractor(document.body, 0.38, 1, 2, 90, 1);
console.log(extr.run(true));