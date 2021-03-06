/**
 * Created by imsamurai on 19.01.2016.
 */

function ExtractorComponent() {
    var extRequire = require(__dirname + '/../utility/ext_require.js');
    extRequire(__dirname + "/../lib2/utility/lang/extensions.js");
    //var brain = require("brain");
    extRequire(__dirname + "/../lib2/neural/brain-0.6.3.js");
    extRequire(__dirname + "/../lib2/metric/TreeComparatorDeep.js");
    extRequire(__dirname + "/../lib2/tree/Tree.js");
    extRequire(__dirname + "/../lib2/tree/TreeNode.js");
    extRequire(__dirname + "/../lib2/tree/TreeNodeEmpty.js");
    extRequire(__dirname + "/../lib2/tree/TreeBuilder.js");
    extRequire(__dirname + "/../lib2/extractor/RecordsExtractor.js");
    extRequire(__dirname + "/../lib2/record/RecordCollection.js");
    extRequire(__dirname + "/../lib2/record/Record.js");
    extRequire(__dirname + "/../lib2/metric/TreeComparatorBi.js");
    extRequire(__dirname + "/../lib2/metric/TreeComparator.js");
    extRequire(__dirname + "/../lib2/metric/TreeComparatorFull.js");
    extRequire(__dirname + "/../lib2/metric/TreeComparatorFullBi.js");
    extRequire(__dirname + "/../lib2/metric/TreeComplexity.js");
    extRequire(__dirname + "/../lib2/metric/TreeComplexityBi.js");
    extRequire(__dirname + "/../lib2/metric/RecordsMetrics.js");
    extRequire(__dirname + "/../lib2/field/Field.js");
    extRequire(__dirname + "/../lib2/field/FieldVariant.js");
    extRequire(__dirname + "/../lib2/field/FieldCollection.js");
    extRequire(__dirname + "/../lib2/extractor/FieldsExtractor.js");
    extRequire(__dirname + "/../lib2/tagger/FieldsTagger.js");
    extRequire(__dirname + "/../lib2/field/FieldGroup.js");
    extRequire(__dirname + "/../lib2/extractor/Extractor.js");
    extRequire(__dirname + "/../lib2/extractor/FieldValueExtractor.js");
    extRequire(__dirname + "/../lib2/data/neural/dict.js");
    extRequire(__dirname + "/../lib2/data/neural/product.js");
    extRequire(__dirname + "/../lib2/neural/model/ProductModel.js");
    extRequire(__dirname + "/../lib2/metric/FieldsMetrics.js");
    extRequire(__dirname + "/../lib2/output/FieldOutputHTML.js");
    extRequire(__dirname + "/../lib2/output/FieldOutputTRTemplate.js");
    extRequire(__dirname + "/../lib2/extractor/XpathExtractor.js");

    extRequire(__dirname + "/../lib2/xpath/XPathAttr.js");
    extRequire(__dirname + "/../lib2/xpath/XPathEmptyNode.js");
    extRequire(__dirname + "/../lib2/xpath/XPathNode.js");
    extRequire(__dirname + "/../lib2/xpath/XPathParser.js");

    extRequire(__dirname + "/../lib2/utility/Cache.js");

    var Entities = require('html-entities').AllHtmlEntities;
    var entities = new Entities();

    function getInnerText(elem) {
        return entities.decode(elem.innerHTML.replace(/<\/?[^>]+>/gi, '').replace(/\s{2,}/gi, ' ')).trim();
    }

    this.extractFields = function (window, fieldCollections) {
        fieldCollections = fieldCollections ? fieldCollections : this.extract(window);
        var fieldOutputHTML = new FieldOutputHTML();

        return '<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><body>' + fieldCollections.slice(0, 1).map(function (fieldCollection) {
                return fieldOutputHTML.run(fieldCollection);
            }).join('') + '</body></html>';
    };

    this.extractTemplate = function (window, fieldCollections) {
        fieldCollections = fieldCollections ? fieldCollections : this.extract(window);
        var fieldOutputTRTemplate = new FieldOutputTRTemplate(new XpathExtractor(window.XPathRefine));

        return fieldCollections.slice(0, 1).map(function (fieldCollection) {
            return fieldOutputTRTemplate.run(fieldCollection);
        })[0];
    };

    this.trainNet = function (data) {
        var neuralNet = new brain.NeuralNetwork();
        neuralNet.train(data, {
            errorThresh: 0.000002,  // error threshold to reach
            //errorThresh: 0.02,  // error threshold to reach
            iterations: 20000,   // maximum training iterations
            log: true,           // console.log() progress periodically
            logPeriod: 1,       // number of iterations between logging
            learningRate: 0.3    // learning rate
        });
        return neuralNet;
    }

    this.extract = function (window) {
        var compareRate = 0.38;
        var compareCutoff = 0.9;
        var findLikeCompareCutoff = 0.9;
        var alignIndexCompareCutoff = 0.9;
        var complexityRateNeighbour = 1;
        var complexityRateDeep = 2;
        var complexityCutoff = 0.51;
        var recordRateCutoff = 0.7;
        var recordSeedRateCutoff = 0.4;
        var fieldTaggerCutoff = 0.7;
        var fieldCutoff = 0.7;
        var fieldMetricsCutoff = 0.7;

        var cacheCompare = new Cache();

        var treeBuilder = new TreeBuilder(window.document.body, new TreeComparatorFullBi(compareRate, alignIndexCompareCutoff, cacheCompare), new TreeComparatorFullBi(compareRate, findLikeCompareCutoff, cacheCompare));
        var tree = treeBuilder.build();

        var metricRate = new RecordsMetrics(new TreeComparatorFullBi(compareRate, compareCutoff, cacheCompare), new TreeComplexityBi(complexityRateNeighbour, complexityRateDeep, complexityCutoff), recordRateCutoff);
        var metricSeedRate = new RecordsMetrics(new TreeComparatorFullBi(compareRate, 0, cacheCompare), new TreeComplexityBi(complexityRateNeighbour, complexityRateDeep, 0), recordSeedRateCutoff);
        var recordsExtractor = new RecordsExtractor(metricRate, metricSeedRate);


        var neuralNet = new brain.NeuralNetwork();
        neuralNet.fromJSON(getProductNeural());
        var productModel = new ProductModel(new Dict(), new TreeComplexity(complexityRateNeighbour, complexityRateDeep, complexityCutoff));

        var fieldsTagger = new FieldsTagger(neuralNet, productModel, fieldTaggerCutoff, fieldCutoff);

        var fieldValueExtractor = new FieldValueExtractor();
        var fieldMetrics = new FieldsMetrics(fieldMetricsCutoff);
        var fieldsExtractor = new FieldsExtractor(fieldValueExtractor, fieldsTagger, fieldMetrics, fieldCutoff);

        var extractor = new Extractor(recordsExtractor, fieldsExtractor)
        var fieldCollections = extractor.run(tree);
        return fieldCollections;
    }

    this.makeExtractPropsCallback = function (window, modelName) {
        var model = eval("new " + modelName + "(new Dict());");
        return function (selector, attribute, labels) {
            var data = [];
            var elements = window.jQuery(selector);
            for (var elNum = 0; elNum < elements.length; elNum++) {
                var element = elements[elNum];
                var value;
                if (attribute === 'innerText') {
                    value = getInnerText(element);
                } else if (attribute.indexOf('data-') === 0) {
                    value = window.jQuery(element).data(attribute.substr(5));
                } else {
                    value = window.jQuery(element).attr(attribute);
                }
                if (!value || !value.trim()) {
                    console.warn('no or empty attr ' + attribute + ' for ' + selector);
                    continue;
                }


                data.push(model.getLabeledSample(element, value, labels));
            }
            return data;
        }
    }

    this.extractClassesNorm = function (window, selector) {
        return getClassesNorm(Array.prototype.slice.call(window.jQuery(selector)), []).unique();
    }

    function getClassesNorm(elems, classesAcc) {
        if (elems.length == 0) {
            return classesAcc;
        }
        var classes = elems.flatMap(function (elem) {
            return elem.className.toUpperCase().replace(/\d+/g, '').trim().split(/(?:\s+|-|_)/g);
        }).filter(function(cl) {
            return cl && cl.length >= 3;
        });
        var childrens = elems.flatMap(function(elem) {
            return Array.prototype.slice.call(elem.children);
        });
        return getClassesNorm(childrens, classesAcc.concat(classes));
    }
}

module.exports = new ExtractorComponent;