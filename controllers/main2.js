/**
 * Created by imsamurai on 30.11.2015.
 */
exports.MainController = function (request, response) {
    var jsdom = require("jsdom");
    var extRequire = require(__dirname+'/../utility/ext_require.js');
    extRequire(__dirname+"/../lib2/utility/lang/extensions.js");
    var Tree = require(__dirname+"/../lib2/tree/Tree.js");
    var TreeNode = require(__dirname+"/../lib2/tree/TreeNode.js");
    var TreeNodeEmpty = require(__dirname+"/../lib2/tree/TreeNodeEmpty.js");
    var TreeBuilder = require(__dirname+"/../lib2/tree/TreeBuilder.js");
    var RecordsExtractor = require(__dirname+"/../lib2/extractor/RecordsExtractor.js");
    var RecordCollection = require(__dirname+"/../lib2/record/RecordCollection.js");
    var Record = require(__dirname+"/../lib2/record/Record.js");
    var TreeComparatorBi = require(__dirname+"/../lib2/metric/TreeComparatorBi.js");
    var TreeComparator = require(__dirname+"/../lib2/metric/TreeComparator.js");
    var TreeComparatorDeep = require(__dirname+"/../lib2/metric/TreeComparatorDeep.js");
    var TreeComplexity = require(__dirname+"/../lib2/metric/TreeComplexity.js");
    var TreeComplexityBi = require(__dirname+"/../lib2/metric/TreeComplexityBi.js");
    var RecordsMetrics = require(__dirname+"/../lib2/metric/RecordsMetrics.js");
    var Field = require(__dirname+"/../lib2/field/Field.js");
    var FieldCollection = require(__dirname+"/../lib2/field/FieldCollection.js");
    var FieldsExtractor = require(__dirname+"/../lib2/extractor/FieldsExtractor.js");
    var FieldsTagger = require(__dirname+"/../lib2/tagger/FieldsTagger.js");
    var FieldGroup = require(__dirname+"/../lib2/field/FieldGroup.js");
    var Extractor = require(__dirname+"/../lib2/extractor/Extractor.js");
    var FieldValueExtractor = require(__dirname+"/../lib2/extractor/FieldValueExtractor.js");
    var x = require(__dirname+"/../lib2/neural/brain-0.6.3.js");
    var x = require(__dirname+"/../lib2/data/neural/dict.js");
    var x = require(__dirname+"/../lib2/data/neural/product.js");
    var x = require(__dirname+"/../lib2/neural/model/ProductModel.js");
    var x = require(__dirname+"/../lib2/metric/FieldsMetrics.js");
    var x = require(__dirname+"/../lib2/output/FieldOutputHTML.js");
    var x = require(__dirname+"/../lib2/output/FieldOutputTRTemplate.js");
    var x = require(__dirname+"/../lib2/utility/jquery-2.2.0.min.js");
    var x = require(__dirname+"/../lib2/utility/xpath/xpathrefine.js");
    var x = require(__dirname+"/../lib2/extractor/XpathExtractor.js");
    //var wgxpath = require('wgxpath');

    var extractor = require(__dirname+"/../component/extractor.js");

    this.extract_fields_by_url = function () {
        var url = request.body.url;
        makeAndProcessDOM({
            url: url,
            //features: {
            //    FetchExternalResources: ["script"],
            //    ProcessExternalResources: ["script"],
            //    SkipExternalResources: false
            //},
            done: function (e, window) {
                var document = jsdom.jsdom("");
                var visualizer = new extractor.FieldVisualizer(extract(window), document);
                visualizer.run();
                response.send(document.documentElement.outerHTML);
            }
        });
    };

    this.extract_template_by_url = function () {
        var url = request.body.url;
        var fs = require("fs");
        makeAndProcessDOM({
            url: url,
            src: [
                fs.readFileSync(__dirname + '/../lib/utility/jquery-2.2.0.min.js', {encoding: 'utf8'}),
                fs.readFileSync(__dirname + '/../lib/utility/xpath/xpathrefine.js', {encoding: 'utf8'})
            ],
            //features: {
            //    FetchExternalResources: ["script"],
            //    ProcessExternalResources: ["script"],
            //    SkipExternalResources: false
            //},
            done: function (e, window) {
                //wgxpath.install(window);
                //TODO: find perfomance problem
                window.document.evaluate = function (expressionString, contextNode, resolver, type, result) {
                    //var expression = window.document.createExpression(expressionString, resolver);
                    //return expression.evaluate(contextNode,type, result);
                    return "";
                };
                var templateExtractor = new extractor.TemplateExtractor(extract(window), new extractor.XPathExtractor(window));
                response.send(templateExtractor.run());
            }
        });
    };

    this.extract_template_by_html = function () {
        var html = request.body;
        var fs = require("fs");
        makeAndProcessDOM({
            html: html,
            src: [
                fs.readFileSync(__dirname + '/../lib/utility/jquery-2.2.0.min.js', {encoding: 'utf8'}),
                fs.readFileSync(__dirname + '/../lib/utility/xpath/xpathrefine.js', {encoding: 'utf8'})
            ],
            //features: {
            //    FetchExternalResources: ["script"],
            //    ProcessExternalResources: ["script"],
            //    SkipExternalResources: false
            //},
            done: function (e, window) {
                //wgxpath.install(window);
                //TODO: find perfomance problem
                window.document.evaluate = function (expressionString, contextNode, resolver, type, result) {
                    //var expression = window.document.createExpression(expressionString, resolver);
                    //return expression.evaluate(contextNode,type, result);
                    return "";
                };
                var templateExtractor = new extractor.TemplateExtractor(extract(window), new extractor.XPathExtractor(window));
                response.send(templateExtractor.run());
            }
        });
    };

    this.extract_fields_by_html = function () {
        var html = request.body;
        makeAndProcessDOM({
            html: html,
            //features: {
            //    FetchExternalResources: ["script"],
            //    ProcessExternalResources: ["script"],
            //    SkipExternalResources: false
            //},
            done: function (e, window) {
                var document = jsdom.jsdom("");
                var visualizer = new extractor.FieldVisualizer(extract(window), document);
                visualizer.run();
                response.send(document.documentElement.outerHTML);
            }
        });
    };

    this.learn_fields = function () {
        var opt = request.body;
        var fs = require("fs");
        var net = new extractor.brain.NeuralNetwork();
        net.fromJSON(extractor.getProductNeural());

        function extractProps(elements, attribute, labels) {
            var dict = extractor.Dict;
            var data = [];
            for (var elNum = 0; elNum < elements.length; elNum++) {
                var element = elements[elNum];
                if (attribute == 'innerText') {
                    var value = element.innerHTML.replace(/<\/?[^>]+>/gi, '').trim();
                } else {
                    var value = element[attribute];
                }
                if (!value || !value.trim()) {
                    console.warn('no attr ' + attribute + ' for #' + elNum);
                    //console.warn(element);
                    continue;
                }

                var model = new extractor.ProductModel(element, value, dict);

                data.push(model.getLabeledSample(labels));
            }
            return data;
        };

        var trainData = [];
        var sitesCounter = opt.length;

        function trainAndSave() {
            if (--sitesCounter > 0) {
                return;
            }

            console.info('train net');
            net.train(trainData, {
                errorThresh: 0.000002,  // error threshold to reach
                //errorThresh: 0.02,  // error threshold to reach
                iterations: 20000,   // maximum training iterations
                log: true,           // console.log() progress periodically
                logPeriod: 1,       // number of iterations between logging
                learningRate: 0.3    // learning rate
            });

            console.info('write net');
            fs.writeFile(__dirname + '/../lib/data/neural/product.js', 'function getProductNeural() { return ' + JSON.stringify(net.toJSON()) + ';}', function (err) {
                if (err) {
                    console.error('Network not saved!');
                    console.error(err);
                } else {
                    console.log('Network saved!');
                }
                response.send('ok');
            });

            //response.send('ok');
        }

        for (var n = 0; n < opt.length; n++) {
            var site = opt[n];
            console.info('got site');
            console.info(site);
            jsdom.env({
                url: site.url,
                src: [
                    fs.readFileSync(__dirname + '/../lib/utility/jquery-2.2.0.min.js', {encoding: 'utf8'})
                ],
                features: {
                    FetchExternalResources: ["script"],
                    ProcessExternalResources: ["script"],
                    SkipExternalResources: false
                },
                done: function (e, window) {
                    console.info('process site');
                    for (var i = 0; i < site.data.length; i++) {
                        var rule = site.data[i];
                        console.info('rule');
                        console.info(rule);

                        var props = extractProps(window.$(rule.selector), rule.attribute, rule.labels);
                        console.info('get props');
                        //console.info(props);
                        trainData = trainData.concat(props);
                    }
                    window.close();
                    trainAndSave();
                }
            });
        }
        //response.send('ok');
    };

    function makeAndProcessDOM(params) {
        //params.features= {
        //        FetchExternalResources: ["script"],
        //        ProcessExternalResources: ["script"],
        //        SkipExternalResources: false
        //    };
        jsdom.env(params);
    }

    function extract(window) {
        var net = new extractor.brain.NeuralNetwork();
        net.fromJSON(extractor.getProductNeural());
        var options = {
            compareRate: 0.38,
            complexityNeigbourRate: 1,
            complexityDeepRate: 2,
            similarityCutoff: 90,
            complexityCutoff: 1
        }
        var likelyThreshold = 0.1;
        var network = {
            net: net,
            dic: extractor.Dict,
            likely: function (input) {
                var output = net.run(input);
                var maxProp = null;
                var maxValue = -1;
                for (var prop in output) if (output.hasOwnProperty(prop)) {
                    var value = output[prop];
                    if (value > maxValue) {
                        maxProp = prop;
                        maxValue = value
                    }
                }
                if (output[maxProp] >= likelyThreshold) {
                    return [maxProp, output[maxProp]];
                }
                return false;
            }
        }
        var treeExtractor = new extractor.TreeExtractor(window.document.body, options);
        var candidates = treeExtractor.run();
        var fieldsExtractor = new extractor.FieldsExtractor(candidates, new extractor.FieldBuilder(new extractor.FieldValueExtractor(), new extractor.FieldsTaggerProduct(network, extractor.ProductModel)));
        var fieldSet = fieldsExtractor.run();
        var filter = new extractor.FieldsFilter(fieldSet);
        return filter.run();
    }
}