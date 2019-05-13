'use strict'
const kmacx128 = require('../qDerived.js').kmac128
const kmacx256 = require('../qDerived.js').kmac256
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
    'K': '我',
    'X': '你',
    'S': '他'
  },
  {
    'K': 'aa',
    'X': 'aabb',
    'S': 'aabbcc'
  },
  {
    'K': 'what a test!',
    'X': 'AINTNOMOUNTAINHIGHENOUGH',
    'S': 'AINTNOVALLEYLOWENOUGH'
  },
  {
    'K': '%^&*(*&%&^$&^?',
    'X': '@#@$%^&*(&^%$#^%^{}:{}:?}>}',
    'S': '%^$%&*"{:}?>{}>":>":>$#@^&*!'
  },
  {
    'K': '你'.repeat(512),
    'X': '我'.repeat(512),
    'S': '他'
  },
  {
    'K': 'over',
    'X': 'every thing gonna be ok'.repeat(128),
    'S': `you're right`
  },
  {
    'K': 'over'.repeat(512),
    'X': 'every thing gonna be ok',
    'S': `you're right`
  }
]
console.log(`------------------------ kmac.js 测试 ------------------------\n`)
let f = true
arr.forEach((v, index) => {
  console.log(`测试集${index + 1}`)
  lens.forEach(l => {
    let r2 = k128(v.K, v.X, l, v.S)
    let r1 = kmacx128(v.K, v.X, l, v.S)
    console.log(`KMAC128 输出长度${l}bit: ${r1 === r2 ? '正确, 计算结果：' + r1 : '失败 \n' + r1 + ' \nvs\n' + r2}`)
    let r3 = k256(v.K, v.X, l, v.S)
    let r4 = kmacx256(v.K, v.X, l, v.S)
    console.log(`KMAC128 输出长度${l}bit: ${r3 === r4 ? '正确, 计算结果：' + r3 : '失败 \n' + r3 + ' \nvs\n' + r4}`)
    if (r1 !== r2 || r3 !== r4) f = false
  })
  console.log(`-`.repeat(154))
})
console.log(f ? `测试结束并通过 √` : `测试结束，有错误 ×`)
