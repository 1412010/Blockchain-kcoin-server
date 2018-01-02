var mongoose = require('mongoose');

var inputsModelSchema = new mongoose.Schema({
    _hash: {type:String, required: true},
    _referencedOutputHash: {type: String, required: true},//hash giao dịch chứa output người gửi
    _referencedOutputIndex: {type: Number, required: true}
});
mongoose.model('inputsModel', inputsModelSchema);

module.exports = mongoose.model('inputsModel');