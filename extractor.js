/**
 * Created by imsamurai on 23.11.2015.
 */
function extractor(options) {
    var topElement = options.topElement,
        compareRate = options.compareRate,
        complexityNeigbourRate = options.complexityNeigbourRate,
        complexityDeepRate = options.complexityDeepRate,
        similarityCutoff = options.similarityCutoff,
        complexityCutoff = options.complexityCutoff;

    var extracted;

    this.run = function (show) {
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

    this.extractFields = function (elems) {
        var data = [];
        var seed = simplifySeed(makeSeed(elems));

        console.log("seed:");
        console.log(seed);//throw new Exception;
        console.log("updated seed:");
        seed = updateSeed(seed, elems);
        console.log(seed);
        seed = setFieldsNumber(seed);
        //data.push(extractFieldsOne(seed, elem));
        console.log(seed);
        return fieldsExtractor(seed, elems);
    }

    function fieldsExtractor(seed, elems) {
        var data = [];
        for (var i = 0; i < elems.length; i++) {
            data.push(fieldsExtractorOne(seed, elems[i].children));
        }
        return data;
    }

    function fieldsExtractorOne(seed, elems) {
        var data = [];
        //if (!elems) {
        //    return data;
        //}
        for (var k = 0; k < seed.length; k++) {
            var items = findElBySeedPart(elems, seed[k]);
            var value = "";
            if (items.length > 1) {
                value = [];
                for (var e = 0; e < items.length; e++) {
                    var v = simpleFieldExtractor(items[e]);
                    if (v.length > 0) {
                        value.push(v);
                    }
                }

                if (value.length > 0) {
                    data.push({
                        seed: seed[k],
                        field: seed[k].field,
                        items: items,
                        elems: elems,
                        sel: seed[k].el,
                        value: value
                    });
                }
            }
            else if (items.length === 1) {
                value = simpleFieldExtractor(items[0]);
                if (value instanceof Array) {
                    for(var v = 0;v<value.length;v++) {
                        if (value[v] && value[v].length > 0) {
                            data.push({
                                seed: seed[k],
                                field: seed[k].field + '_' + v,
                                items: items,
                                elems: elems,
                                sel: seed[k].el,
                                value: value[v]
                            });
                        }
                    }
                } else {
                    if (value.length > 0) {
                        data.push({
                            seed: seed[k],
                            field: seed[k].field,
                            items: items,
                            elems: elems,
                            sel: seed[k].el,
                            value: value
                        });
                    }
                }

            }


            for (var e = 0; e < items.length; e++) {
                data = data.concat(fieldsExtractorOne(seed[k].children, items[e].children));
            }


        }
        return data;
    }

    function simpleFieldExtractor(elem) {
        if (!elem) {
            return '';
        } else if (elem.tagName === 'IMG') {
            return elem.src;
        } else if (elem.tagName === 'A') {
            return [elem.href, simpleTextFieldExtractor(elem)];
        } else {
            return simpleTextFieldExtractor(elem);
        }
    }

    function simpleTextFieldExtractor(elem) {
        var text = [];
        var cn = elem.childNodes;
        for (var i = 0; i < cn.length; i++) {
            if (cn[i].nodeName === '#text') {
                text.push(cn[i].nodeValue.trim());
            }
        }
        return text.join(' ').trim();
    }

    function setFieldsNumber(seed) {
        var fieldNumber = 1;

        var sfn = function (seed) {
            for (var i = 0; i < seed.length; i++) {
                seed[i]['field'] = fieldNumber++;
                seed[i].children = sfn(seed[i].children);
            }
            return seed;
        }
        return sfn(seed);
    }

    function makeSeed(elems) {
        var seed = [];
        var seedCandidate = elems[0];

        return makeSeedIteration(seed, seedCandidate.children);
    }

    function simplifySeed(seed) {
        var s =0;
        while (s<seed.length) {
            if (!seed[s]) {
                continue;
            }
            var ai = alignIndex(seed, seed[s]);
            if (ai!==s) {
                seed[ai] = updateSeedOne(seed[ai], seed[s]);
                seed = seed.slice(0,s-1).concat(seed.slice(s))
            } else {
                s++;
            }

            seed[ai].children = simplifySeed(seed[ai].children);
        }
        return seed;
    }

    function makeSeedIteration(seed, elems) {
        for (var i = 0; i < elems.length; i++) {
            var el = elems[i];
            seed.push({
                el: el,
                attributes: getAttributes(el),
                children: makeSeedIteration([], el.children)
            });
        }
        return seed;
    }

    function updateSeed(seed, elems) {
        for (var i = 1; i < elems.length; i++) {
            seed = updateSeedOne(seed, makeSeedIteration([], elems[i].children))
        }
        return seed;
    }

    function alignIndex(seed, seedPart) {
        console.log('-----align seed-----');
        console.log(seed);
        console.log('-----align seed part-----');
        console.log(seedPart);
        if (!seedPart) {
            return -1;
        }
        for (var p = 0; p < seed.length; p++) {
            if (seed[p].attributes.equals(seedPart.attributes)) {
                return p;
            }
        }
        return -1;
    }

    function findElBySeedPart(elems, seedPart) {
        var items = [];
        for (var p = 0; p < elems.length; p++) {
            if (seedPart.attributes.equals(getAttributes(elems[p]))) {
                items.push(elems[p]);
            }
        }
        return items;
    }

    function updateSeedOne(seed1, seed2) {
        console.log('update seed');
        console.log(seed1);
        console.log(seed2);
        //if (!seed1) {
        //    console.log('no seed1');
        //    seed1 = seed2;
        //} else {
        //    console.log('process seed2');
        for (var pos = 0; pos < seed2.length; pos++) {

            var alignPos = alignIndex(seed1, seed2[pos]);
            if (alignPos === -1) {
                var bottomPos = alignIndex(seed1, seed2[pos - 1]);
                console.log('bottomPos (seed1): ' + bottomPos);
                var upperPos = alignIndex(seed2, seed1[bottomPos + 1]);
                console.log('upperPos (seed2): ' + upperPos);

                //check items between pos and upperPos
                var validItems = true;
                for (var i = pos + 1; i < upperPos; i++) {
                    if (alignIndex(seed1, seed2[i]) !== -1) {
                        validItems = false;
                    }
                }
                //if (bottomPos===-1 && upperPos === -1 && seed1.length === 0) {
                //    console.log('can\'t add');
                //    console.log(seed1);
                //} else
                if (validItems && bottomPos === -1 && upperPos !== -1) {
                    console.log('-----add bottom');
                    seed1 = seed2.slice(pos, upperPos).concat(seed1);
                } else if (validItems && upperPos === -1 && bottomPos !== -1) {
                    console.log('-----add upper');
                    seed1 = seed1.concat(seed2.slice(pos, pos + 1));
                } else if (validItems && (bottomPos !== -1 || upperPos !== -1 || seed1.length === 0)) {
                    console.log('-----add middle');
                    console.log(seed1);
                    seed1 = seed1.slice(0, bottomPos + 1).concat(seed2.slice(pos, upperPos === -1 ? undefined : upperPos)).concat(seed1.slice(bottomPos + 1));
                    console.log(seed1);
                }
                if (validItems) {
                    console.log('seed1[bottomPos + 1]');
                    if (seed1[bottomPos + 1]) console.log(seed1[bottomPos + 1].el);
                    console.log('seed1[bottomPos]');
                    if (seed1[bottomPos]) console.log(seed1[bottomPos].el);
                    console.log('seed2[pos]');
                    if (seed2[pos]) console.log(seed2[pos].el);
                    console.log('seed2[upperPos]');
                    if (seed2[upperPos]) console.log(seed2[upperPos].el);
                }
                console.log('validItems: ' + validItems);
            } else {
                console.log('-----child process');
                seed1[alignPos].children = updateSeedOne(seed1[alignPos].children, seed2[pos].children);
            }
            console.log('alignPos (seed1): ' + alignPos);
            console.log('pos (seed2): ' + pos);
            console.log('--------------------------------');
        }
        //}
        return seed1;
    }

    //function updateSeedOne(seed, elem) {
    //    var elems = elem.children;
    //    //var maxlen = seed.length;
    //    var pos=0;
    //    while (seed[pos] && elems[pos]) {
    //        if (!seed[pos].attributes.equals(getAttributes(elems[pos]))) {
    //            //find bottom align elems[pos] in seed
    //            var bPos = pos;
    //            do {
    //                bPos--;
    //            } while(seed[bPos] && elems[pos-1] && !seed[bPos].attributes.equals(getAttributes(elems[pos-1])));
    //            //find upper align seed[bPos+1] in elems[>pos]
    //            var uPos = pos;
    //            var upperFound = false;
    //            var upperBreak = false;
    //            if (seed[bPos+1]) {
    //                while(!upperBreak && elems[uPos+1]) {
    //                    uPos++;
    //                    //ok found
    //                    if (seed[bPos+1].attributes.equals(getAttributes(elems[uPos]))) {
    //                        upperFound = true;
    //                        upperBreak = true;
    //                    }
    //                    //not found - check if it present in seed
    //                    else {
    //                        var tempPos = 0;
    //                        do {
    //                            //present in seed, can't align
    //                            if (seed[tempPos].attributes.equals(getAttributes(elems[uPos]))) {
    //                                upperFound = false;
    //                                upperBreak = true;
    //                                break;
    //                            }
    //                            tempPos++;
    //                        } while(seed[tempPos]);
    //                    }
    //                }
    //            } else {
    //                uPos++;
    //            }
    //
    //            if (upperFound ) {
    //
    //                var seedPart = makeSeedIteration([], Array.prototype.slice.call(elems, pos, uPos));
    //                console.log("seedBefore");
    //                console.log(seed);
    //                console.log(seedPart);
    //                console.log("pos: "+pos+" bPos:"+bPos+" uPos:"+uPos);
    //                console.log("--------------------------");
    //                if (!seed[bPos]) {
    //                    seed = seedPart.concat(seed);
    //                } else {
    //                    seed = seed.slice(0, bPos).concat(seedPart).concat(seed.slice(bPos))
    //                }
    //                console.log("seedAfter");
    //                console.log(seed);
    //
    //                //pos = uPos-1;
    //            }
    //
    //        }
    //        if (seed[pos] && seed[pos].attributes.equals(getAttributes(elems[pos]))) {
    //            for (var i = 0; i < seed[pos].children.length; i++) {
    //                seed[pos].children[i] = updateSeedOne(seed[pos].children[i], elems[pos])
    //            }
    //        }
    //        pos++;
    //    }
    //    return seed;
    //}


    function extractFieldsOne(seed, elem) {
        var data = [];
        for (var i = 0; i < seed.children.length; i++) {
            var seedCh = seed.children[i];
            var elemCh = elem.children[i];
            if (!elemCh) {
                continue;
            }
            var bcomplex = bicomplexity(seedCh, elemCh, complexityNeigbourRate, complexityDeepRate);
            if (bcomplex > 0) {
                data = data.concat(extractFieldsOne(seedCh, elemCh));
                continue;
            }
            //console.log("-------------------------");
            //console.log("Catch field:");
            data.push({
                field: data.length + 1,
                element: elemCh,
                text: elemCh.innerText.trim(),
                href: elemCh.href,
                src: elemCh.src,
                title: elemCh.title
            });
            //console.log(item);
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
                elements: elements = items.flatMap(function (item) {
                    return [item.el1, item.el2];
                }).unique(),
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
            var similarity = data[i].items.reduce(function (acc, item) {
                    return acc + item.similarity;
                }, 0) / data[i].items.length;
            var complexity = data[i].items.reduce(function (acc, item) {
                    return acc + item.complexity;
                }, 0) / data[i].items.length;
            data[i].score = data[i].len * data[i].len * data[i].len * similarity * complexity
            data[i].similarity = similarity;
            data[i].complexity = complexity;
        }
        return data;
    }

    function bestmatch(data) {
        return data.sort(function (items1, items2) {
            if (items1.score > items2.score) {
                return -1;
            } else if (items1.score < items2.score) {
                return 1;
            }
            return 0;
        })[0];
    }

    function highlight(data) {
        for (var i = 0; i < data.elements.length; i++) {
            data.items[i].el1.style.background = "yellow";
            data.items[i].el1.style.border = "solid 5px red";
            data.items[i].el2.style.background = "yellow";
            data.items[i].el2.style.border = "solid 5px red";
        }
    }

    function normalizeFields(fieldset) {
        var fields = [];
        for (var fs = 0; fs < fieldset.length; fs++) {
            for (var f = 0; f < fieldset[fs].length; f++) {
                fields.push(fieldset[fs][f].field);
            }
        }

        fields = fields.unique();
        var data = [fields];
        for (var fs = 0; fs < fieldset.length; fs++) {
            var record = [];
            for (var fn = 0; fn < fields.length; fn++) {
                var value = "";
                for (var f = 0; f < fieldset[fs].length; f++) {
                    if (fieldset[fs][f].field === fields[fn]) {
                        value = fieldset[fs][f].value;
                        break;
                    }
                }
                record.push(value);
            }
            data.push(record);

        }
        console.log(data);
        return data;
    }

    this.showFieldsTable = function (fieldset) {
        var data = normalizeFields(fieldset);
        var table = document.createElement('table');

        var tr = document.createElement('tr');
        var th = document.createElement('th');
        th.innerHTML = '#';
        tr.appendChild(th);
        for (var h = 0; h < data[0].length; h++) {
            var th = document.createElement('th');
            th.innerHTML = 'field #' + data[0][h];
            tr.appendChild(th);

        }
        table.appendChild(tr);
        for (var r = 1; r < data.length; r++) {
            var tr = document.createElement('tr');
            var td = document.createElement('td');
            td.innerHTML = r;
            td.style.border="solid 1px black";
            td.style.padding="10px";
            tr.appendChild(td);
            for (var f = 0; f < data[r].length; f++) {
                var td = document.createElement('td');
                td.innerHTML = data[r][f];
                td.style.border="solid 1px black";
                td.style.padding="10px";
                tr.appendChild(td);
            }

            table.appendChild(tr);
        }
        document.body.appendChild(table);
        //console.log(data);
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

    function deepcompare(elem1, elem2) {
        return getAttributes(elem1).equals(getAttributes(elem2));
    }
}

Array.prototype.flatMap = function (lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
};
Array.prototype.unique = function () {
    var a = [];
    for (var i = 0, l = this.length; i < l; i++)
        if (a.indexOf(this[i]) === -1)
            a.push(this[i]);
    return a;
}

function getAttributes(elem) {
    var atts = elem.attributes;
    var attr = {};
    for (var i = 0; i < atts.length; i++) {
        if (atts[i].nodeName === 'class') {
            attr[atts[i].nodeName] = atts[i].nodeValue;
        }
    }
    return attr.sortByKeys();
}

Object.prototype.equals = function (iObj) {
    if (this.constructor !== iObj.constructor)
        return false;
    var aMemberCount = 0;
    for (var a in this) {
        if (!this.hasOwnProperty(a))
            continue;
        if (typeof this[a] === 'object' && typeof iObj[a] === 'object' ? !this[a].equals(iObj[a]) : this[a] !== iObj[a])
            return false;
        ++aMemberCount;
    }
    for (var a in iObj)
        if (iObj.hasOwnProperty(a))
            --aMemberCount;
    return aMemberCount ? false : true;
}

Object.prototype.sortByKeys = function () {
    var that = this;
    return Object.keys(this).sort().reduce(function (result, key) {
        result[key] = that[key];
        return result;
    }, {});
}