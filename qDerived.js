/* eslint-disable camelcase */
'use strict'
const util = require('./util.js')
const Keccak = require('./qKeccak.js').keccakC
const shake128 = require('./qKeccak.js').shake128
const shake256 = require('./qKeccak.js').shake256
const funcs = { shake128, shake256 }
const Rate = {
  128: 168,
  256: 136
}
const enc8 = x => Number(x).toString(2).padStart(8, '0').split('').reverse().join('')
const calOi = (x, n) => {
  let Oi = []
  let res = Number(x)
  for (let i = 1; i <= n; i++) {
    let suf = 2 ** (8 * (n - i))
    Oi.push((res - res % suf) / suf)
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
const encode_string = S => S.length >= 0 && S.length < 2 ** 1023 ? left_encode(S.length) + S : new Error('Invalid input string')
const bytepad = (X, w) => {
  let z = left_encode(w) + X
  z = z && z.length % 8 === 0 ? z : z.padEnd(8 - z.length % 8 + z.length, '0')
  return z.length / 8 % w === 0 ? z : z.padEnd(8 * (w - z.length / 8 % w) + z.length, '00000000')
}

const trans2String = str => str.match(/.{8}/g).map(byteArr => String.fromCharCode(parseInt(byteArr.split('').reverse().join(''), 2))).join('')

const bitPad = (data, b, c) => {
  if (typeof data !== 'string') throw new Error('bit填充的输入必须为字符串')
  // 按照pad10*1的规则进行位填充 N为二进制表示的字符串
  let temp = util.pad101(b - c, data.length)
  // 拼接
  return data + temp
}
const cShake = type => (!funcs[`shake${type}`] || !funcs[`keccak${2 * type}`])
  ? new Error('Invalid Function type: ' + type) : (X, L, N = '', S = '', option = {}) => {
    if (!Number.isSafeInteger(L)) throw new Error('Invalid Input L')
    if (S === '' && N === '') return funcs[`shake${type}`](X, L)
    X = Buffer.isBuffer(X) ? util.trans2BitString(X) : util.trans2BitString(Buffer.from(String(X)))
    N = Buffer.isBuffer(N) ? util.trans2BitString(N) : util.trans2BitString(Buffer.from(String(N)))
    S = Buffer.isBuffer(S) ? util.trans2BitString(S) : util.trans2BitString(Buffer.from(String(S)))
    let encodedStr = bytepad(encode_string(N) + encode_string(S), Rate[type])
    let M = encodedStr + X + '00'
    M = trans2String(bitPad(M, 1600, 2 * type))
    return funcs[`keccak${2 * type}`](M, L, { padType: 'nopad', format: 'utf-8' })
  }
const kmac = type => (K, X, L, S = '') => {
  if (!Number.isSafeInteger(L)) throw new Error('Invalid Input L')
  K = util.trans2BitString(Buffer.from(String(K)))
  X = util.trans2BitString(Buffer.from(String(X)))
  S = util.trans2BitString(Buffer.from(String(S)))
  let F = '11010010101100101000001011000010' // util.util.trans2BitString(Buffer.from('KMAC'))
  let newX = bytepad(encode_string(K), Rate[type]) + X + right_encode(+L)
  let encodedStr = bytepad(encode_string(F) + encode_string(S), Rate[type])
  let M = encodedStr + newX + '00'
  M = trans2String(bitPad(M, 1600, 2 * type))
  return Keccak(2 * type, M, L, { padType: 'nopad', format: 'utf-8' })
}
module.exports = {
  cShake,
  cshake128: cShake(128),
  cshake256: cShake(256),
  kmac128: kmac(128),
  kmac256: kmac(256)
}
