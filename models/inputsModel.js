var mongoose = require('mongoose');

var inputsModelSchema = new mongoose.Schema({
    _idTrans: {type: String, required: true},//id ánh xạ đến bảng transaction
    _hash: {type:String, required: true},
    _referencedOutputHash: {type: String, required: true},//hash giao dịch chứa output người gửi
    _referencedOutputIndex: {type: Number, required: true}
});
mongoose.model('inputsModel', inputsModelSchema);

module.exports = mongoose.model('inputsModel');