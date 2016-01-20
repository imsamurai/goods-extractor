var express         = require('express');
var path            = require('path'); // ������ ��� �������� ����
var app = express();
var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');

//app.use(express.favicon()); // ������ ����������� ���������, ����� ����� �� ���� ������
app.use(morgan('dev')); // ������� ��� ������� �� ��������� � �������
app.use(bodyParser.json({limit: '50mb'})); // ����������� ������, ��� �������� JSON � ��������
app.use(bodyParser.raw({limit: '50mb'})); // ����������� ������, ��� �������� JSON � ��������
app.use(bodyParser.text({limit: '50mb'})); // ����������� ������, ��� �������� JSON � ��������
app.use(methodOverride()); // ��������� put � delete
//app.use(app.router); // ������ ��� �������� ������� ������������ �����
//app.use(express.static(path.join(__dirname, "public"))); // ������ ������������ ��������� �������, ������� ������� �� ����� public/ (� ����� ������ ������ index.html)


app.post('/extract_fields_by_url', function (request, response) {
    console.log('Controller main extract_fields_by_url');
    var constructor = require('./controllers/main');
    var controller = new constructor.MainController(request, response);
    controller.extract_fields_by_url();
});

app.post('/extract_fields_by_html', function (request, response) {
    console.log('Controller main extract_fields_by_html');
    var constructor = require('./controllers/main');
    var controller = new constructor.MainController(request, response);
    controller.extract_fields_by_html();
});

app.listen(8088, function(){
    console.log('Express server listening on port 1337');
});