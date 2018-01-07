var express = require('express'),
    handlebars = require('express-handlebars'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    path = require('path'),
    //MapController = require('./controllers/MapController');
    restApi = require('./controllers/api/restApi'),
    accountController = require('./controllers/accountController'),
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

app.use('/account/', accountController);

//Web Socket--------------------------
const WebSocket = require('ws');

const ws = new WebSocket('wss://api.kcoin.club/');

ws.onopen = function() {
    console.log('Opened');
    KeepAlive();
};

ws.onmessage = function(data) {
    console.log(data);
    OnReceivedData(data);
};

ws.onerror = function() {
    console.log("Error");
}

ws.onclose = function() {
    console.log("Closed");
}

function KeepAlive() {
    ws.send("Keep me alive");
    setTimeout(KeepAlive, 30000);
}

function OnReceivedData(data) {
    if (data.type === 'block'){
        data.data.transactions.forEach(element => {
            
        });
    }
}
//------------------------------------


app.listen(process.env.PORT || 3000, function () {
    console.log('SERVER is running...');
});