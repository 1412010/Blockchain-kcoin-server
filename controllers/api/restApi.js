var request = require('request');
var express = require('express');
var router = express.Router();
var accountModel = require('../../models/accountModel');
var crypto = require('crypto');
var randomstring = require("randomstring");
/* PUT students listing. */
router.put('/Register', function(req, res, next) {
	var ePass = crypto.createHash('md5').update(req.body.password).digest('hex');

	var condition = {
		_email: req.body.email
	};

	//kiểm tra email có tồn tại
	accountModel.find(condition, function (error, row) {
		if (error) {
			console.log(error);
			return res.status(500).send(error);
		}

		if (row.length == 0) {
			request('https://api.kcoin.club/generate-address', function (error, response, body){
				if(error){
					console.log(error);
					return read.status(500).send("Không thể đăng ký");
				}
				json = JSON.parse(body);
				console.log(json);
				var data = {
					_email: req.body.email,
					_password: ePass,
					_address: json.address,
					_publicKey: json.publicKey,
					_privateKey: json.privateKey,
					_role: 0,
					_confirmCode: randomstring.generate(4),
					_isActive: false,
					_realBalance: 0,
					_availableBalance: 0
				};
				console.log(data);
				accountModel.create(data, function (error, row) {
					if (error) {
						console.log(error);
						return read.status(500).send("Không thể đăng ký");
					} else {
						console.log(row);
						return res.json(row);
					}
				});
			});
			
			
		} else {
			return res.status(409).send("Email đã tồn tại!")
		}
	});
});


module.exports = router;
