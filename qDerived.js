/* eslint-disable camelcase */
'use strict'
const Keccak = require('./qKeccak.js').keccakC
const shake128 = require('./qKeccak.js').shake128
const shake256 = require('./qKeccak.js').shake256
const funcs = { shake128, shake256 }
const Rate = {
  128: 168,
  256: 136
}
const enc8 = x => String.fromCharCode(+x)
const calOi = (x, n) => {
  let Oi = []
  let res = x
  for (let i = 1; i <= n; i++) {
    let suf = 2 ** (8 * (n - i))
    Oi.push((res - res % suf) / suf)
    res = res % suf
  }
  return Oi.map(v => enc8(v)).join('')
}
const pre_encode = x => {
  let t = Math.log2(x)
  let n = x < 255 ? 1 : (t % 8 === 0 ? t / 8 + 1 : Math.ceil(Math.ceil(t) / 8))
  let Oi = calOi(x, n)
  let Ox = enc8(n)
  return [Ox, Oi]
}
const left_encode = x => pre_encode(x).join('')
const right_encode = x => pre_encode(x).reverse().join('')
const encode_string = S => S.length >= 0 && Number.isSafeInteger(S.length)
  ? left_encode(S.length * 8) + S
  : new Error('Invalid input string')
const bytepad = (X, w) => {
  let z = left_encode(w) + X
  let pad = String.fromCharCode(0)
  let zLen = z.length
  return zLen % w === 0 ? z : z.padEnd(w - zLen % w + zLen, pad)
}

const cShake = type => (X, L, N = '', S = '', option = {}) => {
  if (!Number.isSafeInteger(L)) throw new Error('Invalid Input L')
  if (S === '' && N === '') return funcs[`shake${type}`](X, L)
  X = unescape(encodeURIComponent(X + ''))
  N = unescape(encodeURIComponent(N + ''))
  S = unescape(encodeURIComponent(S + ''))
  let encodedStr = bytepad(encode_string(N) + encode_string(S), Rate[type])
  let M = encodedStr + X
  return Keccak(2 * type, M, L, { padType: 'kmac', format: 'utf-8' })
}
const kmac = type => (K, X, L, S = '') => {
  if (!Number.isSafeInteger(L)) throw new Error('Invalid Input L')
  K = unescape(encodeURIComponent(K + ''))
  X = unescape(encodeURIComponent(X + ''))
  S = unescape(encodeURIComponent(S + ''))
  let newX = bytepad(encode_string(K), Rate[type]) + X + right_encode(+L)
  let encodedStr = bytepad(encode_string('KMAC') + encode_string(S), Rate[type])
  let M = encodedStr + newX
  return Keccak(2 * type, M, L, { padType: 'kmac', format: 'utf-8' })
}
module.exports = {
  cShake,
  cshake128: cShake(128),
  cshake256: cShake(256),
  kmac128: kmac(128),
  kmac256: kmac(256)
}
