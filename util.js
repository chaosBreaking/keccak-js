'use strict'
const deepCopy = require('deepcopy')
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
const rcRes = '1000000010110001111010000111111110010000101001111101010101110000011000101011001100101111110111100110111011100101010010100010010110100011001110011110001101100001000101110101111011011111000011010011010110110101000001001110110010010011000000111010010001110001'
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
module.exports = {
  rc,
  rcRes,
  mod,
  sa2log,
  StrArrXOR,
  bin2hex4,
  bin2hex8,
  bin2byte,
  arr2string,
  trans2BitString,
  // map1 means θ
  map1: function (sa = this.sa) {
    let C = []; let D = []
    for (let x = 0; x < 5; x++) {
      C[x] = C[x] === undefined ? [] : C[x]
      for (let z = 0; z < this.w; z++) {
        C[x][z] = sa[x][0][z] ^ sa[x][1][z] ^ sa[x][2][z] ^ sa[x][3][z] ^ sa[x][4][z]
      }
    }
    for (let x = 0; x < 5; x++) {
      D[x] = D[x] === undefined ? [] : D[x]
      for (let z = 0; z >= 0 && z < this.w; z++) {
        D[x][z] = C[mod((x - 1), 5)][z] ^ C[mod((x + 1), 5)][mod((z - 1), this.w)]
      }
    }
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        for (let z = 0; z >= 0 && z < this.w; z++) {
          sa[x][y][z] = sa[x][y][z] ^ D[x][z]
        }
      }
    }
    return sa
  },
  // map2 means ρ
  map2: function (sa = this.sa) {
    // 巨坑。。。需要深拷贝sa！
    // step 1
    let newSa = deepCopy(sa)
    // step 2
    let [x, y] = [1, 0]
    // step 3
    for (let t = 0; t < 24; t++) {
      // a
      for (let z = 0; z < this.w; z++) {
        let temp = mod(z - (t + 1) * (t + 2) / 2, this.w)
        newSa[x][y][z] = sa[x][y][temp]
      }
      // b
      [x, y] = [y, mod((2 * x + 3 * y), 5)]
    }
    return newSa
  },
  // map3 means π
  map3: function (sa = this.sa) {
    let newSa = deepCopy(sa)
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        for (let z = 0; z < this.w; z++) {
          newSa[x][y][z] = sa[(x + 3 * y) % 5][x][z]
        }
      }
    }
    // let testres = sa2log(newSa)
    return newSa
  },
  // map4 means χ
  map4: function (sa = this.sa) {
    let newSa = deepCopy(sa)
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        for (let z = 0; z >= 0 && z < this.w; z++) {
          newSa[x][y][z] = sa[x][y][z] ^ ((sa[(x + 1) % 5][y][z] ^ 1) * sa[(x + 2) % 5][y][z])
        }
      }
    }
    // let testres = sa2log(newSa)
    return newSa
  },
  // map5 means ι
  map5: function (sa = this.sa, ir) {
    let RC = '0'.repeat(this.w).split('')
    for (let j = 0; j <= +this.l; j++) {
      RC[2 ** j - 1] = rcRes[j + 7 * ir]
    }
    for (let z = 0; z < this.w; z++) {
      sa[0][0][z] ^= RC[z]
    }
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
  }

}
