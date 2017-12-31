var express = require('express'),
    handlebars = require('express-handlebars'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    path = require('path'),
    //MapController = require('./controllers/MapController');
    restApi = require('./controllers/api/restApi'),
    dbConnect = require('./fn/dbConnection'),
    CORS = require('cors');
var app = express();

app.use(CORS());
app.use(morgan('dev'));

app.engine('hbs', handlebars({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: 'views/_layouts/',
    partialsDir: 'views/_partials/',
    helpers: {}
}));
app.set('view engine', 'hbs');

app.use(express.static(
    path.resolve(__dirname, 'public')
));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use('/api/restApi', restApi);


app.listen(process.env.PORT || 3000, function () {
    console.log('SERVER is running...');
});