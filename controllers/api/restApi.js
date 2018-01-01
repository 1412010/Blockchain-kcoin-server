var request = require('request');
var express = require('express');
var router = express.Router();
var accountModel = require('../../models/accountModel');
var confirmAccountCode = require('../../models/confirmAccountCode');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var randomstring = require("randomstring");
var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: 'myauctionwebapp@gmail.com',
		pass: 'tamhieuga'
	}
});
const secretKey = 'key';
/* PUT students listing. */
router.put('/Register', function (req, res, next) {
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
			request('https://api.kcoin.club/generate-address', function (error, response, body) {
				if (error) {
					console.log(error);
					return read.status(500).send("Không thể đăng ký");
				}
				json = JSON.parse(body);
				console.log(json);
				var confirmCode = randomstring.generate(6);
				var data = {
					_email: req.body.email,
					_password: ePass,
					_address: json.address,
					_publicKey: json.publicKey,
					_privateKey: json.privateKey,
					_role: 0,
					_confirmCode: confirmCode,
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
						//gửi mã xác nhận
						var text = "Mã xác nhận của tài khoản bạn là: " + confirmCode;
						var mailOptions = {
							from: "Web Auction <myauctionwebapp@gmail.com>", // sender address
							to: req.body.email, // list of receivers
							subject: "Mã xác nhận tài khoản BlockChain", // Subject line
							text: text // plaintext body
						};
						console.log(mailOptions);

						smtpTransport.sendMail(mailOptions, function (error, response) {
							if (error) {
								console.log(error);
							} else {
								console.log("Message sent: " + response.message);
							}
						});
						//gửi mã xác nhận
						var dateConfirmCode = {
							_confirmCode: confirmCode,
							_idAccount: row.id
						}
						//thêm mã xác nhận ứng với tài khoản
						confirmAccountCode.create(dateConfirmCode, function (error, row1) {
							if (error) {
								console.log(error);
								return read.status(500).send("Không thể đăng ký");
							} else {
								console.log(row1);
							}
						});

						return res.json(row);
					}
				});
			});


		} else {
			return res.status(409).send("Email đã tồn tại!")
		}
	});
});

router.post('/ConfirmAccount', function (req, res, next) {
	var condition = {
		_confirmCode: req.body.code
	};
	confirmAccountCode.find(condition, function (error, row) {
		if (error) {
			return res.status(400).send("Xác nhận thất bại!")
		}
		if (row.length > 0) {
			var id = row[0]._idAccount;
			var condition2 = {
				_id: id
			}
			var newData = {
				_isActive: true
			}
			accountModel.findOneAndUpdate(condition2, newData, { new: true }, function (error, row1) {
				if (error) {
					return res.status(400).send("Xác nhận thất bại!")
				} else {
					var mess = {
						message: "Xác nhận tài khoản thành công",
						address: row1._address
					}
					return res.json(mess);
				}
			});
		}
	});
});

router.post('/Login', function (req, res, next) {
	var ePass = crypto.createHash('md5').update(req.body.password).digest('hex');
	var condition = {
		_email: req.body.email,
		_password: ePass
	};
	accountModel.find(condition, function (error, row) {
		if (error) {
			console.log(error);
			return res.status(500).send("Đăng nhập thất bại!");
		}

		if (row.length == 0) {
			return res.status(400).send("Email hoặc Password không đúng");
		} else {
			if (row[0]._isActive) {
				var payload = {
					_email: row[0]._email,
					_address: row[0]._address,
					_role: row[0]._role,
					_realBalance: row[0]._realBalance,
					_availableBalance: row[0]._availableBalance
				};
				var token = jwt.sign(payload, secretKey);
				var result = {
					data: payload,
					token: token
				};
				console.log(result);
				return res.json(result);
			} else {
				return res.status(403).send("Tài khoản chưa kích hoạt!");
			}
		}
	});
})
module.exports = router;
