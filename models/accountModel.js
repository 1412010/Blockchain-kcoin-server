var mongoose = require('mongoose');

var AccountSchema = new mongoose.Schema({
    _email: { type: String, required: true },
    _password: { type: String, required: true },
    _address: {type: String, required: true},
    _publicKey: {type: String, required: true},
    _privateKey: {type: String, required: true},
    _role: {type: Number, required: true}, //0: tài khoản thường; 1: admin
    _confirmCode: {type: String},
    _isActive: {type: Boolean, required: true},
    _realBalance: { type: Number, required: true }, //số dư thực tế
    _availableBalance: {type: Number, required: true} //số dư khả dụng
});
mongoose.model('account', AccountSchema);

module.exports = mongoose.model('account');