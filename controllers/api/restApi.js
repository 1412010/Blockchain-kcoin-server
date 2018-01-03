var request = require('request');
var express = require('express');
var router = express.Router();
var moment = require('moment');
var accountModel = require('../../models/accountModel');
var confirmAccountCode = require('../../models/confirmAccountCode');
var transactionModel = require('../../models/transactionModel');
var outputModel = require('../../models/outputsModel');
var inputModel = require('../../models/inputsModel');
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
var utils = require('../../fn/utils');
var transactions = require('../../fn/transactions');
var helper = require('../../fn/helper');
const KHOITAO = 'KHỞI TẠO';
const DANGXULY = 'ĐANG XỬ LÝ';
const HOANTHANH = 'HOÀN THÀNH';

//hash nhận tiền từ thầy: d6fd4a290c22190d6c414f51c96a7eb800c1705e83d3931861f562935c1f831c
//outputeindex: 1
//"address":"a32426e59e7a91d1fd90fdbf1b30df20c60756cbbfb8cdc1d21f9131dc674565"
//"privateKey":"2d2d2d2d2d424547494e205253412050524956415445204b45592d2d2d2d2d0a4d4949435777494241414b42675144696b39666b64427254534a3264615345493848484437306d4b495777666a6f6444367a5668472f3534715265684c7145620a4277343764583475706d7a694a54622f676d746a5465374f52622f79644a4e55357a755a393055482b416b4430535346424235346c6a5878344252737543454e0a624e444959574258487742574e6f6143434858623669506769744f4e73544c7a31717947474336725363696a7448536a4b643636347064736b514944415141420a416f4741645a727070364941506f546c6b7376376f716b7a55394644615a673569424f783844594a43664f2b33534266724945496a482f59436c4c4e415366500a516e36776b6d552b6d6c666353574c343437395172665173415a2b4f435276346737376a762b3865744659425644684159526233634b7237544957664d6833320a32617053326b7548723830365554536f3545337355475a50326635774e4b4951626f2f5970574e52663155564d325543515144376d6e54794e644442707776390a7179695071707053437433446b6b69784832314d78456c5075745237452f4e62497a72754433565857535a483845793957692f47536a377431695a69624164670a745568636467686e416b4541356f6c764570733776417241796d2b6b364e6655765669357867312b346d75486267513044374c6e4174626b5a43787738766b4c0a6365556e306949574f62653462666e3731576b6b534573374f58586a5644306f52774a416559724d306244546a716b4f7274542b2f422f792b6f304c516732700a6c663754677845545254504172314163384472646e65445430345661613867576d695932432f6b54327a726e51675a6a726745453272326549774a41505764390a336b6261736b7471376f437550426241343234756a5549712b63514b58704e67436f357357615644554374474b6e474c5374727573466e4438627574744231520a70705a4b773762474835663235516b6c49514a414c2f4e51394466547a652f794577456c6372486f2f626d334831676543444c2f5a69796751794a696a6455310a736f48436f574c77454f4d697177564a596934794d7a4154585975467035354747544844395942544c673d3d0a2d2d2d2d2d454e44205253412050524956415445204b45592d2d2d2d2d0a"
//"publicKey":"2d2d2d2d2d424547494e205055424c4943204b45592d2d2d2d2d0a4d4947664d413047435371475349623344514542415155414134474e4144434269514b42675144696b39666b64427254534a3264615345493848484437306d4b0a495777666a6f6444367a5668472f3534715265684c7145624277343764583475706d7a694a54622f676d746a5465374f52622f79644a4e55357a755a393055480a2b416b4430535346424235346c6a5878344252737543454e624e444959574258487742574e6f6143434858623669506769744f4e73544c7a31717947474336720a5363696a7448536a4b643636347064736b514944415141420a2d2d2d2d2d454e44205055424c4943204b45592d2d2d2d2d0a"
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
							from: "My Block Chain <myauctionwebapp@gmail.com>", // sender address
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


//Lấy thông tin tài khoản
router.get('/Address', function (req, res) {
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

//khởi tạo transaction chờ xác nhận
router.post('/Transaction', function (req, res, next) {
	var inputAddress = req.body.inputAddress;//tài khoản yêu cầu gửi

	const condition = {
		_address: inputAddress
	}
	accountModel.find(condition, function (error, row) {
		if (error) {
			return res.status(400).send("Khởi tạo giao dịch thất bại!");
		}
		if (row.length > 0) {
			var outputAddress = req.body.outputAddress;//địa chỉ nhận
			var value = req.body.value;
			if (value > row[0]._availableBalance) {
				return res.status(400).send("Số tiền rút không đủ!")
			} else {

				const confirmCode = randomstring.generate(10);
				const dateInit = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
				const data = {
					_hash: "",
					_inputAddress: inputAddress,
					_outputAddress: outputAddress,
					_value: value,
					_confirmCode: confirmCode,
					_state: KHOITAO,
					_dateInit: dateInit
				}

				transactionModel.create(data, function (error, row1) {
					if (error) {
						return res.status(400).send("Khởi tạo giao dịch thất bại!")
					} else {
						const email = row[0]._email;
						//gửi mã xác nhận
						var text = "Tài khoản bạn đã yêu cầu thực rút tiền đến tài khoản: " + outputAddress;
						text += "\n " + "Vui lòng xác nhận với mã: " + confirmCode;
						var mailOptions = {
							from: "My Block Chain <myauctionwebapp@gmail.com>", // sender address
							to: email, // list of receivers
							subject: "Mã xác nhận giao dịch BlockChain", // Subject line
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
						const result = {
							mess: "Khởi tạo giao dịch thành công.",
							data: row1
						}
						return res.json(result);
					}
				});
			}
		}
	});

})

//Xác nhận transaction và thực hiện post lên api
router.post('/ConfirmTransaction', function (req, res, next) {

	const confirmCode = req.body.code;
	const condition = {
		_confirmCode: confirmCode
	}
	//Tìm giao dịch có mã xác nhận tương ứng
	transactionModel.find(condition, function (error, row) {
		if (error) {
			return res.status(400).send("Xác thực thất bại!");
		}
		if (row.length > 0) {
			const condition2 = {
				_address: row[0]._inputAddress
			}
			//Tìm tài khoản rút tiền
			accountModel.find(condition2, function (error1, acc) {
				if (error1) {
					return res.status(400).send("Thực hiện giao dịch thất bại!");
				}
				if (acc.length > 0) {
					if (acc[0]._availableBalance < row[0]._value) {//kiểm tra số dư khả dụng
						return res.status(400).send("Thực hiện giao dịch thất bại!");
					} else {
						helper.GetListOutputs(row[0]._value)
							.then(function (result) {
								if (result !== null) {
									console.log(result);
									//Generate transacitons
									let bountyTransaction = {
										version: 1,
										inputs: [],
										outputs: []
									};

									//danh sách input từ output khả dụng
									console.log("test1");
									const outputList = result.resultOutputs;
									outputList.forEach(output => {
										bountyTransaction.inputs.push({
											referencedOutputHash: output._hash,
											referencedOutputIndex: output._index,
											unlockScript: ''
										});
									});
									// // Change because reference output must be use all value
									const change = result.sumValue - row[0]._value;
									if (change > 0) {
										bountyTransaction.outputs.push({
											value: change,
											lockScript: 'ADD ' + 'a32426e59e7a91d1fd90fdbf1b30df20c60756cbbfb8cdc1d21f9131dc674565'
										});
									}
									console.log("test3");
									bountyTransaction.outputs.push({
										value: row[0]._value,
										lockScript: 'ADD ' + row[0]._outputAddress
									});

									console.log(bountyTransaction);
									// Sign
									transactions.sign(bountyTransaction, result.keys);
									console.log(bountyTransaction);
									return res.json(bountyTransaction);
									console.log("test5");
								}
							})
					}
				}
			})
		} else {//không tìm được giao dịch tương ứng
			return res.status(400).send("Xác thực thất bại!");
		}
	})

	// const key = {
	// 	address: row[0]._address,
	// 	privateKey: row[0]._privateKey,
	// 	publicKey: row[0]._publicKey
	// }

	// Generate transacitons
	// let bountyTransaction = {
	// 	version: 1,
	// 	inputs: [],
	// 	outputs: []
	// };
	//Tìm referenceOutputsHashes hợp lệ
	//let keys = [];
	// referenceOutputsHashes.forEach(hash => {
	// 	bountyTransaction.inputs.push({
	// 	  referencedOutputHash: hash,
	// 	  referencedOutputIndex: 0,
	// 	  unlockScript: ''
	// 	});
	// 	keys.push(key);
	//   });

	// bountyTransaction.inputs.push({
	// 	referencedOutputHash: "d6fd4a290c22190d6c414f51c96a7eb800c1705e83d3931861f562935c1f831c",
	// 	referencedOutputIndex: 1,
	// 	unlockScript: ''
	// });
	// keys.push(key);

	// // Change because reference output must be use all value
	// const change = 9900;
	// bountyTransaction.outputs.push({
	// 	value: change,
	// 	lockScript: 'ADD ' + 'a32426e59e7a91d1fd90fdbf1b30df20c60756cbbfb8cdc1d21f9131dc674565'
	// });

	// //Output to all destination 
	// bountyTransaction.outputs.push({
	// 	value: value,
	// 	lockScript: 'ADD ' + outputAddress
	// });
	// console.log(bountyTransaction);
	// // Sign
	// transactions.sign(bountyTransaction, keys);
	// console.log(bountyTransaction);
	// return res.json(bountyTransaction);
	console.log("test2");
})
module.exports = router;
