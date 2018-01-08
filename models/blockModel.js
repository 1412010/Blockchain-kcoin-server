var mongoose = require('mongoose');

var blockModelSchema = new mongoose.Schema({
    _numberOfBlocks: {type: Number, required: true}
});
mongoose.model('blockModel', blockModelSchema);

module.exports = mongoose.model('blockModel');