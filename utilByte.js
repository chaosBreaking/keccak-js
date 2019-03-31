'use strict'
const deepCopy = require('deepcopy')
const bufXor = require('buffer-xor')
const BI = require('big-integer')
const rc = function (t) {
  if (t % 255 === 0) return 1
  let R = [1, 0, 0, 0, 0, 0, 0, 0]
  for (let i = 1; i <= t % 255; i++) {
    R = [0, ...R]
    R[0] = R[0] ^ R[8]
    R[4] ^= R[8]
    R[5] ^= R[8]
    R[6] ^= R[8]
    // truncn(x) -> [x[0], x[n-1]]
    R = R.slice(0, 8)
  }
  return R[0]
}
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
const r = [
  [0, 36, 3, 41, 18],
  [1, 44, 10, 45, 2],
  [62, 6, 43, 15, 61],
  [28, 55, 25, 21, 56],
  [27, 20, 39, 8, 14]
]
function mod (a, b) {
  if (a > 0) return a % b
  while (a < 0) {
    a += b
  }
  return a
}
function StrArrXOR (a, b) {
  if (a.length !== b.length) throw new Error('无法对不同长度的两串字符进行异或')
  let res = ''
  for (let i = 0; i < a.length; i++) {
    res += a[i] ^ b[i]
  }
  return res
}
function bufferXOR (a, b) {
  if (a.length !== b.length) throw new Error('无法对不同长度的两个Buffer进行异或')
  for (let i = 0; i < a.length; i++) {
    a[i] ^= b[i]
  }
  return a
}
function bin2hex4 (data) {
  let res = ''
  let count = 0
  while (data[count]) {
    let num = 0
    let arr = data.slice(count, count + 4).split('').reverse()
    arr.forEach((v, i) => {
      num += +v * 2 ** (3 - i)
    })
    res += num.toString(16)
    count += 4
  }
  return res
}
function bin2hex8 (data) {
  let res = ''
  let count = 0
  while (data[count]) {
    let numa = 0; let numb = 0
    let byte = data.slice(count, count + 8).split('').reverse()
    let [a, b] = [byte.slice(0, 4), byte.slice(4)]
    a.forEach((v, i) => {
      numa += +v * 2 ** (3 - i)
    })
    b.forEach((v, i) => {
      numb += +v * 2 ** (3 - i)
    })
    res += numa.toString(16) + numb.toString(16)
    count += 8
  }
  return res
}
// 注意：2进制字符串转16进制时，如果用8位为单位转换的话，需要注意00000000或者0000xxxx等类型，会丢失高四位的0,比如00000001会被转为1而不是01
function bin2byte (data) {
  let arr = []
  for (let i = 1; ;i++) {
    let byte = data.slice((i - 1) * 8, i * 8)
    if (!byte) break
    arr.push(byte.split('').reverse())
  }
  return arr
}
function arr2string (arr) {
  let s = ''
  for (let x = 0; x < 5; x++) {
    for (let y = 0; y < 5; y++) {
      s += arr[y][x].join('')
    }
  }
  return s
}
function sa2log (sa) {
  let temp = arr2string(sa)
  let t = bin2byte(temp)
  let res = ''
  for (let i = 0; i < t.length; i++) {
    let byte = t[i]
    res += bin2hex4(byte.slice(0, 4).reverse().join('')) + bin2hex4(byte.slice(4).reverse().join('')) + ((i + 1) % 16 === 0 ? '\n' : ' ')
  }
  return res
}
function trans2BitString (data) {
  let res = ''
  for (let u of data) {
    res += u.toString(2).padStart(8, '0').split('').reverse().join('')
  }
  return res
}
function ROT (b, n) {
  // b > buffer
  // n > int
  let k = BI(18446744073709551616)
  n = n % 64
  return b.shiftRight(64 - n).add(b.shiftLeft(n)).mod(k)
}
module.exports = {
  rc,
  mod,
  ROT,
  sa2log,
  StrArrXOR,
  bufferXOR,
  bin2hex4,
  bin2hex8,
  bin2byte,
  arr2string,
  trans2BitString,

  // map1 means θ
  map1ori: function (sa = this.sa) {
    let C = [0, 0, 0, 0, 0]
    let D = []
    for (let x = 0; x < 5; x++) {
      C[x] = sa[x].reduce((pre, cur) => bufXor(pre, cur))
    }
    for (let x = 0; x < 5; x++) {
      D[x] = bufXor(C[mod((x - 1), 5)], C[mod((x + 1), 5)])
    }
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        sa[x][y] = bufXor(sa[x][y], D[x])
      }
    }
    return sa
  },
  map1: function (sa = this.sa) {
    let C = [0, 0, 0, 0, 0]
    let D = [0, 0, 0, 0, 0]
    for (let x = 0; x < 5; x++) {
      C[x] = sa[x][0].xor(sa[x][1]).xor(sa[x][2]).xor(sa[x][3]).xor(sa[x][4])
    }
    for (let x = 0; x < 5; x++) {
      D[x] = C[mod(x - 1, 5)].xor(ROT(C[(x + 1) % 5], 1))
    }
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        sa[x][y] = sa[x][y].xor(D[x])
      }
    }
    return sa
  },
  map2n3n4: function (sa = this.sa, ir) {
    // let newSa = deepCopy(sa)
    let B = [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ]

    // map2 means ρ
    // map3 means π
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        B[y][(2 * x + 3 * y) % 5] = ROT(sa[x][y], r[x][y])
      }
    }

    // map4 means χ
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        sa[x][y] = B[x][y].xor(B[(x + 1) % 5][y].not().and(B[(x + 2) % 5][y]))
      }
    }

    sa[0][0] = sa[0][0].xor(BI(RC[ir], 16))
    return sa
  },

  // map5 means ι
  map5: function (sa = this.sa, ir) {
    sa[0][0] = sa[0][0].xor(BI(RC[ir], 16))
    return sa
  },
  /**
   * positive int x
   * non-negative int m
   * @returns {string} P that m + len(P) = k·x
   */
  pad101: function (x, m) {
    if (x <= 0 || m < 0) throw new Error(`Pad Error: Invalid input x: ${x} or m: ${m}`)
    // j = (-m-2) mod x
    let j = mod(-m - 2, x)
    return '1' + '0'.repeat(j) + '1'
  },
  fromLaneToHexString: (lane) => {
    let laneHexBE = lane.toString(16)
    let nrBytes = Math.floor(laneHexBE.length / 2)
    return Array.from({ length: nrBytes }).reduce((pre, cur, i) => {
      let offset = (nrBytes - i - 1) * 26
      return laneHexBE.slice(offset, offset + 2)
    })
  },
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

}

/*
    计算RC
    const rcRes = '1000000010110001111010000111111110010000101001111101010101110000011000101011001100101111110111100110111011100101010010100010010110100011001110011110001101100001000101110101111011011111000011010011010110110101000001001110110010010011000000111010010001110001'
    let RC = '0'.repeat(this.w).split('')
    for (let j = 0; j <= +this.l; j++) {
      RC[2 ** j - 1] = rcRes[j + 7 * ir]
    }
*/
