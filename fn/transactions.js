var utils = require('./utils');

// Convert a transaction to binary format for hashing or checking the size
let toBinary = function (transaction, withoutUnlockScript) {
    let version = Buffer.alloc(4);
    version.writeUInt32BE(transaction.version);
    let inputCount = Buffer.alloc(4);
    inputCount.writeUInt32BE(transaction.inputs.length);
    let inputs = Buffer.concat(transaction.inputs.map(input => {
        // Output transaction hash
        let outputHash = Buffer.from(input.referencedOutputHash, 'hex');
        // Output transaction index
        let outputIndex = Buffer.alloc(4);
        // Signed may be -1
        outputIndex.writeInt32BE(input.referencedOutputIndex);
        let unlockScriptLength = Buffer.alloc(4);
        // For signing
        if (!withoutUnlockScript) {
            // Script length
            unlockScriptLength.writeUInt32BE(input.unlockScript.length);
            // Script
            let unlockScript = Buffer.from(input.unlockScript, 'binary');
            return Buffer.concat([outputHash, outputIndex, unlockScriptLength, unlockScript]);
        }
        // 0 input
        unlockScriptLength.writeUInt32BE(0);
        return Buffer.concat([outputHash, outputIndex, unlockScriptLength]);
    }));
    let outputCount = Buffer.alloc(4);
    outputCount.writeUInt32BE(transaction.outputs.length);
    let outputs = Buffer.concat(transaction.outputs.map(output => {
        // Output value
        let value = Buffer.alloc(4);
        value.writeUInt32BE(output.value);
        // Script length
        let lockScriptLength = Buffer.alloc(4);
        lockScriptLength.writeUInt32BE(output.lockScript.length);
        // Script
        let lockScript = Buffer.from(output.lockScript);
        return Buffer.concat([value, lockScriptLength, lockScript]);
    }));
    return Buffer.concat([version, inputCount, inputs, outputCount, outputs]);
};
exports.toBinary = toBinary;

// Sign transaction
let sign = function (transaction, keys) {
    console.log(transaction);
    console.log(keys);
    let message = toBinary(transaction, true);
    console.log("Test1");
    transaction.inputs.forEach((input, index) => {
        console.log("Test2");
        let key = keys[index];
        let signature = utils.sign(message, key.privateKey);
        console.log("Test3");
        // Genereate unlock script
        input.unlockScript = 'PUB ' + key.publicKey + ' SIG ' + signature;
    });
};
exports.sign = sign;
