var mongoose = require('mongoose');

var transactionModelSchema = new mongoose.Schema({
    _hash: {type:String, required: true},
    _confirmCode: {type: String, required: true},
    _state: {type: String, required: true},
    _dateInit: {type: Date, required: true}, //thời gian khởi tạo giao dịch
    _dateSuccess: {type: Date} //thời gian giao dịch được xác nhận
});
mongoose.model('transactionModel', transactionModelSchema);

module.exports = mongoose.model('transactionModel');