

const { randomBytes } = require('crypto');
const ecdsa = require('secp256k1'); //elliptic')

// generate message to sign
const msg = randomBytes(32);

// generate privKey
let privKey
do {
    privKey = randomBytes(32);
} while (!ecdsa.privateKeyVerify(privKey))

// get the public key in a compressed format
const pubKey = ecdsa.publicKeyCreate(privKey);

// sign the message
const signObj = ecdsa.sign(msg, privKey);

// verify the signature
console.log(ecdsa.verify(msg, signObj.signature, pubKey)); // should be True

