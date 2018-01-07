var express = require('express');
var router = express.Router();
var accountModel = require('../../models/accountModel');

//Lấy thông tin tài khoản
router.get('/:address', function (req, res) {
	accountModel.find(req.params.address, function (error, account) {
		if (error) {
			console.log(error);
			return res.status(500).send(error);
		}
		if (account) {
			var data = {
				realBalance: account._realBalance,
				availableBalance: account._availableBalance,
				address: account._address,
				email: account._email
			}
			console.log(data);
			return res.json(data);
		}
		return res.status(500).send("Xảy ra lỗi khi lấy thông tin tài khoản");
	})
});

module.exports = router;