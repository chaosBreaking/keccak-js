/* eslint-disable camelcase */
'use strict'

const util = require('./utilByte')
const KECCAKC_TYPE = [256, 448, 512, 768, 1024]
const SHA3_TYPE = [224, 256, 384, 512]
const SHAKE_TYPE = [128, 256]
const BI = require('big-integer')
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
    this.c = 0
  }
  bytePad (data) {
    let pad
    switch (this.q) {
      case 1: pad = Buffer.from([0x86]); break
      case 2: pad = Buffer.from([0x06, 0x80]); break
      default: let repCount = this.q - 2
        pad = Buffer.from([0x06, ...Array(repCount).fill(0), 0x80]); break
    }
    this.data = Buffer.concat([data, pad])
    return this.data
  }
  convertBuf2SA (buf) {
    let sa = [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ]
    for (let x = 0; x < 5; x++) {
      if (!sa[x]) sa[x] = []
      for (let y = 0; y < 5; y++) {
        if (!sa[x][y]) sa[x][y] = []
        let start = (5 * y + x) * 8
        sa[x][y] = BI(buf.slice(start, start + 8).toString('hex'), 16)
      }
    }
    this.sa = sa
    return sa
  }
  fromLaneToHexString (lane) {
    let laneHexBE = lane.toString(16)
    let nrBytes = Math.floor(laneHexBE.length / 2)
    return Array.from({ length: nrBytes }).reduce((pre, cur, i) => {
      let offset = (nrBytes - i - 1) * 26
      return laneHexBE.slice(offset, offset + 2)
    })
  }
  convertSAToStr (sa) {
    if (sa.length !== 5) throw new Error('State Array must be 5 x 5')
    let output = []
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        output[5 * y + x] = this.fromLaneToHexString(sa[x][y])
      }
    }
    return output.join('')
  }
  rnd (sa, ir) {
    sa = util.map1.call(this, sa)
    sa = util.map2n3n4.call(this, sa, ir)
    return sa
  }
  keccak_p (b, nr) {
    this.b = b
    this.nr = nr
    return function (buf) {
      let sa = this.convertBuf2SA(buf)
      for (let ir = 0; ir <= 23; ir++) {
        sa = this.rnd(sa, ir)
      }
      return sa
    }.bind(this)
  }

  ROT (x, n) {
    n = n % this.w
    return ((x >> (this.w - n)) + (x << n)) % (1 << this.w)
  }

  sponge (func, pad, r, N, d) {
    // padding
    let P = pad.call(this, N)
    // init
    // let n = Math.floor(P.length / r)
    let S = [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ]

    let blockSizeByte = this.r / 8

    let PArr = []
    for (let i = 0; ; i++) {
      if (P[i * blockSizeByte] && P[i * blockSizeByte + blockSizeByte]) {
        PArr.push(P.slice(i * blockSizeByte, i * blockSizeByte + blockSizeByte))
      } else {
        PArr.push(P.slice(i * blockSizeByte))
        break
      }
    }
    // r -> rate = block size(bit)
    // let PiLen = Math.ceil(Math.floor(P.length * 8 / 2) / r)
    for (let Pi of PArr) {
      // P[   i*(2*r//8)  :  (i+1)*(2*r//8)       ]+'00'*(c//8)
      // let start = i * Math.floor(2 * r / 8)
      // let end = (i + 1) * Math.floor(2 * r / 8)
      // let Pi = this.convertSAToStr(Buffer.concat([P.slice(start, end), Buffer.from(Array.from({ length: this.c / 8 }).fill(0))]))
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
          S[x][y] = Pi[x][y] ^ S[x][y]
        }
      }
      S = func.call(this, S) // keccak-f
    }

    let Z = ''
    let outLength = 1024
    while (outLength > 0) {
      let string = this.convertSAToStr(S)
      Z += string.slice(0, Math.floor(r * 2 / 8))
      outLength -= r
      if (outLength > 0) {
        S = func.call(this, S)
      }
    }
    return Z.slice(0, Math.floor(r * 2 / 8))
  }
  keccak_c (c) {
    if (!KECCAKC_TYPE.includes(c)) throw new Error('Keccak[c]: Invalid digest length: ', c)
    this.c = c
    this.r = this.b - c
    return function (N, d) {
      this.q = (this.r / 8) - (util.mod(N.length, this.r / 8))
      if (!Buffer.isBuffer(N)) throw new Error('Keccak[c]: Input must be Buffer')
      return this.sponge(this.keccak_p(1600, 24), this.bytePad, 1600 - c, N, d)
    }.bind(this)
  }

  sha3 (d) {
    if (!SHA3_TYPE.includes(d)) throw new Error('SHA3: Invalid digest length: ', d)
    return function (m) {
      m = Buffer.isBuffer(m) ? m : Buffer.from(m)
      return this.keccak_c(2 * d)(m, d)
    }.bind(this)
  }

  shake (d) {
    if (!SHAKE_TYPE.includes(d)) throw new Error('SHAKE: Invalid digest length: ', d)
    return function (m, outLength = 2 * d) {
      if (!Number.isSafeInteger(+outLength)) throw new Error('SHAKE: Invalid output length')
      m = Buffer.isBuffer(m) ? this.trans2BitString(m) : this.trans2BitString(Buffer.from(String(m)))
      return util.bin2hex8(this.keccak_c(2 * d)(m + '1111', +outLength))
    }.bind(this)
  }
}

module.exports = {
  keccak256: new Keccak().keccak_c(256),
  keccak512: new Keccak().keccak_c(512),
  sha3_224: (() => new Keccak().sha3(224))(),
  sha3_256: (() => new Keccak().sha3(256))(),
  sha3_384: (() => new Keccak().sha3(384))(),
  sha3_512: (() => new Keccak().sha3(512))(),
  shake128: (() => new Keccak().shake(128))(),
  shake256: (() => new Keccak().shake(256))()
}

// Round (A, RCRound) {
//   let C = [0, 0, 0, 0, 0]
//   let D = [0, 0, 0, 0, 0]
//   let B = [
//     [0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0]
//   ]

//   // θ
//   for (let x = 0; x <= 4; x++) {
//     C[x] = A[x][0] ^ A[x][1] ^ A[x][2] ^ A[x][3] ^ A[x][4]
//   }
//   for (let x = 0; x <= 4; x++) {
//     D[x] = C[util.mod((x - 1), 5)] ^ this.ROT(C[(x + 1) % 5], 1)
//   }
//   for (let x = 0; x <= 4; x++) {
//     for (let y = 0; y <= 4; y++) {
//       A[x][y] = A[x][y] ^ D[x]
//     }
//   }
//   // ρ and π
//   for (let x = 0; x <= 4; x++) {
//     for (let y = 0; y <= 4; y++) {
//       B[y][(2 * x + 3 * y) % 5] = this.ROT(A[x][y], r[x][y])
//     }
//   }

//   // χ
//   for (let x = 0; x <= 4; x++) {
//     for (let y = 0; y <= 4; y++) {
//       A[x][y] = B[x][y] ^ ((!B[(x + 1) % 5][y]) & B[(x + 2) % 5][y])
//     }
//   }
//   // ι
//   A[0][0] = A[0][0] ^ RCRound
//   return A
// }
// keccak_f (A) {
//   for (let ir = 0; ir < 24; ir++) {
//     A = this.Round(A, RC[ir])
//   }
// }