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
var helper = require('./fn/helper');
var accountModel = require('./models/accountModel');
var transactionModel = require('./models/transactionModel');


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


//Web Socket--------------------------
const WebSocket = require('ws');

const ws = new WebSocket('wss://api.kcoin.club/');

ws.onopen = function () {
    console.log('Opened');
    KeepAlive();
    helper.SyncBlock();
};

ws.onmessage = function (data) {
    console.log(data);
    OnReceiveData(data);
};

ws.onerror = function () {
    console.log("Error");
}

ws.onclose = function () {
    console.log("Closed");
}

function KeepAlive() {
    ws.send("Keep me alive");
    setTimeout(KeepAlive, 30000);
}

function OnReceiveData(data) {
    const jsonData = JSON.parse(data.data);
    console.log(jsonData.type);
    if (jsonData.type === 'block') {
        helper.WorkOnBlock(jsonData.data);
    }
    if(jsonData.type === 'transaction'){
        console.log("Loại transaction");
    }
}
//------------------------------------


app.listen(process.env.PORT || 3000, function () {
    console.log('SERVER is running...');
});