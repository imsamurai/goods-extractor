var express         = require('express');
var path            = require('path'); // модуль для парсинга пути
var app = express();
var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');

app.use(morgan('dev')); // выводим все запросы со статусами в консоль
app.use(bodyParser.json({limit: '50mb'})); // стандартный модуль, для парсинга JSON в запросах
app.use(bodyParser.raw({limit: '50mb'})); // стандартный модуль, для парсинга JSON в запросах
app.use(bodyParser.text({limit: '50mb'})); // стандартный модуль, для парсинга JSON в запросах
app.use(methodOverride()); // поддержка put и delete


app.post('/extract_fields_by_url', function (request, response) {
    console.log('Controller main extract_fields_by_url');
    response.setHeader("Access-Control-Allow-Origin", "*");
    var constructor = require('./controllers/main2');
    var controller = new constructor.MainController(request, response);
    controller.extract_fields_by_url();
});

app.post('/extract_template_by_url', function (request, response) {
    console.log('Controller main extract_template_by_url');
    var constructor = require('./controllers/main2');
    var controller = new constructor.MainController(request, response);
    controller.extract_template_by_url();
});

app.post('/extract_template_by_html', function (request, response) {
    console.log('Controller main extract_template_by_html');
    var constructor = require('./controllers/main2');
    var controller = new constructor.MainController(request, response);
    controller.extract_template_by_html();
});

app.post('/extract_fields_by_html', function (request, response) {
    console.log('Controller main extract_fields_by_html');
    var constructor = require('./controllers/main2');
    var controller = new constructor.MainController(request, response);
    controller.extract_fields_by_html();
});

app.post('/tests', function (request, response) {
    console.log('Controller main tests');
    var constructor = require('./controllers/main2');
    var controller = new constructor.MainController(request, response);
    controller.tests();
});

app.post('/learn', function (request, response) {
    console.log('Controller main learn');
    var constructor = require('./controllers/main2');
    var controller = new constructor.MainController(request, response);
    controller.learn();
});

app.post('/makeDict', function (request, response) {
    console.log('Controller main makeDict');
    var constructor = require('./controllers/main2');
    var controller = new constructor.MainController(request, response);
    controller.makeDict();
});

var server = app.listen(8080, function(){
    console.log('Express server listening on port 8080');
});
server.timeout = 1000000000;