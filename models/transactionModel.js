var mongoose = require('mongoose');

var transactionModelSchema = new mongoose.Schema({
    _hash: {type:String},
    _inputAddress: {type: String, required: true}, //địa chỉ gửi
    _outputAddress: {type: String, required: true}, //địa chỉ nhận
    _value: {type: Number, required: true}, //số tiền gửi
    _confirmCode: {type: String, required: true},
    _state: {type: String, required: true},
    _dateInit: {type: Date, required: true}, //thời gian khởi tạo giao dịch
    _dateSuccess: {type: Date} //thời gian giao dịch được xác nhận
});
mongoose.model('transactionModel', transactionModelSchema);

module.exports = mongoose.model('transactionModel');