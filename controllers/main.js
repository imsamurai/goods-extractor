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


                var options = {
                    compareRate: 0.38,
                    complexityNeigbourRate: 1,
                    complexityDeepRate: 2,
                    similarityCutoff: 90,
                    complexityCutoff: 1
                }
                var treeExtractor = new extractor.TreeExtractor(window.document.body, options);
                var extractedTree = treeExtractor.run();
                var fieldsExtractor = new extractor.FieldsExtractor(extractedTree);
                var fieldSet = fieldsExtractor.run();
                var filter = new extractor.FieldsFilter(fieldSet);
                var document = jsdom.jsdom("");
                var visualizer = new extractor.FieldVisualizer(filter.run(), document);
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
                }
                var options = {
                    compareRate: 0.38,
                    complexityNeigbourRate: 1,
                    complexityDeepRate: 2,
                    similarityCutoff: 90,
                    complexityCutoff: 1
                }
                var treeExtractor = new extractor.TreeExtractor(window.document.body, options);
                var extractedTree = treeExtractor.run();
                var fieldsExtractor = new extractor.FieldsExtractor(extractedTree);
                var fieldSet = fieldsExtractor.run();
                var filter = new extractor.FieldsFilter(fieldSet);
                var templateExtractor = new extractor.TemplateExtractor(filter.run(), new extractor.XPathExtractor(window));
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
                }
                var options = {
                    compareRate: 0.38,
                    complexityNeigbourRate: 1,
                    complexityDeepRate: 2,
                    similarityCutoff: 90,
                    complexityCutoff: 1
                }
                var treeExtractor = new extractor.TreeExtractor(window.document.body, options);
                var extractedTree = treeExtractor.run();
                var fieldsExtractor = new extractor.FieldsExtractor(extractedTree);
                var fieldSet = fieldsExtractor.run();
                var filter = new extractor.FieldsFilter(fieldSet);
                var templateExtractor = new extractor.TemplateExtractor(filter.run(), new extractor.XPathExtractor(window));
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


                var options = {
                    compareRate: 0.38,
                    complexityNeigbourRate: 1,
                    complexityDeepRate: 2,
                    similarityCutoff: 90,
                    complexityCutoff: 1
                }
                var treeExtractor = new extractor.TreeExtractor(window.document.body, options);
                var extractedTree = treeExtractor.run();
                var fieldsExtractor = new extractor.FieldsExtractor(extractedTree);
                var fieldSet = fieldsExtractor.run();
                var filter = new extractor.FieldsFilter(fieldSet);
                var document = jsdom.jsdom("");
                var visualizer = new extractor.FieldVisualizer(filter.run(), document);
                visualizer.run();
                response.send(document.documentElement.outerHTML);
            }
        });
    }
}