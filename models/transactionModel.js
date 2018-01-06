var mongoose = require('mongoose');

var transactionModelSchema = new mongoose.Schema({
    _hash: {type:String},
    _inputAddress: {type: String, required: true}, //địa chỉ gửi (nếu từ hệ thống khác gửi về thì để rỗng do khôg biết địa chỉ)
    _outputAddress: {type: String, required: true}, //địa chỉ nhận (mỗi địa chỉ có trong hệ thống lưu 1 record dù cùng transaction)
    _value: {type: Number, required: true}, //số tiền gửi
    _confirmCode: {type: String, required: true},//nếu từ hệ thốn blockchain gửi về thì để trống
    _state: {type: String, required: true},
    _dateInit: {type: Date, required: true}, //thời gian khởi tạo giao dịch
    _dateSuccess: {type: Date} //thời gian giao dịch được xác nhận
});
mongoose.model('transactionModel', transactionModelSchema);

module.exports = mongoose.model('transactionModel');