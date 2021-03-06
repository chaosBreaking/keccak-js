'use strict'

const util = require('../util.js')
const KECCAKC_TYPE = [256, 448, 512, 768, 1024]
const SHA3_TYPE = [224, 256, 384, 512]
const SHAKE_TYPE = [128, 256]
class Keccak {
  constructor (b = 1600) {
    if (![25, 50, 100, 200, 400, 800, 1600].includes(b)) {
      throw new Error('invalid param b')
    }
    this.b = b
    this.w = b / 25 // lane size in bit
    this.l = Math.log2(this.w).toFixed(0)
    this.nr = 12 + 2 * this.l
    this.sa = []
    this.q = 0
    this.S = ''
    this.c = 0
  }
  bytePad () {
    let pad
    switch (this.q) {
      case 1: pad = Buffer.from([0x86]); break
      case 2: pad = Buffer.from([0x06, 0x80]); break
      default: let repCount = this.q - 2
        pad = Buffer.from([0x06, ...Array(repCount).fill(0), 0x80]); break
    }
    this.data = Buffer.concat([this.meta, pad])
    return this.data
  }
  bitPad (data) {
    if (typeof data !== 'string') throw new Error('bit填充的输入必须为字符串')
    // 按照pad10*1的规则进行位填充 N为二进制表示的字符串
    let temp = util.pad101(this.b - this.c, data.length)
    // 拼接
    return data + temp
  }
  initSa (str) {
    let sa = [
      [[], [], [], [], []],
      [[], [], [], [], []],
      [[], [], [], [], []],
      [[], [], [], [], []],
      [[], [], [], [], []]
    ]
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        for (let z = 0; z < this.w; z++) {
          sa[x][y][z] = str[this.w * (5 * y + x) + z]
        }
      }
    }
    this.sa = sa
    return sa
  }
  padSaByte (sa = this.sa, data = this.data) {
    this.S = ''
    let laneByteSize = this.w / 8
    for (let x = 0; x < 5; x++) {
      if (!sa[x]) sa[x] = []
      for (let y = 0; y < 5; y++) {
        // 循环计数索引(start from 1) = x * 5 + y + 1
        let index = x * 5 + y + 1
        let bytesLane = data.slice((index - 1) * laneByteSize, index * laneByteSize)
        for (let i = 0; i < bytesLane.length; i++) {
          this.S += bytesLane[i].toString(2).padStart(8, '0').split('').reverse().join('')
        }
        sa[x][y] = bytesLane.reverse()
      }
    }
  }
  trans2BitString (data = this.data) {
    let res = ''
    for (let u of data) {
      res += u.toString(2).padStart(8, '0').split('').reverse().join('')
    }
    return res
  }
  trans2BitStrByLane (data = this.data) {
    let res = ''
    let laneByteSize = this.w / 8
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        // 循环计数索引(start from 1) = x * 5 + y + 1
        let index = x * 5 + y + 1
        let bytesLane = data.slice((index - 1) * laneByteSize, index * laneByteSize)
        for (let i = 0; i < bytesLane.length; i++) {
          res += bytesLane[i].toString(2).padStart(8, '0').split('').reverse().join('')
        }
      }
    }
    return res
  }
  rnd (sa, ir) {
    sa = util.map1.call(this, sa)
    sa = util.map2.call(this, sa)
    sa = util.map3.call(this, sa)
    sa = util.map4.call(this, sa)
    sa = util.map5.call(this, sa, ir)
    return sa
  }
  keccakP (b, nr) {
    return function (str) {
      this.initSa(str)
      for (let ir = 0; ir <= 23; ir++) {
        this.sa = this.rnd(this.sa, ir)
      }
      return util.arr2string(this.sa)
    }.bind(this)
  }
  /*
    SPONGE[f, pad, r](N, d)
    c: capacity;
    r: rate;
    pad(x,m): x > 0(int), m >= 0 (int)
  */
  sponge (func, pad = this.bitPad, r, N, d) {
    // 1
    let P = pad.call(this, N)
    // 2
    let n = ~~(P.length / r)
    // 3
    let c = this.b - r
    // 4
    let PArr = []
    for (let i = 0; ; i++) {
      if (P[i * r] && P[i * r + r]) {
        PArr.push(P.slice(i * r, i * r + r))
      } else {
        PArr.push(P.slice(i * r))
        break
      }
    }
    // 5
    let S = '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    // 6
    for (let i = 0; i < n; i++) {
      let xoredS = util.StrArrXOR(S, (PArr[i] + '0'.repeat(c)))
      S = func.call(this, xoredS)
    }
    // 7
    let Z = ''
    while (1) {
      Z = Z + S.slice(0, r)
      if (d <= Z.length) return Z.slice(0, d)
      S = func.call(this, S)
    }
  }
  keccakC (c) {
    if (!KECCAKC_TYPE.includes(c)) throw new Error('Keccak[c]: Invalid digest length: ', c)
    this.c = c
    return function (N, d) {
      if (typeof N !== 'string') throw new Error('Keccak[c]: Input must be string')
      return this.sponge(this.keccakP(1600, 24), this.bitPad, 1600 - c, N, d)
    }.bind(this)
  }
  /*
    d -> {
      224, 256, 384, 512
    }
    c = 2d
  */
  sha3 (d) {
    if (!SHA3_TYPE.includes(d)) throw new Error('SHA3: Invalid digest length: ', d)
    return function (m) {
      m = Buffer.isBuffer(m) ? this.trans2BitString(m) : this.trans2BitString(Buffer.from(String(m)))
      return util.bin2hex8(this.keccakC(2 * d)(m + '01', d))
    }.bind(this)
  }
  /*
    d -> {
      128, 256
    }
    c = 2d
  */
  shake (d) {
    if (!SHAKE_TYPE.includes(d)) throw new Error('SHAKE: Invalid digest length: ', d)
    return function (m, outLength = 2 * d) {
      if (!Number.isSafeInteger(+outLength)) throw new Error('SHAKE: Invalid output length')
      m = Buffer.isBuffer(m) ? this.trans2BitString(m) : this.trans2BitString(Buffer.from(String(m)))
      return util.bin2hex8(this.keccakC(2 * d)(m + '1111', +outLength))
    }.bind(this)
  }
}

module.exports = {
  keccak256: new Keccak().keccakC(256),
  keccak512: new Keccak().keccakC(512),
  sha3_224: (() => new Keccak().sha3(224))(),
  sha3_256: (() => new Keccak().sha3(256))(),
  sha3_384: (() => new Keccak().sha3(384))(),
  sha3_512: (() => new Keccak().sha3(512))(),
  shake128: (() => new Keccak().shake(128))(),
  shake256: (() => new Keccak().shake(256))()
}
