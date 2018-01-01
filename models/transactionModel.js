var mongoose = require('mongoose');

var transactionModelSchema = new mongoose.Schema({
    _hash: {type:String, required: true},
    _confirmCode: {type: String, required: true},
    _state: {type: String, required: true}
});
mongoose.model('transactionModel', transactionModelSchema);

module.exports = mongoose.model('transactionModel');