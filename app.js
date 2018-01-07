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
var helper = require('../../fn/helper');
var accountModel = require('../models/accountModel');
var transationModel = require('../models/transactionModel');

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
    OnReceiveData(data);
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

function OnReceiveData(data) {
    if (data.type === 'block'){
        WorkOnBlock(data.data);
    }
}
//------------------------------------

function WorkOnBlock(block) {
    var accounts = helper.GetAccount();
    var transactions = helper.GetTransactions();

    block.transactions.forEach(transaction => {
        transaction.outputs.forEach((output, index) => {
            var parts = output.lockScript.split(' ');
            var receiveAddress = parts[1];
            if (helper.IsAddressExist(accounts, receiveAddress)) {
                if (helper.IsTransactionExist(transactions, transaction.hash)) {

                    var data = {
                        _dateSuccess: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
                        _state: 'HOÀN THÀNH'
                    }
                    helper.UpdateTransaction(transaction.hash, data);
                    helper.UpdateAvalableBalance(receiveAddress, output.value); 
                }
                else {
                    transactionData = {
                        _hash: transaction.hash,
                        _inputAddress: "",
                        _outputAddress: receiveAddress,
                        _value: output.value,
                        _confirmCode: "",
                        _state: 'HOÀN THÀNH',
                        _dateInit: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
                        _dateSuccess: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
                    }
                    helper.AddTransaction(transactionData);

                    helper.UpdateAvalableBalance(receiveAddress, output.value); 
                    helper.UpdateRealBalance(receiveAddress, output.value); 
                }
                
                var outputData = {
                    _hash: transaction.hash,
                    _output: receiveAddress,
                    _index: index,
                    _value: output.value,
                    _canBeUsed: true
                }
                helper.AddOutput(outputData);
            }
        });
    });
}


app.listen(process.env.PORT || 3000, function () {
    console.log('SERVER is running...');
});