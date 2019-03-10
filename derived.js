'use strict'
const util = require('./util.js')
const keccak256 = require('./keccak.js').keccak256
const keccak512 = require('./keccak.js').keccak512
const shake128 = require('./keccak.js').shake128
const shake256 = require('./keccak.js').shake256
const funcs = { shake128, shake256, keccak256, keccak512 }
const Rate = {
	128: 168,
	256: 136
}
const enc8 = x => Number(x).toString(2).padStart(8,'0').split('').reverse().join('')
const bytepad = (X, w) => {
	let z = left_encode(w) + X
	z = z && z.length % 8 === 0 ? z : z.padEnd(8 - z.length % 8 + z.length, '0')
	return z.length / 8 % w === 0 ? z : z.padEnd(8 * (w - z.length / 8 % w) + z.length, '00000000')
}
const calOi = (x, n) => {
	let Oi = []
	let res = Number(x)
	for(let i = 1; i <= n; i++) {
		let suf = 2**(8 * (n - i))
		Oi.push((res - res % suf)/ suf)
		res = res % suf
	}
	return Oi.map(v => enc8(v)).join('')
}
const pre_encode = x => {
	let n = x < 255 ? 1 : (Math.log2(x) % 8 === 0 ? Math.log2(x) / 8 + 1 : Math.ceil(Math.ceil(Math.log2(x)) / 8))
	let Oi = calOi(x, n)
	let Ox = enc8(n)
	return [Ox, Oi]
}
const left_encode = x => pre_encode(x).join('')
const right_encode = x => pre_encode(x).reverse().join('')
const encode_string = S => 0 <= S.length && S.length < 2**1023 ? left_encode(S.length) + S : new Error('Invalid input string')

const cShake = type => (X, L, N = '', S = '', option = {}) => {
	if (!Object.keys(funcs).includes(`shake${type}`) || !Object.keys(funcs).includes(`keccak${2 * type}`)) throw new Error('Invalid Function type: ' + type)
	if (S === '' && N === '') return funcs[`shake${type}`](X, L)
	X = Buffer.isBuffer(X) ? util.trans2BitString(X) : util.trans2BitString(Buffer.from(String(X)))
	N = Buffer.isBuffer(N) ? util.trans2BitString(N) : util.trans2BitString(Buffer.from(String(N)))
	S = Buffer.isBuffer(S) ? util.trans2BitString(S) : util.trans2BitString(Buffer.from(String(S)))
	let encodedStr = bytepad(encode_string(N) + encode_string(S), Rate[type])
	return util.bin2hex8(funcs[`keccak${2 * type}`](encodedStr + X + '00', L))
}
const kmac = type => (K, X, L, S = '') => {
	K = util.trans2BitString(Buffer.from(String(K)))
	X = util.trans2BitString(Buffer.from(String(X)))
	S = util.trans2BitString(Buffer.from(String(S)))
	let F = '11010010101100101000001011000010' // util.trans2BitString(Buffer.from('KMAC'))
	let newX = bytepad(encode_string(K), Rate[type]) + X + right_encode(+L)
	let encodedStr = bytepad(encode_string(F) + encode_string(S), Rate[type])
	return util.bin2hex8(funcs[`keccak${2 * type}`](encodedStr + newX + '00', L))
}
module.exports = {
	cShake,
	cshake128: cShake(128),
	cshake256: cShake(256),
	kmac128: kmac(128),
	kmac256: kmac(256),
}
