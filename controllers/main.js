/**
 * Created by imsamurai on 30.11.2015.
 */
exports.MainController = function(request, response) {
    var jsdom = require("jsdom");
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
    }

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