'use strict'

const pad101 = require('../util.js').pad101
const str = '00112233445566778899AABBCCDDEEFF'
const padtemp = pad101(1152, Buffer.from(str, 'hex').length * 8)
console.log(`填充体:---\n ${padtemp} \n`)
// const P = str + padtemp
// console.log(`结果： \n ${(P + padtemp).length}`)
