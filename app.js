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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

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

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    console.log('404 found');
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    console.log("error:" + err.message);
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(process.env.PORT || 5000, function () {
    console.log('SERVER is running...');
});