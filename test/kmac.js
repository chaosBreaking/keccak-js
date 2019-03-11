'use strict'
const kmacx128 = require('../derived.js').kmac128
const kmacx256 = require('../derived.js').kmac256
const k128 = require('../../other/examp/js-sha3').kmac128
const k256 = require('../../other/examp/js-sha3').kmac256
const lens = [8, 16, 32, 64, 128, 256, 512, 1024]
const arr = [
  {
    'K': '',
    'X': '',
    'S': ''
  },
  {
    'K': 'a',
    'X': 'a',
    'S': 'a'
  },
  {
    'K': 'aa',
    'X': 'aabb',
    'S': 'aabbcc'
  },
  {
    'K': 'a',
    'X': 'b',
    'S': 'c'
  },
  {
    'K': 'what a test!',
    'X': 'AINTNOMOUNTAINHIGHENOUGH',
    'S': 'AINTNOVALLEYLOWENOUGH'
  },
  {
    'K': 'ok?',
    'X': 'guess so',
    'S': 'come on!'
  },
  {
    'K': 'over',
    'X': 'every thing gonna be ok',
    'S': `you're right`
  }
]
console.log(`------------------------ kmac.js 测试 ------------------------\n`)
let f = true
arr.forEach((v, index) => {
  console.log(`测试集${index + 1}结果`)
  lens.forEach(l => {
    let r2 = k128(v.K, v.X, l, v.S)
    let r1 = kmacx128(v.K, v.X, l, v.S)
    console.log(`长度${l}结果: ${r1 === r2 ? '正确' + r1 : '失败 \n' + r1 + ' \nvs\n' + r2}`)
    if (r1 !== r2) f = false
  })
  console.log(`----------------------------------------------`)
})
console.log(f ? `测试结束并通过 √` : `测试结束，有错误 ×`)
