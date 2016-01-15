var express         = require('express');
var path            = require('path'); // ������ ��� �������� ����
var app = express();
var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');

//app.use(express.favicon()); // ������ ����������� ���������, ����� ����� �� ���� ������
app.use(morgan('dev')); // ������� ��� ������� �� ��������� � �������
app.use(bodyParser()); // ����������� ������, ��� �������� JSON � ��������
app.use(methodOverride()); // ��������� put � delete
//app.use(app.router); // ������ ��� �������� ������� ������������ �����
//app.use(express.static(path.join(__dirname, "public"))); // ������ ������������ ��������� �������, ������� ������� �� ����� public/ (� ����� ������ ������ index.html)


app.get('/save', function (req, res) {
    var controller = require('./controllers/main');
    controller.save(req, res);
});

app.listen(8088, function(){
    console.log('Express server listening on port 1337');
});