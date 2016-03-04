/**
 * Created by imsamurai on 30.11.2015.
 */
exports.MainController = function (request, response) {
    var jsdom = require("jsdom");
    var extractorComponent = require(__dirname + "/../component/ExtractorComponent.js");
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
                var fields = extractorComponent.extractFields(window);
                if (fields) {
                    response.send(fields);
                } else {
                    response.status(404).send('Fields no found!');
                }
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
                var template = extractorComponent.extractTemplate(window);
                if (template) {
                    response.send(template);
                } else {
                    response.status(404).send('Fields no found, can\'t make template!');
                }
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
                var template = extractorComponent.extractTemplate(window);
                if (template) {
                    response.send(template);
                } else {
                    response.status(404).send('Fields no found, can\'t make template!');
                }
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
                var fields = extractorComponent.extractFields(window);
                if (fields) {
                    response.send(fields);
                } else {
                    response.status(404).send('Fields no found!');
                }
            }
        });
    };

    this.tests = function () {
        var moment = require('moment');
        var fs = require("fs");
        var filter = request.body.filter;

        var timestamp = moment(new Date()).format("YYYY-MM-DD_HH-mm");

        var requestsPath = __dirname + '/../tests/requests/';
        var resultsPath = __dirname + '/../tests/results/';
        var requests = fs.readdirSync(requestsPath).filter(function(r) {
            return !filter || filter.indexOf(r) !== -1;
        });
        var totalStart = moment(new Date());
        requests.forEach(function (request, requestIndex) {
            var oneRequestStart = moment(new Date());
            var resultPath = resultsPath + request + '/' + timestamp + '/';
            var logPrefix = request + ' -> ';
            console.log(logPrefix + 'Start process ');
            console.log(logPrefix + resultPath);
            console.log(logPrefix + 'Load data');
            var start = moment(new Date());
            var requestData = fs.readFileSync(requestsPath + request);
            var end = moment(new Date()).diff(start, 'seconds');
            console.log(logPrefix + 'Data loaded in ' + end + ' sec');

            if (!fs.existsSync(resultsPath + request)) {
                fs.mkdirSync(resultsPath + request);
            }
            if (!fs.existsSync(resultPath)) {
                fs.mkdirSync(resultPath);
            }

            makeAndProcessDOM({
                html: requestData,
                //features: {
                //    FetchExternalResources: ["script"],
                //    ProcessExternalResources: ["script"],
                //    SkipExternalResources: false
                //},
                src: [
                    fs.readFileSync(__dirname + '/../lib/utility/jquery-2.2.0.min.js', {encoding: 'utf8'}),
                    fs.readFileSync(__dirname + '/../lib/utility/xpath/xpathrefine.js', {encoding: 'utf8'})
                ],
                done: function (e, window) {
                    window.document.evaluate = null;
                    wgxpath.install(window);

                    var start = moment(new Date());
                    console.log(logPrefix + 'Extract');
                    var fieldCollections = extractorComponent.extract(window);
                    var end = moment(new Date()).diff(start, 'seconds');
                    console.log(logPrefix + 'Extracted in ' + end + ' sec');

                    start = moment(new Date());
                    console.log(logPrefix + 'Extract fields');
                    var fields = extractorComponent.extractFields(window, fieldCollections);
                    end = moment(new Date()).diff(start, 'seconds');
                    console.log(logPrefix + 'Fields extracted in ' + end + ' sec');
                    start = moment(new Date());
                    console.log(logPrefix + 'Save fields');
                    fs.writeFileSync(resultPath + 'fields.html', fields);
                    end = moment(new Date()).diff(start, 'seconds');
                    console.log(logPrefix + 'Fields saved in ' + end + ' sec');

                    start = moment(new Date());
                    console.log(logPrefix + 'Extract template');
                    var template = extractorComponent.extractTemplate(window, fieldCollections);
                    window.close();
                    end = moment(new Date()).diff(start, 'seconds');
                    console.log(logPrefix + 'Template extracted in ' + end + ' sec');
                    start = moment(new Date());
                    console.log(logPrefix + 'Save template');
                    fs.writeFileSync(resultPath + 'template.json', JSON.stringify(template, null, 4));
                    end = moment(new Date()).diff(start, 'seconds');
                    console.log(logPrefix + 'Template saved in ' + end + ' sec');

                    var oneRequestEnd = moment(new Date()).diff(oneRequestStart, 'seconds');
                    console.log(logPrefix + 'Done in ' + oneRequestEnd + ' sec');
                    if (requestIndex == requests.length - 1) {
                        var totalEnd = moment(new Date()).diff(totalStart, 'seconds');
                        console.log('All requests done in ' + totalEnd + ' sec');
                        response.send('done in ' + totalEnd + ' sec');
                    }

                }
            });


        });
    };

    this.learn = function () {
        var moment = require('moment');
        var fs = require("fs");
        var modelName = request.body.modelName;
        var modelFileName = request.body.modelFileName;
        var filter = request.body.filter;

        var timestamp = moment(new Date()).format("YYYY-MM-DD_HH-mm");

        var requestsPath = __dirname + '/../tests/requests/';
        var learningPath = __dirname + '/../tests/learning/';
        var modelDataPath = __dirname + '/../lib2/data/neural/';
        var requests = fs.readdirSync(learningPath).filter(function(r) {
            return !filter || filter.indexOf(r) !== -1;
        });
        var data = [];

        var totalStart = moment(new Date());
        requests.forEach(function (request, requestIndex) {
            var oneRequestStart = moment(new Date());
            var logPrefix = request + ' -> ';
            console.log(logPrefix + 'Start process ');
            console.log(logPrefix + 'Load data');
            var start = moment(new Date());
            var requestData = fs.readFileSync(requestsPath + request.replace('.js', '.html'));
            var end = moment(new Date()).diff(start, 'seconds');
            console.log(logPrefix + 'Data loaded in ' + end + ' sec');

            makeAndProcessDOM({
                html: requestData,
                //features: {
                //    FetchExternalResources: ["script"],
                //    ProcessExternalResources: ["script"],
                //    SkipExternalResources: false
                //},
                src: [
                    fs.readFileSync(__dirname + '/../lib/utility/jquery-2.2.0.min.js', {encoding: 'utf8'}),
                    fs.readFileSync(__dirname + '/../lib/utility/xpath/xpathrefine.js', {encoding: 'utf8'})
                ],
                done: function (e, window) {
                    window.document.evaluate = null;
                    wgxpath.install(window);
                    var propsExtractor = extractorComponent.makeExtractPropsCallback(window, modelName);


                    var start = moment(new Date());
                    console.log(logPrefix + 'Extract');
                    var trainData = (require(learningPath + request)).flatMap(function(d) {
                        return propsExtractor(d[0], d[1], d[2]);
                    });
                    data.push(trainData);
                    var end = moment(new Date()).diff(start, 'seconds');
                    console.log(logPrefix + 'Extracted in ' + end + ' sec');

                    var oneRequestEnd = moment(new Date()).diff(oneRequestStart, 'seconds');
                    console.log(logPrefix + 'Done in ' + oneRequestEnd + ' sec');
                    window.close();
                    if (requestIndex == requests.length - 1) {
                        start = moment(new Date());
                        console.log('Start train');

                        //train start
                        var net = extractorComponent.trainNet(data.flatMap(function(d){ return d; }));
                        fs.renameSync(modelDataPath+modelFileName+'.js', modelDataPath+modelFileName+'_'+timestamp+'.js');
                        var out = 'function getProductNeural() { return '+JSON.stringify(net.toJSON())+';}';
                        fs.writeFileSync(modelDataPath+modelFileName+'.js', out);
                        //train end

                        end = moment(new Date()).diff(start, 'seconds');
                        console.log('Train done in ' + end + ' sec');

                        var totalEnd = moment(new Date()).diff(totalStart, 'seconds');
                        console.log('All requests done in ' + totalEnd + ' sec');
                        response.send('done in ' + totalEnd + ' sec');
                    }

                }
            });


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

}