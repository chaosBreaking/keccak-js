/* eslint-disable camelcase */
'use strict'
/*
  HMAC(K, M) = H( (K' ^ opad) || H((K' ^ ipad) || m ) )
  H为密码散列函数（如MD5或SHA-1）
  K为密钥（secret key）
  m是要认证的消息
  K'是从原始密钥K导出的另一个秘密密钥（如果K短于散列函数的输入块大小，则向右填充（Padding）零；如果比该块大小更长，则对K进行散列）
  || 代表串接
  ⊕ 代表异或（XOR）
  opad 是外部填充（0x5c5c5c…5c5c，一段十六进制常量）
  ipad 是内部填充（0x363636…3636，一段十六进制常量）
*/
const sha224 = require('./qKeccak.js').sha3_224
const sha256 = require('./qKeccak.js').sha3_256
const sha384 = require('./qKeccak.js').sha3_384
const sha512 = require('./qKeccak.js').sha3_512
const funcs = { sha224, sha256, sha384, sha512 }
const BLOCKSIZE = { 224: 144, 256: 136, 384: 104, 512: 72 }
const padUnit = String.fromCharCode(0)
const ipadUnit = String.fromCharCode(0x36)
const opadUnit = String.fromCharCode(0x5c)
const bufferXOR = (a, b) => {
  if (a.length !== b.length) throw new Error('Cannot handle input with different length')
  let res = ''
  for (let i = 0, length = a.length; i < length; i++) {
    res += String.fromCharCode(a.charCodeAt(i) ^ b.charCodeAt(i))
  }
  return res
}

const str2Buf = S => Buffer.from(S.match(/.{2}/g).map(ele => '0x' + ele))

const hexBytesToString = (hexStr) => { // convert string of hex numbers to a string of chars (eg '616263' -> 'abc').
  return hexStr === '' ? '' : hexStr.match(/.{2}/g).map(byte => String.fromCharCode(parseInt(byte, 16))).join('')
}
const str2hex = str => str.split('').map(ele => ele.charCodeAt(0).toString(16)).join('')
const buf2hex = buf => buf.toString('hex')
function hmac (type = 224) {
  if (!funcs[`sha${type}`]) throw new Error('Invalid function type')
  let hash = funcs[`sha${type}`]
  return (key = '', message = '') => {
    message = unescape(encodeURIComponent(message + ''))
    key = unescape(encodeURIComponent(key + ''))
    if (key.length > BLOCKSIZE[type]) {
      key = hexBytesToString(hash(key))
    }
    let pad = [...Array.from({ length: BLOCKSIZE[type] - key.length }).fill(padUnit)].join('')
    key += pad
    let ipad = [...Array.from({ length: BLOCKSIZE[type] }).fill(ipadUnit)].join('')
    let opad = [...Array.from({ length: BLOCKSIZE[type] }).fill(opadUnit)].join('')
    let i_key_pad = bufferXOR(ipad, key)
    let o_key_pad = bufferXOR(opad, key)
    let temp = i_key_pad + message
    let digest = hexBytesToString(hash(temp, { format: 'utf-8' }))
    return hash(o_key_pad + digest, { format: 'utf-8' })
  }
}

module.exports = {
  hmac224: hmac(224),
  hmac256: hmac(256),
  hmac384: hmac(384),
  hmac512: hmac(512)
}
