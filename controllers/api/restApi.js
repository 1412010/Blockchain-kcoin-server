var request = require('request');
var express = require('express');
var router = express.Router();
var moment = require('moment');
var passport = require('passport');
var accountModel = require('../../models/accountModel');
var confirmAccountCode = require('../../models/confirmAccountCode');
var transactionModel = require('../../models/transactionModel');
var outputModel = require('../../models/outputsModel');
var inputModel = require('../../models/inputsModel');
var blockModel = require('../../models/blockModel');
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
			return res.status(500).json({ message: error });
		}

		if (row.length == 0) {
			request('https://api.kcoin.club/generate-address', function (error, response, body) {
				if (error) {
					console.log(error);
					return read.status(500).json({ message: "Register failure" });
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
						return read.status(500).json({ message: "Register failure" });
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
								return read.status(500).json({ message: "Register failure" });
							} else {
								console.log(row1);
							}
						});

						return res.json(row);
					}
				});
			});


		} else {
			return res.status(409).json({ message: "Email existed. Please try another one." })
		}
	});
});


//Lấy thông tin tài khoản
router.get('/address/:address', function (req, res) {
	accountModel.find(req.params.address, function (error, account) {
		if (error) {
			console.log(error);
			return res.status(500).json({ message: error });
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
		return res.status(500).json({ message: "Get infomation failed" });
	})
});


router.post('/ConfirmAccount', function (req, res, next) {
	var condition = {
		_confirmCode: req.body.code
	};
	confirmAccountCode.find(condition, function (error, row) {
		if (error) {
			return res.status(400).json({ message: "Verify unsuccessfully!" })
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
					return res.status(400).json({ message: "Verify unsuccessfully!" })
				} else {
					var mess = {
						message: "Verify successfully",
						address: row1._address
					}
					return res.json(mess);
				}
			});
		}
		else {
			return res.status(400).json({ message: "Invalid code. Please try again." })

		}
	});
});


router.get('/checkLogin', function (req, res, next) {
	//console.log(req.user);
	if (req.isAuthenticated() && req.user) {
		return res.json(req.user);
	}
	else return res.status(401).send("");
});

router.post('/Login',
	passport.authenticate('local.login', { failureRedirect: '/Login', failureFlash: true }),
	function (req, res, next) {
		res.json(req.user);
	}
)
	.get('/Login', function (req, res, next) {
		//console.log(req.flash());
		var msg = req.flash('message')[0];
		console.log(msg);
		res.status(401).json({ message: msg });
	});

router.get('/Logout', function (req, res, next) {
	req.logOut();
	req.session.destroy();
	req.user = req.session = null;
	return res.status(200).send("logout success");
})


router.post('/forgotPassword', function (req, res, next) {
	var newPass = randomstring.generate(6);
	var ePass = crypto.createHash('md5').update(newPass).digest('hex');

	accountModel.findOneAndUpdate({ _email: req.body.email }, { _password: ePass }, { new: true }, function (error, updatedData) {
		if (updatedData) {
			var text = "Mật khẩu mới của bạn là: " + newPass;
			var mailOptions = {
				from: "My Block Chain <myauctionwebapp@gmail.com>", // sender address
				to: req.body.email, // list of receivers
				subject: "Đặt lại mật khẩu cho tài khoản BlockChain", // Subject line
				text: text // plaintext body
			};
			console.log(mailOptions);

			smtpTransport.sendMail(mailOptions, function (error, response) {
				if (error) {
					console.log(error);
				} else {
					console.log("Message sent: " + response.message);
					return res.json(updatedData);
				}
			});
		}
		else {
			console.log("Email không hợp lệ");
			return res.status(500).json({ message: "Invalid Email! Please try again!" });
		}
	})
})


router.get('/transaction/:hash', function (req, res, next) {
	request('https://api.kcoin.club/transactions/' + req.params.hash, function (error, response, body) {
		if (body) {
			var data = JSON.parse(body);
			return res.status(200).json(data);
		}
		console.log(error);
		return read.status(500).json({ message: "Không tìm được transaction" });
	});
})


//khởi tạo transaction chờ xác nhận
router.post('/Transaction', function (req, res, next) {
	if (req.isAuthenticated() && req.user) {
		var inputAddress = req.user.address//tài khoản yêu cầu gửi

		const condition = {
			_address: inputAddress
		}
		accountModel.find(condition, function (error, row) {
			if (error) {
				return res.status(400).json({ message: "Initiate transaction unsuccessfully." });
			}
			if (row.length > 0) {
				var outputAddress = req.body.outputAddress;//địa chỉ nhận
				var value = req.body.value;
				if (value > row[0]._availableBalance) {
					return res.status(400).json({ message: "Unsufficent available balance." })
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
							return res.status(400).json({ message: "Initiate transaction unsuccessfully." })
						} else {
							const email = row[0]._email;
							//gửi mã xác nhận
							var text = "Tài khoản bạn đã yêu cầu thực rút tiền đến tài khoản: " + outputAddress;
							text += "\n " + "Số tiền: " + value;
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
								mess: "Initiate transaction successfully.",
							}
							return res.json(result);
						}
					});
				}
			}
		});
	} else {
		return res.status(403).json({ message: "Please log in first" });
	}

})

//Xác nhận transaction và thực hiện post lên api
router.post('/ConfirmTransaction', function (req, res, next) {
	if (req.isAuthenticated() && req.user) {
		const confirmCode = req.body.code;
		const condition = {
			_confirmCode: confirmCode,
			_state: KHOITAO
		}
		//Tìm giao dịch có mã xác nhận tương ứng
		transactionModel.find(condition, function (error, row) {
			if (error) {
				return res.status(400).json({ message: "Verify unsuccessfully" });
			}
			if (row.length > 0) {
				var ePass = crypto.createHash('md5').update(req.body.password).digest('hex');
				const condition2 = {
					_address: row[0]._inputAddress,
					_password: ePass
				}
				console.log(condition2);
				//Tìm tài khoản rút tiền
				accountModel.find(condition2, function (error1, acc) {
					if (error1) {
						return res.status(400).json({ message: "Verify unsuccessfully" });
					}
					console.log(acc);
					if (acc.length > 0) {
						if (acc[0]._availableBalance < row[0]._value) {//kiểm tra số dư khả dụng
							return res.status(400).json({ message: "Verify unsuccessfully! Unsufficent available balance" });
						} else {
							helper.HandleTransaction(row[0], acc[0])
								.then(function (transaction) {
									if (transaction == null) {
										return res.status(400).json({ message: "Hệ thống hiện tại không đủ output để gửi! Xin thử lại sau!" });
									}
									return res.json(transaction);
								})
						}
					}else {
						return res.status(400).json({ message: "Verify unsuccessfully!" });
					}
				})
			} else {//không tìm được giao dịch tương ứng
				return res.status(400).json({ message: "Verify unsuccessfully!" });
			}
		})
	} else {
		return res.status(403).json({ message: "Chưa đăng nhập!" });
	}

	console.log("test2");
})

router.post('/GetOwnTransactions', function (req, res, next) {
	console.log(req.user);
	if (req.isAuthenticated() && req.user) {
		var condition = {
			$or: [
				{ _inputAddress: req.user.address },
				{ _outputAddress: req.user.address }
			]
		}
		console.log(condition);
		transactionModel.find(condition, null, { sort: { _dateInit: -1 } }, function (err, rows) {
			if (err) {
				console.log(err);
				return res.status(500).json({ message: "Error!" });
			}
			if (rows.length > 0) {
				return res.json(rows);
			} else {
				return res.status(404).json({ message: "No data found" });
			}
		})

	} else {
		return res.status(403).json({ message: "Please log in!" });
	}
})

router.post('/GetSystemTransactions', function (req, res, next) {
	if (req.isAuthenticated() && req.user) {
		if (req.user.role == 0) {
			return res.status(404).json({ message: "You are unauthorized to access this section" });
		} else {
			transactionModel.find({}, null, { sort: { _dateInit: -1 } }, function (err, rows) {
				if (err) {
					console.log(err);
					return res.status(500).json({ message: "Error!" });
				}
				if (rows.length > 0) {
					return res.json(rows);
				} else {
					return res.status(404).json({ message: "No data found!" });
				}
			})
		}
	} else {
		return res.status(403).json({ message: "Chưa đăng nhập!" });
	}
})

router.post('/GetSystemStatistic', function (req, res, next) {
	if (req.isAuthenticated() && req.user) {
		if (req.user.role == 0) {
			return res.status(404).json({ message: "You are unauthorized to access this section!" });
		} else {
			accountModel.find({}, function (err, rows) {
				if (err) {
					console.log(err);
					return res.status(500).json({ message: "Error!" });
				}
				if (rows.length > 0) {
					var sumRealBalance = 0;
					var sumAvailableBalance = 0;
					rows.forEach(acc => {
						sumAvailableBalance += acc._availableBalance;
						sumRealBalance += acc._realBalance;
					})
					const result = {
						numberOfAcc: rows.length,
						sumRealBalance,
						sumAvailableBalance
					}
					return res.json(result);
				} else {
					return res.status(404).json({ message: "No data found" });
				}
			})
		}
	} else {
		return res.status(403).json({ message: "Chưa đăng nhập!" });
	}
})

router.post('/GetAllAccounts', function (req, res, next) {
	if (req.isAuthenticated() && req.user) {
		if (req.user.role == 0) {
			return res.status(404).json({ message: "You are unauthorized to access this section!" });
		} else {
			accountModel.find({}, function (err, rows) {
				if (err) {
					console.log(err);
					return res.status(500).json({ message: "Error!" });
				}
				if (rows.length > 0) {
					return res.json(rows);
				} else {
					return res.status(404).json({ message: "No data found" });
				}
			})
		}
	} else {
		return res.status(403).json({ message: "Chưa đăng nhập!" });
	}
})

router.post('/DeleteTransaction', function (req, res, next) {
	if (req.isAuthenticated() && req.user) {
		const condition = {
			_id: req.body._id,//id transaction
			_state: KHOITAO,
			_inputAddress: req.user.address
		}
		console.log(condition);
		transactionModel.findOneAndRemove(condition, function (err, rows) {
			console.log(rows);
			if (err) {
				console.log(err);
				return res.status(500).json({ message: "Eror!" });
			}
			if (rows != null) {
				const result = {
					mess: "Xóa thành công",
					_id: rows._id
				}
				return res.json(result);
			} else {
				return res.status(404).json({ message: "Unable to delete transaction!" });
			}
		})
	} else {
		return res.status(403).json({ message: "Chưa đăng nhập!" });
	}
})

router.post('/GetAllAddressSystem', function (req, res, next) {
	if (req.isAuthenticated() && req.user) {
		if (req.user.role == 0) {
			return res.status(404).json({ message: "You are unauthorized to access this section!" });
		} else {
			accountModel.find({}, function (err, acccounts) {
				if (err) {
					console.log(err);
					return res.status(500).json({ message: "Eror!" });
				}
				if (acccounts.length > 0) {

					outputModel.find({}, function (err1, outputs) {
						if (err1) {
							return res.status(500).json({ message: "Error!" });
						}
						var result = [];
						if (outputs.length > 0) {
							for (i = 0; i < acccounts.length; i++) {
								var value = 0;
								for (j = 0; j < outputs.length; j++) {
									if (acccounts[i]._address == outputs[j]._output && outputs[j]._canBeUsed == true) {
										value = value + outputs[j]._value;
									}
								}
								console.log("GET ALL ADDRESS SYSTEM " + acccounts[i]._address);
								const data = {
									address: acccounts[i]._address,
									value: value
								}
								result.push(data);
							}
							return res.json(result);
						}
					})

				} else {
					return res.status(404).json({ message: "No data found!" });
				}
			})
		}
	} else {
		return res.status(403).json({ message: "Chưa đăng nhập!" });
	}
})

//Lấy các block từ Blockchain
router.get('/Blocks', function (req, res, next) {
	request('https://api.kcoin.club/blocks', function (error, response, body) {
		if (error) {
			console.log(error);
			return read.status(500).json({ message: "Không thể lấy thông tin các block từ Blockchain" });
		}
		var data = JSON.parse(body);
		console.log(data);
		return res.json(data);
	})
})

router.post('/GenerateTransactionforTest', function (req, res, next) {
	//Generate transacitons
	let bountyTransaction = {
		version: 1,
		inputs: [],
		outputs: []
	};
	//danh sách input từ output khả dụng

	bountyTransaction.inputs.push({
		referencedOutputHash: "d12d0f5370e4390cd751640c732f6f74b8e349267e8c6acafb945fe8d5019c4e",
		referencedOutputIndex: 0,
		unlockScript: ''
	})
	// // Change because reference output must be use all value
	bountyTransaction.outputs.push({
		value: 8700,
		lockScript: 'ADD ' + 'f9284e6961e91cab1e6e822a0391f9610d2bd0d342d6922590d1e363841a6435'
	});

	bountyTransaction.outputs.push({
		value: 200,
		lockScript: 'ADD ' + '6050cac7ddf70a3255ec1ebb90c7de199dc9e5fcc386c039c97cb55f9641b308'
	});

	bountyTransaction.outputs.push({
		value: 200,
		lockScript: 'ADD ' + 'd768b254cdd7435f9ba57b1cb4a8bd1cb6a845d1c672b5559746d0007447ed81'
	});
	var keys = [];
	const key = {
		address: 'f9284e6961e91cab1e6e822a0391f9610d2bd0d342d6922590d1e363841a6435',
		privateKey: '2d2d2d2d2d424547494e205253412050524956415445204b45592d2d2d2d2d0a4d4949435841494241414b4267514365304946316a32386d72775a4d7757304352633379346545686876705135646e766b2b7a4136665353553543643142574e0a4b313746434a3330465a4931757066307175484b353164723454424e6a2b377444527830334e4971726c73584e4c595878625231713831384237516a4b4c65390a5848383145444d713961594f425665724d52364e515462734755346536536c76384b6b31773159593666533948614767644f4743327837654a774944415141420a416f474152455943775a564f4257564d34675a745a494b357a4f614b4d43326b777335746147394259705778544936634a783262766a716333547564472b65430a475a4d4437477a68384b61506b4a4d5966742b58715654766e4367397a35345a6f36746b79456f786c5766693135536145456f5178732f4758524b2f684d576e0a49665749507863424d6a6a4f7a464f4b732f6952756671354c47477a3849705639573949704775714d333851674f45435151444f35706971647670786f73536c0a6577647537434e6335352b4259683664592f727637304b415a4e4d49425258323746454134346776676b504836714370317a2f70326f6b5153555270423170410a324847452b744366416b454178494366394677756d536f35724e514d585442776249397946464d375134436f366c6462646f4a3077546b7239593457627756420a55383657475274514d4c59714241454a37726f2f67534c342b2f77693565666465514a42414c5a73713337686d4d42492b346e4d69436c4e47344432324c53440a68757250464a6f704930474270484156792b41445451697a6c59674f47795652776f62397575532b51737552546a677375323868614459507a354543514261450a66732f7275464e493657384b705a67514d764864786a376141744b4c62632f637a746858767256647264486e784635596864487176487949437270715259704c0a37433131486b33594368776d476f47702f6c454351476b414a6b4f685137474b6a566a7a4c48697244762b72684e4a7061374a2b563332476b705a3245314d770a6e7439654a5469344c573073722f4632684f2f6a315343465644464a514861394c387a49515230624274343d0a2d2d2d2d2d454e44205253412050524956415445204b45592d2d2d2d2d0a',
		publicKey: '2d2d2d2d2d424547494e205055424c4943204b45592d2d2d2d2d0a4d4947664d413047435371475349623344514542415155414134474e4144434269514b4267514365304946316a32386d72775a4d7757304352633379346545680a6876705135646e766b2b7a4136665353553543643142574e4b313746434a3330465a4931757066307175484b353164723454424e6a2b377444527830334e49710a726c73584e4c595878625231713831384237516a4b4c65395848383145444d713961594f425665724d52364e515462734755346536536c76384b6b31773159590a3666533948614767644f4743327837654a774944415141420a2d2d2d2d2d454e44205055424c4943204b45592d2d2d2d2d0a'
	}
	keys.push(key);
	// Sign
	transactions.sign(bountyTransaction, keys);
	return res.json(bountyTransaction);
})

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log("index page");
    return res.render('index');
});

module.exports = router;
