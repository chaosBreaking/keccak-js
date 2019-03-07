'use strict'

const util = require('./util.js')
// Round constants
const RC = [
  0x0000000000000001,
  0x0000000000008082,
  0x800000000000808A,
  0x8000000080008000,
  0x000000000000808B,
  0x0000000080000001,
  0x8000000080008081,
  0x8000000000008009,
  0x000000000000008A,
  0x0000000000000088,
  0x0000000080008009,
  0x000000008000000A,
  0x000000008000808B,
  0x800000000000008B,
  0x8000000000008089,
  0x8000000000008003,
  0x8000000000008002,
  0x8000000000000080,
  0x000000000000800A,
  0x800000008000000A,
  0x8000000080008081,
  0x8000000000008080,
  0x0000000080000001,
  0x8000000080008008
]

// Rotation offsets
const r = [
  [0, 36, 3, 41, 18],
  [1, 44, 10, 45, 2],
  [62, 6, 43, 15, 61],
  [28, 55, 25, 21, 56],
  [27, 20, 39, 8, 14]
]

class Keccak {
  constructor (b = 1600) {
    this.init(b)
  }
  init (b = 1600) {
    if (![25, 50, 100, 200, 400, 800, 1600].includes(b)) {
      throw new Error('invalid param b')
    }
    this.b = b
    this.w = b / 25
    this.l = Math.log2(this.w).toFixed(0)
    this.nr = 12 + 2 * this.l
    this.sa = []
    this.q = 0
  }

  /**
   * Convert a String value to a state array A
   *
   * @param {*} string
   * @memberof Keccak
  */
  string2Array (string) {
    let hexStr = Buffer.from(string).toString('hex')
    this.sa = []
    console.log('开始转换--State Array已重置...')
    for (let x = 0; x >= 0 && x < 5; x++) {
      this.sa[x] = this.sa[x] === undefined ? [] : this.sa[x]
      for (let y = 0; y >= 0 && y < 5; y++) {
        this.sa[x][y] = this.sa[x][y] === undefined ? [] : this.sa[x][y]
        for (let z = 0; z >= 0 && z < this.w; z++) {
          let index = this.w * (5 * y + x) + z
          if (typeof hexStr[index] === 'undefined') break
          this.sa[x][y][z] = hexStr[index]
        }
      }
    }
    console.log('转换完成--State Array已填装...')
  }
  /**
   * Convert a state array A to a String value
   *
   * @param {*} 
   * @memberof Keccak
  */
  array2String () {
    let s = ''
    for (let x = 0; x >= 0 && x < 5; x++) {
      this.sa[x] = this.sa[x] === undefined ? [] : this.sa[x]
      for (let y = 0; y >= 0 && y < 5; y++) {
        this.sa[x][y] = this.sa[x][y] === undefined ? [] : this.sa[x][y]
        for (let z = 0; z >= 0 && z < this.w; z++) {
          if (typeof this.sa[x][y][z] === 'undefined') s = s.concat('')
          else s = s.concat(this.sa[x][y][z])
        }
      }
    }
    return Buffer.from(s, 'hex').toString()
  }
  absorb (message, c) {
    this.meta = Buffer.from(message)
    let r = this.b - c
    this.q = (r / 8) - util.mod(message.length, r/8)
  }
  padding() {
    let pad
    switch (this.q) {
      case 1: pad = Buffer.from([0x86]); break
      case 2: pad = Buffer.from([0x06, 0x80]); break
      default: let repCount = this.q - 2;
        pad = Buffer.from([0x06, ...Array(repCount).fill(0), 0x80]); break
    }
    return this.data = Buffer.concat([this.meta, pad])
  }
  rnd (ir) {
    util.map1.call(this)
    util.map2.call(this)
    util.map3.call(this)
    util.map4.call(this)
    util.map5.call(this, ir)
    return this.sa
  }
  rn (i, ir) {
    util['map'+ i].call(this, ir)
  }
  keccak_p (b, nr) {
    // keccak-p[b, nr](S)
    return function(str)  {
      this.string2Array(str)
      for (let ir = 12 + 2 * this.l - nr; ir <= 12 + 2 * this.l - 1; ir++) {
        this.rnd(ir)
      }
      return this.array2String()
    }.bind(this)
  }
  keccak_f (A) {
    this.string2Array(A)
    for (let i = 0; i <= this.nr - 1; i++) {
      this.rnd(A, RC[i])
    }
    return this.array2String()
  }
  sponge(func, pad, r, N, d) {
    // step 1
    /* 
      SPONGE[f, pad, r](N, d)
      c: capacity;
      r: rate;
      pad(x,m): x > 0(int), m >= 0 (int)
    */
    let P = N + pad(r, N.length)
    let n = P.length / r
    let c = this.b - r
    let S = '0'.repeat(this.b)
    for (let i = 0; i < n; i++) {
      S = func(S ^ (P[i] + '0'.repeat(c)))
    }
    let Z = ''
    Z = Z + S.slice(0, r + 1)
    while(1) {
      if (d <= Z) return Z.slice(0, d + 1)
      S = func(S)
    }
  }
  keccak_c (c) {
    // keccak[c] === keccak_p[b, 12+2l], b = 1600
    return function(N, d) {
      return this.sponge( this.keccak_p(this.b, 24), util.pad101, 1600 - c, N, d)
    }.bind(this)
  }
}
// let k = new Keccak(1600)

module.exports = Keccak
