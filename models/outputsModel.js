var mongoose = require('mongoose');

var outputsModelSchema = new mongoose.Schema({
    _hash: {type:String, required: true},
    _output: {type: String, required: true},//địa chỉ lấy từ lock script
    _value: {type: String, required: true}
});
mongoose.model('outputsModel', outputsModelSchema);

module.exports = mongoose.model('outputsModel');