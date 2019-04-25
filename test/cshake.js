'use strict'
const cshake128 = require('../qDerived.js').cshake128
const cshake256 = require('../qDerived.js').cshake256
const c128 = require('../../other/examp/js-sha3').cshake128
const c256 = require('../../other/examp/js-sha3').cshake256
const lens = [8, 16, 32, 64, 128, 256, 512, 1024]
const arr = [
  {
    'X': '',
    'N': '',
    'S': ''
  },
  {
    'X': 'a',
    'N': 'a',
    'S': 'a'
  },
  {
    'X': 'aa',
    'N': 'aabb',
    'S': 'aabbcc'
  },
  {
    'X': 'a',
    'N': 'b',
    'S': 'c'
  },
  {
    'X': 'what a test!',
    'N': 'AINTNOMOUNTAINHIGHENOUGH',
    'S': 'AINTNOVALLEYLOWENOUGH'
  },
  {
    'X': 'ok?',
    'N': 'guess so',
    'S': 'come on!'
  },
  {
    'X': 'every thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be ok',
    'N': 'am i right?',
    'S': `you're right!`
  },
  {
    'X': 'every thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be ok',
    'N': 'every thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be ok',
    'S': 'every thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be okevery thing gonna be ok'
  }
]
let f = true
console.log(`------------------------ cshake.js 测试 ------------------------\n`)
arr.forEach((v, index) => {
  console.log(`测试集${index + 1}结果`)
  lens.forEach(l => {
    let r1 = cshake128(v.X, l, v.N, v.S)
    let r2 = c128(v.X, l, v.N, v.S)
    if (r1 === r2) console.log(`[shake128]长度${l} 结果正确`)
    else {
      console.log(`[shake128]长度${l} 结果错误\n${r1}\n${r2}`)
      f = false
    }
  })
  lens.forEach(l => {
    let r1 = cshake256(v.X, l, v.N, v.S)
    let r2 = c256(v.X, l, v.N, v.S)
    if (r1 === r2) console.log(`[shake256]长度${l} 结果正确`)
    else {
      console.log(`[shake256]长度${l} 结果错误\n${r1}\n${r2}}`)
      f = false
    }
  })
  console.log(`-----------------------------------------------\n`)
})
console.log(f ? `测试结束并通过 √` : `测试结束，有错误 ×`)
