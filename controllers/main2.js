/**
 * Created by imsamurai on 30.11.2015.
 */
exports.MainController = function (request, response) {
    var jsdom = require("jsdom");
    var extractorComponent = require(__dirname+"/../component/ExtractorComponent.js");
    var wgxpath = require('wgxpath');
    //var xpath = require('xpath');

    //var extractor = require(__dirname+"/../component/extractor.js");

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
                response.send(extractorComponent.extractFields(window));
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
                window.document.evaluate = null;
                wgxpath.install(window);
                //TODO: find perfomance problem
                //window.document.evaluate = function (expressionString, contextNode, resolver, type, result) {
                //    var expression = window.document.createExpression(expressionString, resolver);
                //    return expression.evaluate(contextNode,type, result);
                //    return xpath.select(expressionString, contextNode);
                //};
                response.send(extractorComponent.extractTemplate(window));
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
                window.document.evaluate = null;
                wgxpath.install(window);
                //TODO: find perfomance problem
                //window.document.evaluate = function (expressionString, contextNode, resolver, type, result) {
                //    //var expression = window.document.createExpression(expressionString, resolver);
                //    //return expression.evaluate(contextNode,type, result);
                //    return "";
                //};
                response.send(extractorComponent.extractTemplate(window));
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
                response.send(extractorComponent.extractFields(window));
            }
        });
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

    }
}