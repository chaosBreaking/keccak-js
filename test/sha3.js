'use strict'
const sha224 = require('../qKeccak.js').sha3_224
const sha256 = require('../qKeccak.js').sha3_256
const sha384 = require('../qKeccak.js').sha3_384
const sha512 = require('../qKeccak.js').sha3_512
const st224 = require('../../other/examp/js-sha3').sha3_224
const st256 = require('../../other/examp/js-sha3').sha3_256
const st384 = require('../../other/examp/js-sha3').sha3_384
const st512 = require('../../other/examp/js-sha3').sha3_512
const funcs = { sha224, sha256, sha384, sha512 }
const st = { 'sha224': st224, 'sha256': st256, 'sha384': st384, 'sha512': st512 }
const arr = [
  '',
  '你好',
  'test',
  'hello,世界！',
  '2345678956587118911789',
  'many symbols like this @#$%^&*(&$%^&U&IYBY&!',
  '你好'.repeat(256),
  'abcd'.repeat(256)
]
let f = true
console.log(`------------------------ sha3.js 测试 ------------------------\n`)
arr.forEach((v, i) => {
  console.log(`测试数据 ${i + 1}`)
  Object.keys(funcs).forEach(funcName => {
    let res = st[funcName](v) === funcs[funcName](v)
    console.log(`${funcName}`, res ? '通过' : '不通过', '结果: ', st[funcName](v))
    if (!res) f = false
  })
  console.log('-'.repeat(150))
})
console.log(f ? `测试结束并通过 √` : `测试结束，有错误 ×`)
