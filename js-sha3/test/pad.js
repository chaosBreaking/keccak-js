'use strict'
k.init('test',1024)
k.init([0x00,0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x88,0x99,0xaa,0xbb,0xcc,0xdd,0xee,0xff],448)
const k=new (require('./js-sha3/keccak.js'))()
k.init([0xa3,0x2e],448)
k.padding()
k.padSa()

module.exports = function bin2hex (data) {
	let arr = []
	for(let i = 1; ;i++) {
		let byte = data.slice((i - 1) * 8, i * 8)
		if (!byte) break
		arr.push(byte.split('').reverse())
	}
	let res = ''
	for (let count in arr) {
		let num = 0
		if (arr[count].join('') === '00000000') continue
		arr[count].forEach((v, i) => {
			num += +v * 2 ** (7 - i)
		})
		// res += Buffer.from([num]).toString()
		res += num.toString(16)
	}
	return {arr, res}
}
