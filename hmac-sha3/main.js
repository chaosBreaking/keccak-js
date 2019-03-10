'use strict'
/*
	HMAC(K, M) = H( (K' ^ opad) || H((K' ^ ipad) || m ) )
	H为密码散列函数（如MD5或SHA-1）
	K为密钥（secret key）
	m是要认证的消息
	K'是从原始密钥K导出的另一个秘密密钥（如果K短于散列函数的输入块大小，则向右填充（Padding）零；如果比该块大小更长，则对K进行散列）
	|| 代表串接
	⊕ 代表异或（XOR）
	opad 是外部填充（0x5c5c5c…5c5c，一段十六进制常量）
	ipad 是内部填充（0x363636…3636，一段十六进制常量）
*/
const sha224 = require('../js-sha3/keccak.js').sha3_224
const sha256 = require('../js-sha3/keccak.js').sha3_256
const sha384 = require('../js-sha3/keccak.js').sha3_384
const sha512 = require('../js-sha3/keccak.js').sha3_512
const funcs = { sha224, sha256, sha384, sha512 }
const BLOCKSIZE = 144
const bufferXOR = (a, b) => {
	if (!(Buffer.isBuffer(a) && Buffer.isBuffer(b))) throw new Error('Unsupport format of input')
	if (a.length !== b.length) throw new Error('Cannot handle input with different length')
	for (let i = 0; i < a.length; i++) {
		a[i] ^= b[i]
	}
	return a
}
function hmac (type = 224) {
	let hash = funcs[`sha${type}`]
	return (key, message) => {
		message = Buffer.from(String(message))
		key = Buffer.from(String(key))
		key = key.length > BLOCKSIZE ?  hash(message) : Buffer.concat([key, Buffer.from([...Array(BLOCKSIZE - key.length).fill(0)])])
		let ipad = Buffer.from([...Array(BLOCKSIZE).fill(0x36)])
		let opad = Buffer.from([...Array(BLOCKSIZE).fill(0x5c)])
		let i_key_pad = bufferXOR(ipad, key)
		let o_key_pad = bufferXOR(opad, key)
		return hash(Buffer.concat( [o_key_pad, Buffer.from(hash(Buffer.concat([i_key_pad, message])))] ))
	}
}

module.exports = hmac
