'use strict'
const sha224 = require('../keccak.js').sha3_224
const sha256 = require('../keccak.js').sha3_256
const sha384 = require('../keccak.js').sha3_384
const sha512 = require('../keccak.js').sha3_512
const st224 = require('../../other/examp/js-sha3').sha3_224
const st256 = require('../../other/examp/js-sha3').sha3_256
const st384 = require('../../other/examp/js-sha3').sha3_384
const st512 = require('../../other/examp/js-sha3').sha3_512
const funcs = { sha224, sha256, sha384, sha512 }
const st = {'sha224': st224, 'sha256': st256, 'sha384': st384, 'sha512': st512}
const arr = [
	'',
	'test',
	'0x125980789faecad8717',
	'2345678956587118911789',
	'many symbols like this @#$%^&*(&$%^&U&IYBY&!',
	'long long'.repeat(2048)
]

arr.forEach((v, i) => {
	Object.keys(funcs).forEach( funcName => {
		console.log('测试组', i + 1, st[funcName](v) === funcs[funcName](v) ? '通过' : '不通过')
	})
})
