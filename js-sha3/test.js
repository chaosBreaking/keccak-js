'use strict'
const K = require('./keccak')
let k = new K()
let x = k.keccak_c(448)
console.log((x('hello01', 224)))
// let arr = x('hello01', 224).split('')
// let s = ''
// let count = 0
// while (arr) {
// 	let temp = arr.splice(0, 8)
// 	s += String.fromCodePoint('0x' + temp.join(''))
// }