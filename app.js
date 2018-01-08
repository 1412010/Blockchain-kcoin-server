var express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    morgan = require('morgan'),
    path = require('path'),
    restApi = require('./controllers/api/restApi'),
    dbConnect = require('./fn/dbConnection'),
    cors = require('cors'),
    passport = require('passport'),
    flash = require('express-flash'),
    configPassport = require('./fn/configPassport');
var app = express();
var helper = require('./fn/helper');
var accountModel = require('./models/accountModel');
var transactionModel = require('./models/transactionModel');


app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(morgan('dev'));
configPassport(app, passport);

app.use(express.static(
    path.resolve(__dirname, 'public')
));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(cookieParser());
app.use(session({
    secret: 'cat',
    resave: false,
    saveUninitialized: false,
    maxAge: 600000  // session lasts only 10 minutes
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use('/', restApi);
app.use('*', restApi);


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


app.listen(process.env.PORT || 5000, function () {
    console.log('SERVER is running...');
});