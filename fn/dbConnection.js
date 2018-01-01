var mongoose = require('mongoose');
var _URI = 'mongodb://root:123456@ds133557.mlab.com:33557/blockchain_db';

mongoose.connect(_URI,  { useMongoClient: true });