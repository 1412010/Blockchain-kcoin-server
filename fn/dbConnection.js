var mongoose = require('mongoose');
var _URI = 'mongodb://thanhtam:123456789@ds239047.mlab.com:39047/blockchain_db';

mongoose.connect(_URI,  { useMongoClient: true });