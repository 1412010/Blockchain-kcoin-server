var request = require('request');
var express = require('express');
var router = express.Router();
var accountModel = require('../../models/accountModel');
var crypto = require('crypto');
var randomstring = require("randomstring");
var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'myauctionwebapp@gmail.com',
        pass: 'tamhieuga'
    }
});
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
						var text = "Mã xác nhận của tài khoản bạn là: " + confirmCode;
						var mailOptions = {
							from: "Web Auction <myauctionwebapp@gmail.com>", // sender address
							to: req.body.email, // list of receivers
							subject: "Mã xác nhận tài khoản BlockChain", // Subject line
							text: text // plaintext body
						};
						console.log(mailOptions);
		
						smtpTransport.sendMail(mailOptions, function(error, response) {
							if (error) {
								console.log(error);
							} else {
								console.log("Message sent: " + response.message);
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


module.exports = router;
