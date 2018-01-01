var mongoose = require('mongoose');

var ConfirmAccountCodeSchema = new mongoose.Schema({
    _confirmCode: {type: String, required: true},
    _idAccount: {type: String, required: true}
});
mongoose.model('confirmAccountCode', ConfirmAccountCodeSchema);

module.exports = mongoose.model('confirmAccountCode');