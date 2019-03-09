'use strict'
const sha224 = require('../keccak.js').sha3_224
const sha256 = require('../keccak.js').sha3_256
const sha384 = require('../keccak.js').sha3_384
const sha512 = require('../keccak.js').sha3_512
const funcs = { sha224, sha256, sha384, sha512 }

let arr = new Map()
arr.set('', {'sha224': '6b4e03423667dbb73b6e15454f0eb1abd4597f9a1b078e3f5b5a6bc7',
	'sha256': 'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a',
	'sha384': '0c63a75b845e4f7d01107d852e4c2485c51a50aaaa94fc61995e71bbee983a2ac3713831264adb47fb6bd1e058d5f004',
	'sha512': 'a69f73cca23a9ac5c8b567dc185a756e97c982164fe25859e0d1dcc1475c80a615b2123af1f5f94c11e3e9402c3ac558f500199d95b6d3e301758586281dcd26'
})
arr.set('test', {'sha224': '3797bf0afbbfca4a7bbba7602a2b552746876517a7f9b7ce2db0ae7b',
	'sha256': '36f028580bb02cc8272a9a020f4200e346e276ae664e45ee80745574e2f5ab80',
	'sha384': 'e516dabb23b6e30026863543282780a3ae0dccf05551cf0295178d7ff0f1b41eecb9db3ff219007c4e097260d58621bd',
	'sha512': '9ece086e9bac491fac5c1d1046ca11d737b92a2b2ebd93f005d7b710110c0a678288166e7fbe796883a4f2e9b3ca9f484f521d0ce464345cc1aec96779149c14'
})
arr.set('00112233445566778899aabbccddeeff', {'sha224': 'b14e654dc62f21e26c3448fdfda6db967589e4c74fe7d7a0883a59c1',
	'sha256': '05079ffa5a3024b9424595e8940b640ee9221a1172c71fd00feb627ebd7dd3d3',
	'sha384': '7345c5b6475e71f213fab11f269984b0f8f80163c6c6eab43bd6dfcdeeb02afc94bedc0c6307ade38f87ecc06449550e',
	'sha512': '0a7676c7f5d1f9624d40aa960eaa0e0520c196c0aa95eb7173338cc91f9a9b417f6b4f7f56dfc2527f10b995bda73f02bdf08d9327a29c1fe9814f90658f8665'
})

for (let func of Object.keys(funcs)) {
	arr.forEach((v, k) => {
		console.log(func + ': ', v[func] === funcs[func](k) ? '通过' : '不通过')
	})
}