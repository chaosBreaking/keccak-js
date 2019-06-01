'use strict'
const r = [
  [0, 36, 3, 41, 18],
  [1, 44, 10, 45, 2],
  [62, 6, 43, 15, 61],
  [28, 55, 25, 21, 56],
  [27, 20, 39, 8, 14]
]
class Long64 {
  constructor (hi, lo) {
    this.hi = hi
    this.lo = lo
  }
  static fromString (str) {
    let [hi, lo] = str.match(/.{8}/g).map(i32 => parseInt(i32, 16))
    return new Long64(hi, lo)
  }
  rotl (n) {
    if (n === 0) return { hi: this.hi, lo: this.lo }
    else if (n < 32) {
      let m = 32 - n
      let lo = this.lo << n | this.hi >>> m
      let hi = this.hi << n | this.lo >>> m
      return { hi, lo }
    } else if (n === 32) {
      return { hi: this.lo, lo: this.hi }
    } else if (n > 32) {
      n -= 32
      let m = 32 - n
      let lo = this.hi << n | this.lo >>> m
      let hi = this.lo << n | this.hi >>> m
      return { hi, lo }
    }
  }
  trans2String () {
    return this.hi.toString(16).padStart(8, '0') + this.lo.toString(16).padStart(8, '0')
  }
}
const mod = (a, b) => {
  if (a >= 0) return a % b
  while (a < 0) {
    a += b
  }
  return a
}
const ROT = (a, d) => a.rotl(d)
const pad0x00 = String.fromCharCode(0x00)
const bytePad = (data, q, padType = 'sha3') => {
  let pad
  if (padType === 'sha3') {
    switch (q) {
      case 1: pad = String.fromCharCode(0x86); break
      case 2: pad = String.fromCharCode(0x06) + String.fromCharCode(0x80); break
      default: pad = String.fromCharCode(0x06) + pad0x00.repeat(q - 2) + String.fromCharCode(0x80); break
    }
  } else if (padType === 'shake') {
    switch (q) {
      case 1: pad = String.fromCharCode(0x9F); break
      case 2: pad = String.fromCharCode(0x1F) + String.fromCharCode(0x80); break
      default: pad = String.fromCharCode(0x1F) + pad0x00.repeat(q - 2) + String.fromCharCode(0x80); break
    }
  } else if (padType === 'keccak') {
    switch (q) {
      case 1: pad = String.fromCharCode(0x81); break
      case 2: pad = String.fromCharCode(0x01) + String.fromCharCode(0x80); break
      default: pad = String.fromCharCode(0x01) + pad0x00.repeat(q - 2) + String.fromCharCode(0x80); break
    }
  } else if (padType === 'kmac') {
    switch (q) {
      case 1: pad = String.fromCharCode(0x84); break
      case 2: pad = String.fromCharCode(0x04) + String.fromCharCode(0x80); break
      default: pad = String.fromCharCode(0x04) + pad0x00.repeat(q - 2) + String.fromCharCode(0x80); break
    }
  } else {
    pad = ''
  }
  return data + pad
}

const RC = [ 
  { hi: 0, lo: 1 },
  { hi: 0, lo: 32898 },
  { hi: 2147483648, lo: 32906 },
  { hi: 2147483648, lo: 2147516416 },
  { hi: 0, lo: 32907 },
  { hi: 0, lo: 2147483649 },
  { hi: 2147483648, lo: 2147516545 },
  { hi: 2147483648, lo: 32777 },
  { hi: 0, lo: 138 },
  { hi: 0, lo: 136 },
  { hi: 0, lo: 2147516425 },
  { hi: 0, lo: 2147483658 },
  { hi: 0, lo: 2147516555 },
  { hi: 2147483648, lo: 139 },
  { hi: 2147483648, lo: 32905 },
  { hi: 2147483648, lo: 32771 },
  { hi: 2147483648, lo: 32770 },
  { hi: 2147483648, lo: 128 },
  { hi: 0, lo: 32778 },
  { hi: 2147483648, lo: 2147483658 },
  { hi: 2147483648, lo: 2147516545 },
  { hi: 2147483648, lo: 32896 },
  { hi: 0, lo: 2147483649 },
  { hi: 2147483648, lo: 2147516424 }
]

function keccakF (state) {
  for (let rx = 0; rx < 24; rx++) {
    let C = []
    for (let x = 0; x < 5; x++) {
      C[x] = new Long64(state[x][0].hi, state[x][0].lo)
      C[x].hi ^= state[x][1].hi ^ state[x][2].hi ^ state[x][3].hi ^ state[x][4].hi
      C[x].lo ^= state[x][1].lo ^ state[x][2].lo ^ state[x][3].lo ^ state[x][4].lo
    }
    let D = []
    for (let x = 0; x < 5; x++) {
      const hi = C[(x + 4) % 5].hi ^ ROT(C[(x + 1) % 5], 1).hi
      const lo = C[(x + 4) % 5].lo ^ ROT(C[(x + 1) % 5], 1).lo
      D[x] = { hi, lo }
      for (let y = 0; y < 5; y++) {
        state[x][y].hi = state[x][y].hi ^ D[x].hi
        state[x][y].lo = state[x][y].lo ^ D[x].lo
      }
    }

    let B = [[], [], [], [], []]
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        let temp = ROT(state[x][y], r[x][y])
        B[y][(2 * x + 3 * y) % 5] = { hi: temp.hi, lo: temp.lo }
      }
    }

    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) { 
        let b1 = B[x][y] ? B[x][y] : { hi: 0, lo: 0 }
        let b2 = B[(x + 1) % 5][y] ? B[(x + 1) % 5][y] : { hi: 0, lo: 0 }
        let b3 = B[(x + 2) % 5][y] ? B[(x + 2) % 5][y] : { hi: 0, lo: 0 }
        state[x][y].hi = (b1.hi ^ ((~b2.hi) & b3.hi)) >>> 0
        state[x][y].lo = (b1.lo ^ ((~b2.lo) & b3.lo)) >>> 0
      }
    }

    state[0][0].hi = (state[0][0].hi ^ RC[rx].hi) >>> 0
    state[0][0].lo = (state[0][0].lo ^ RC[rx].lo) >>> 0
  }
  return state
}
const transpose = array => array.map((row, r) => array.map(col => col[r]))

function utf8Encode (str) {
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str, 'utf-8').reduce((prev, curr) => prev + String.fromCharCode(curr), '')
  return unescape(encodeURIComponent(str))
}
function keccakC (c, M, d = 0, option = { format: 'string' }) {
  let { padType, format } = option
  M = format === 'string' ? utf8Encode(M) : M
  const r = 1600 - c
  const q = (r / 8) - (mod(M.length, r / 8))
  let msg = bytePad(M, q, padType)
  let state = [[], [], [], [], []]
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      state[i][j] = new Long64(0, 0)
    }
  }
  const blockSize = r / 64 * 8
  for (let i = 0, length = msg.length; i < length; i += blockSize) {
    for (let j = 0; j < r / 64; j++) {
      const lo = (msg.charCodeAt(i + j * 8 + 0) << 0) +
        (msg.charCodeAt(i + j * 8 + 1) << 8) +
        (msg.charCodeAt(i + j * 8 + 2) << 16) +
        (msg.charCodeAt(i + j * 8 + 3) << 24)
      const hi = (msg.charCodeAt(i + j * 8 + 4) << 0) +
        (msg.charCodeAt(i + j * 8 + 5) << 8) +
        (msg.charCodeAt(i + j * 8 + 6) << 16) +
        (msg.charCodeAt(i + j * 8 + 7) << 24)
      let x = j % 5
      let y = ~~(j / 5)
      state[x][y].lo = state[x][y].lo ^ lo
      state[x][y].hi = state[x][y].hi ^ hi
    }
    keccakF(state)
  }
  let l = !d ? c / 2 : d
  let res = transpose(state).map(plane => plane.map(lane => lane.trans2String().match(/.{2}/g).reverse().join('')).join('')).join('').slice(0, l / 4)
  while (res.length < l / 4) {
    keccakF(state)
    res += transpose(state).map(plane => plane.map(lane => lane.trans2String().match(/.{2}/g).reverse().join('')).join('')).join('').slice(0, l / 4 - res.length)
  }
  return res
}

const keccak = d => (m, L, option) => keccakC(2 * d, m, +L, option)

const sha3 = d => (m, option) => keccakC(d * 2, m, null, option)

const shake = d => (m, outLength = 2 * d, option = { padType: 'shake' }) => (Number.isSafeInteger(+outLength)) ? keccakC(d * 2, m, +outLength, option) : new Error('SHAKE: Invalid output length')

module.exports = {
  keccakC,
  keccak128: keccak(128),
  keccak224: keccak(224),
  keccak256: keccak(256),
  keccak384: keccak(384),
  keccak512: keccak(512),
  sha3_224: sha3(224),
  sha3_256: sha3(256),
  sha3_384: sha3(384),
  sha3_512: sha3(512),
  shake128: shake(128),
  shake256: shake(256)
}
