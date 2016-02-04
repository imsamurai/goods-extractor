/**
 * Created by imsamurai on 30.11.2015.
 */
exports.MainController = function(request, response) {
    var jsdom = require("jsdom");
    //var wgxpath = require('wgxpath');

    var extractor = require("../component/extractor.js");

    this.extract_fields_by_url = function() {
        var url = request.body.url;
        jsdom.env({
            url: url,
            //features: {
            //    FetchExternalResources: ["script"],
            //    ProcessExternalResources: ["script"],
            //    SkipExternalResources: false
            //},
            done: function(e, window) {
                var document = jsdom.jsdom("");
                var visualizer = new extractor.FieldVisualizer(extract(window), document);
                visualizer.run();
                response.send(document.documentElement.outerHTML);
            }
        });
    };

    this.extract_template_by_url = function() {
        var url = request.body.url;
        var fs = require("fs");
        jsdom.env({
            url: url,
            src: [
                fs.readFileSync(__dirname+'/../lib/utility/jquery-2.2.0.min.js', {encoding:'utf8'}),
                fs.readFileSync(__dirname+'/../lib/utility/xpath/xpathrefine.js', {encoding:'utf8'})
            ],
            //features: {
            //    FetchExternalResources: ["script"],
            //    ProcessExternalResources: ["script"],
            //    SkipExternalResources: false
            //},
            done: function(e, window) {
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

    this.extract_template_by_html = function() {
        var html = request.body;
        var fs = require("fs");
        jsdom.env({
            html: html,
            src: [
                fs.readFileSync(__dirname+'/../lib/utility/jquery-2.2.0.min.js', {encoding:'utf8'}),
                fs.readFileSync(__dirname+'/../lib/utility/xpath/xpathrefine.js', {encoding:'utf8'})
            ],
            //features: {
            //    FetchExternalResources: ["script"],
            //    ProcessExternalResources: ["script"],
            //    SkipExternalResources: false
            //},
            done: function(e, window) {
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

    this.extract_fields_by_html = function() {
        var html = request.body;
        jsdom.env({
            html: html,
            //features: {
            //    FetchExternalResources: ["script"],
            //    ProcessExternalResources: ["script"],
            //    SkipExternalResources: false
            //},
            done: function(e, window) {
                var document = jsdom.jsdom("");
                var visualizer = new extractor.FieldVisualizer(extract(window), document);
                visualizer.run();
                response.send(document.documentElement.outerHTML);
            }
        });
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
        var likelyThreshold = 0.9;
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
            }}
        var treeExtractor = new extractor.TreeExtractor(window.document.body, options);
        var extractedTree = treeExtractor.run();
            var fieldsExtractor = new extractor.FieldsExtractor(extractedTree, new extractor.FieldBuilder(new extractor.FieldValueExtractor(), new extractor.FieldsTaggerProduct(network, extractor.ProductModel)));
        var fieldSet = fieldsExtractor.run();
        var filter = new extractor.FieldsFilter(fieldSet);
        return filter.run();
    }
}