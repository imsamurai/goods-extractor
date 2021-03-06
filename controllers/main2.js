/**
 * Created by imsamurai on 30.11.2015.
 */
exports.MainController = function (request, response) {
    var jsdom = require("jsdom");
    var extractorComponent = require(__dirname + "/../component/ExtractorComponent.js");
    var wgxpath = require('wgxpath');

    /**
     * Returns html table of fields extracted from given url
     */
    this.extract_fields_by_url = function () {
        var url = request.body.url;
        makeAndProcessDOM({
            url: url,
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

    /**
     * Returns json template with fields xpath's extracted from given url
     */
    this.extract_template_by_url = function () {
        var url = request.body.url;
        var fs = require("fs");
        makeAndProcessDOM({
            url: url,
            src: [
                fs.readFileSync(__dirname + '/../lib2/utility/jquery-2.2.0.min.js', {encoding: 'utf8'}),
                fs.readFileSync(__dirname + '/../lib2/utility/xpath/xpathrefine.js', {encoding: 'utf8'})
            ],
            done: function (e, window) {
                window.document.evaluate = null;
                wgxpath.install(window);
                var template = extractorComponent.extractTemplate(window);
                if (template) {
                    response.send(template);
                } else {
                    response.status(404).send('Fields no found, can\'t make template!');
                }
            }
        });
    };

    /**
     * Returns json template with fields xpath's extracted from given html
     */
    this.extract_template_by_html = function () {
        var html = request.body;
        var fs = require("fs");
        makeAndProcessDOM({
            html: html,
            src: [
                fs.readFileSync(__dirname + '/../lib2/utility/jquery-2.2.0.min.js', {encoding: 'utf8'}),
                fs.readFileSync(__dirname + '/../lib2/utility/xpath/xpathrefine.js', {encoding: 'utf8'})
            ],
            done: function (e, window) {
                window.document.evaluate = null;
                wgxpath.install(window);
                var template = extractorComponent.extractTemplate(window);
                if (template) {
                    response.send(template);
                } else {
                    response.status(404).send('Fields no found, can\'t make template!');
                }
            }
        });
    };

    /**
     * Returns html table of fields extracted from given html
     */
    this.extract_fields_by_html = function () {
        var html = request.body;
        makeAndProcessDOM({
            html: html,
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

    /**
     * Extract fields html and json from all test requests from tests/requests/
     * and save results into tests/results/
     */
    this.tests = function () {
        var moment = require('moment');
        var fs = require("fs");
        var filter = request.body.filter;

        var timestamp = moment(new Date()).format("YYYY-MM-DD_HH-mm");

        var requestsPath = __dirname + '/../tests/requests/';
        var resultsPath = __dirname + '/../tests/results/';
        var requests = fs.readdirSync(requestsPath).filter(function (r) {
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
                src: [
                    fs.readFileSync(__dirname + '/../lib2/utility/jquery-2.2.0.min.js', {encoding: 'utf8'}),
                    fs.readFileSync(__dirname + '/../lib2/utility/xpath/xpathrefine.js', {encoding: 'utf8'})
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

    /**
     * Train neural network for field classification based on test data from tests/requests
     * and rules from tests/learning. Trained network settings saved into lib2/data/neural/<modelFileName>
     * and labeled data (csv format, not used by app; just for external analysis) - into tests/neural_train_data/
     */
    this.learn = function () {
        var csv = require('fast-csv');
        var moment = require('moment');
        var fs = require("fs");
        var modelName = request.body.modelName;
        var modelFileName = request.body.modelFileName;
        var filter = request.body.filter;

        var timestamp = moment(new Date()).format("YYYY-MM-DD_HH-mm");

        var requestsPath = __dirname + '/../tests/requests/';
        var learningPath = __dirname + '/../tests/learning/';
        var modelDataPath = __dirname + '/../lib2/data/neural/';
        var trainDataPath = __dirname + '/../tests/neural_train_data/';
        var requests = fs.readdirSync(learningPath).filter(function (r) {
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
                src: [
                    fs.readFileSync(__dirname + '/../lib2/utility/jquery-2.2.0.min.js', {encoding: 'utf8'}),
                    fs.readFileSync(__dirname + '/../lib2/utility/xpath/xpathrefine.js', {encoding: 'utf8'})
                ],
                done: function (e, window) {
                    window.document.evaluate = null;
                    wgxpath.install(window);
                    var propsExtractor = extractorComponent.makeExtractPropsCallback(window, modelName);


                    var start = moment(new Date());
                    console.log(logPrefix + 'Extract');
                    var trainData = (require(learningPath + request)).flatMap(function (d) {
                        return propsExtractor(d[0], d[1], d[2]);
                    });
                    data.push(trainData);
                    var end = moment(new Date()).diff(start, 'seconds');
                    console.log(logPrefix + 'Extracted in ' + end + ' sec');

                    var oneRequestEnd = moment(new Date()).diff(oneRequestStart, 'seconds');
                    console.log(logPrefix + 'Done in ' + oneRequestEnd + ' sec');
                    window.close();
                    if (requestIndex == requests.length - 1) {
                        console.log('Export to csv');
                        var dataCollected = data.flatMap(function (d) {
                            return d;
                        });
                        csv
                            .write(dataCollected.map(function (one) {
                                var d = Object.clone(one.input);
                                if (Object.keys(one.output).length !== 1) {
                                    var type = "skip";
                                } else {
                                    var type = Object.keys(one.output)[0];
                                }
                                for (var p in d) {
                                    d[p] = d[p].toFixed(10);
                                }
                                d['LABEL'] = type;
                                return d;
                            }), {headers: true, delimiter: ';'})
                            .pipe(fs.createWriteStream(trainDataPath + timestamp + '.csv'));
                        start = moment(new Date());
                        console.log('Start train');

                        //train start
                        var net = extractorComponent.trainNet(data.flatMap(function (d) {
                            return d;
                        }));
                        fs.renameSync(modelDataPath + modelFileName + '.js', modelDataPath + modelFileName + '_' + timestamp + '.js');
                        var out = 'function getProductNeural() { return ' + JSON.stringify(net.toJSON()) + ';}';
                        fs.writeFileSync(modelDataPath + modelFileName + '.js', out);
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

    /**
     * Returns json structure of dictionary where words are collected from elements class names.
     * Elements selected based on rules for neural network from tests/learning from all test data /tests/requests
     */
    this.makeDict = function () {
        var moment = require('moment');
        var fs = require("fs");
        var filter = request.body.filter;

        var requestsPath = __dirname + '/../tests/requests/';
        var learningPath = __dirname + '/../tests/learning/';
        var requests = fs.readdirSync(learningPath).filter(function (r) {
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
                src: [
                    fs.readFileSync(__dirname + '/../lib2/utility/jquery-2.2.0.min.js', {encoding: 'utf8'}),
                    fs.readFileSync(__dirname + '/../lib2/utility/xpath/xpathrefine.js', {encoding: 'utf8'})
                ],
                done: function (e, window) {
                    window.document.evaluate = null;
                    wgxpath.install(window);


                    var start = moment(new Date());
                    console.log(logPrefix + 'Extract');
                    var classData = (require(learningPath + request)).flatMap(function (d) {
                        if (Object.keys(d[2]).length !== 1) {
                            var type = "skip";
                        } else {
                            var type = Object.keys(d[2])[0];
                        }
                        return [{
                            type: type,
                            classNames: extractorComponent.extractClassesNorm(window, d[0])
                        }];
                    });
                    data.push(classData);
                    var end = moment(new Date()).diff(start, 'seconds');
                    console.log(logPrefix + 'Extracted in ' + end + ' sec');

                    var oneRequestEnd = moment(new Date()).diff(oneRequestStart, 'seconds');
                    console.log(logPrefix + 'Done in ' + oneRequestEnd + ' sec');
                    window.close();
                    if (requestIndex == requests.length - 1) {
                        var totalEnd = moment(new Date()).diff(totalStart, 'seconds');
                        console.log('All requests done in ' + totalEnd + ' sec');
                        var result = data.flatMap(function (d) {
                            return d;
                        }).reduce(function (acc, part) {
                            if (!acc[part.type]) {
                                acc[part.type] = [];
                            }
                            acc[part.type] = acc[part.type].concat(part.classNames).unique().sort();
                            return acc;
                        }, {});
                        response.send(result);
                    }

                }
            });


        });
    };

    /**
     * Wrapper for DOM engine
     *
     * @param params
     */
    function makeAndProcessDOM(params) {
        jsdom.env(params);
    }

};