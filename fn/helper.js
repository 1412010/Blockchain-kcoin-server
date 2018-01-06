var Q = require('q');
var outputModel = require('../models/outputsModel');
var inputModel = require('../models/inputsModel');
var accountModel = require('../models/accountModel');
var transationModel = require('../models/transactionModel');
var transactions = require('../fn/transactions');
var request = require('request');
var moment = require('moment');
const KHOITAO = 'KHỞI TẠO';
const DANGXULY = 'ĐANG XỬ LÝ';
const HOANTHANH = 'HOÀN THÀNH';

let GetListOutputs = function (value) {
    var deferred = Q.defer();
    outputModel.find({}, function (error, rows) {
        if (error) {
            deferred.resolve(null);
        }
        if (rows.length > 0) {
            var outputs = [];
            var sumValue = 0;
            var biggerOutput = null;
            //tìm mảng output thích hợp
            rows.forEach(output => {
                if (output._canBeUsed === true) {
                    if (output._value < value) {//thêm các output có value nhỏ sao cho tổng lớn hơn hoặc bằng số tiền cần chuyển
                        outputs.push(output);
                        sumValue += output._value;
                        if (sumValue >= value) {
                            return;
                        }
                    } else if (output._value >= value) {//lưu output có value lớn hơn hoặc bằng số tiền cần chuyển
                        if (biggerOutput == null || biggerOutput._value > output._value) {
                            biggerOutput = output
                        }
                    }
                }
            });
            if (sumValue < value && biggerOutput == null) {//nếu tổng các giá trị output nhỏ bé hơn giá trị và không có output lớn hơn giá trị
                deferred.resolve(null);
            } else {//hoặc là sumValue >= vaule hoặc biggerOutput != null
                var resultOutputs = [];
                if (sumValue < value) {//trả về biggerOutput nếu tổng các output nhỏ không đủ
                    resultOutputs.push(biggerOutput);
                    sumValue = biggerOutput._value;
                } else {
                    resultOutputs = outputs;
                }

                GetKeysFromOutput(resultOutputs)
                    .then(function (keys) {
                        const data = {
                            resultOutputs,
                            keys,
                            sumValue
                        }
                        deferred.resolve(data);
                    })
            }

        } else {
            deferred.resolve(null);
        }

    })
    return deferred.promise;
}

exports.GetListOutputs = GetListOutputs;

let HandleTransaction = function (transaction, acc) {
    var deferred = Q.defer();
    GetListOutputs(transaction._value)
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
                const change = result.sumValue - transaction._value;
                if (change > 0) {
                    bountyTransaction.outputs.push({
                        value: change,
                        lockScript: 'ADD ' + 'a32426e59e7a91d1fd90fdbf1b30df20c60756cbbfb8cdc1d21f9131dc674565'
                    });
                }

                bountyTransaction.outputs.push({
                    value: transaction._value,
                    lockScript: 'ADD ' + transaction._outputAddress
                });
                // Sign
                transactions.sign(bountyTransaction, result.keys);
                console.log(bountyTransaction);
                //request post transaction
                var url = 'https://api.kcoin.club/transactions';
                var options = {
                    method: 'post',
                    body: bountyTransaction,
                    json: true,
                    url: url
                }
                request(options, function (err, res, body) {
                    if (err) {
                        console.error('error posting json: ', error);
                        return deferred.resolve(null);
                    } else {
                        console.log(res);       
                        const resBody = res.body;
                        console.log(resBody);
                        const transHash = resBody.hash;
                        console.log(transHash);
                        //cập nhật số dư hiện tại và số dư khả dụg
                        const dataAccount = {
                            _availableBalance: acc._availableBalance - result.sumValue,
                            _realBalance: acc._realBalance - transaction._value
                        }
                        const condition = {
                            _id: acc._id
                        }
                        accountModel.findOneAndUpdate(condition, dataAccount, { new: true }, function (error, rows) {
                            console.log(rows);
                        })
                        //kết thúc cập nhật số dư

                        //cập nhật transaction đang xử lý
                        const condition2 = {
                            _id: transaction._id
                        }
                        const dateSuccess = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                        const dataTrans = {
                            _state: DANGXULY,
                            _hash: transHash,
                            _dateSuccess: dateSuccess
                        }
                        transationModel.findOneAndUpdate(condition2, dataTrans, { new: true }, function (error, updatedTrans) {
                            console.log(updatedTrans);
                        })
                        //kết thúc cập nhật transaction

                        //cập nhật outputs 
                        outputList.forEach(output => {
                            const conditionOuput = {
                                _hash: output._hash,
                                _output: output._output,
                                _index: output._index,
                            }
                            const updateDataOutput = {
                                _canBeUsed: false
                            }
                            outputModel.findOneAndUpdate(conditionOuput, updateDataOutput, 
                                {new: true}, function(error, updateOutput) {
                                    console.log(updateOutput);
                                })
                        });

                        //thêm input vào csdl
                        console.log( resBody.inputs);
                        const inputList =  resBody.inputs;
                        console.log(inputList);
                        for(i = 0 ; i < inputList.length; i++)
                        {
                            console.log(inputList[i]);
                            const newInputData = {
                                _hash: transHash,
                                _referencedOutputHash: inputList[i].referencedOutputHash,
                                _referencedOutputIndex: inputList[i].referencedOutputIndex
                            }
                            inputModel.create(newInputData, function(error, newInput){
                                console.log(newInput);
                            })
                        }             
                        // resBody.inputs.forEach(intput => {
                        //     const newInputData = {
                        //         _hash: transHash,
                        //         _referencedOutputHash: input.referencedOutputHash,
                        //         _referencedOutputIndex: input.referencedOutputIndex
                        //     }
                        //     inputModel.create(newInputData, function(error, newInput){
                        //         console.log(newInput);
                        //     })
                        // })
                        return deferred.resolve(resBody);
                    }
                })  
            }
        })
    return deferred.promise;
}

exports.HandleTransaction = HandleTransaction;

//Tìm keys tương ứng với danh sách outputs cần dùng (địa chỉ nằm trong hệ thống)
let GetKeysFromOutput = function (outputs) {
    var deferred = Q.defer();
    const keys = [];
    accountModel.find({}, function (error, rows) {
        if (error) {
            return deferred.resolve(null);
        }
        if (rows.length > 0) {

            for (i = 0; i < outputs.length; i++) {
                for (j = 0; j < rows.length; j++) {
                    if (outputs[i]._output === rows[j]._address) {
                        const key = {
                            address: rows[j]._address,
                            privateKey: rows[j]._privateKey,
                            publicKey: rows[j]._publicKey
                        }
                        keys.push(key);
                        break;
                    }
                }
            }
            return deferred.resolve(keys);

        }
    });

    return deferred.promise;
}

// exports.OutputCanBeUsed = function(outputs) {
//     var deferred = Q.defer();
//     //kiểm tra output có được dùng trong các transaction trước hay không
//     const condition = {
//         $and :[
//             {_referencedOutputHash: outputs._hash},
//             {_referencedOutputIndex: outputs._index}
//         ]
//     }
//     inputModel.find(condition, function(error, rows) {
//         if(error) {
//             return deferred.resolve(false);
//         }
//         if(rows.length > 0) {
//             return deferred.resolve(false);
//         }else {
//             return deferred.resolve(true);
//         }
//     })
//     return deferred.promise;
// }