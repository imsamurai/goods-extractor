var express         = require('express');
var path            = require('path'); // модуль для парсинга пути
var app = express();
var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');

//app.use(express.favicon()); // отдаем стандартную фавиконку, можем здесь же свою задать
app.use(morgan('dev')); // выводим все запросы со статусами в консоль
app.use(bodyParser()); // стандартный модуль, для парсинга JSON в запросах
app.use(methodOverride()); // поддержка put и delete
//app.use(app.router); // модуль для простого задания обработчиков путей
//app.use(express.static(path.join(__dirname, "public"))); // запуск статического файлового сервера, который смотрит на папку public/ (в нашем случае отдает index.html)


app.get('/save', function (req, res) {
    var controller = require('./controllers/main');
    controller.save(req, res);
});

app.listen(8088, function(){
    console.log('Express server listening on port 1337');
});