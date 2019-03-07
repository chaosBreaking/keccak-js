'use strict'
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

const rc = function(t) {
  if (t % 255 === 0) return 1
  let R = [1,0,0,0,0,0,0,0]
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
function mod (a, b) {
  if (a > 0) return a % b
  while (a < 0) {
    a += b
  }
  return a
}
function hex2bin (data) {
}
function bin2hex (data) {
  
}
module.exports = {
  mod,
  hex2bin,
  // map1 means ?
  map1: function(sa = this.sa) {
    let C = [], D = []
    for (let x = 0; x >= 0 && x < 5; x++) {
      C[x] = C[x] === undefined ? [] : C[x]
      for (let z = 0; z >= 0 && z < this.w; z++) {
        C[x][z] = sa[x][0][z] ^ sa[x][1][z] ^ sa[x][2][z] ^ sa[x][3][z] ^ sa[x][4][z]
      }
    }
    for (let x = 0; x >= 0 && x < 5; x++) {
      D[x] = D[x] === undefined ? [] : D[x]
      for (let z = 0; z >= 0 && z < this.w; z++) {
        D[x][z] = C[(x - 1) % 5, z] ^ C[(x + 1) % 5, (z - 1) % this.w]
      }
    }
    for (let x = 0; x >= 0 && x < 5; x++) {
      for (let y = 0; y >= 0 && y < 5; y++) {
        for (let z = 0; z >= 0 && z < this.w; z++) {
          sa[x][y][z] = sa[x][y][z] ^ D[x][z]
        }
      }
    }
    return sa
  },
  // map2 means ?
  map2: function() {
    // step 1
    // for (let z = 0; z < this.w; z++) {
    //   this.sa[0][0][z] = this.sa[0][0][z]
    // }
    // step 2
    let [x, y] = [1, 0]
    // step 3
    for (let t = 0; t < 24; t++) {
      // a
      for (let z = 0; z < this.w; z++) {
        let mod = z - (t + 1) * (t + 2) / 2
        if ((z - (t + 1) * (t + 2) / 2) < 0) {
          while(mod < 0) {
            mod += this.w
          }
        } else {
          mod = (z - (t + 1) * (t + 2) / 2) % this.w
        }
        this.sa[x][y][z] = this.sa[x][y][mod]
      }
      // b
      [x, y] = [y, (2 * x + 3 * y) % 5]
    }
    // step 4
    return this.sa
  },
  // map3 means ?
  map3: function() {
    for (let x = 0; x >= 0 && x < 5; x++) {
      this.sa[x] = this.sa[x] === undefined ? [] : this.sa[x]
      for (let y = 0; y >= 0 && y < 5; y++) {
        this.sa[x][y] = this.sa[x][y] === undefined ? [] : this.sa[x][y]
        for (let z = 0; z >= 0 && z < this.w; z++) {
          this.sa[x][y][z] = this.sa[(x + 3 * y) % 5][x][z]
        }
      }
    }
    return this.sa
  },
  // map4 means ?
  map4: function() {
    for (let x = 0; x >= 0 && x < 5; x++) {
      this.sa[x] = this.sa[x] === undefined ? [] : this.sa[x]
      for (let y = 0; y >= 0 && y < 5; y++) {
        this.sa[x][y] = this.sa[x][y] === undefined ? [] : this.sa[x][y]
        for (let z = 0; z >= 0 && z < this.w; z++) {
          this.sa[x][y][z] = this.sa[x][y][z] ^ ((this.sa[(x + 1) % 5][y][z] ^ 1) * this.sa[(x + 2) % 5][y][z])
        }
      }
    }
    return this.sa
  },
  // map5 means ?
  map5: function(ir) {
    let RC = '0'.repeat(this.w).split()
    for (let j = 0; j <= this.l; j++) {
      RC[2**j - 1] = rc(j + 7 * ir)
    }
    for (let z = 0; 0 <= z && z < this.w; z++) {
      this.sa[0][0][z] ^= RC[z]
    }
    return this.sa
  },
  /**
   * positive int x
   * non-negative int m
   * @returns {string} P that m + len(P) = k?x 
   */
  pad101: function(x, m) {
    if (x <= 0 || m < 0) throw new Error(`Pad Error: Invalid input x: ${x} or m: ${m}`)
    // j = (-m-2) mod x
    let j = mod(-m - 2, x)
    return 1 + '0'.repeat(j) + '1'
  }

}
