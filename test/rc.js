// 'use strict'
// const rcRes = require('../util').rcRes
// // console.log(`RC = {`)
// // for(let i = 0; i < 256; i++) {
// // 	console.log(`${i}: ${rc(i)},`)
// // }
// // console.log(`}`)
// let RC = '0'.repeat(this.w).split()
// let ir = 0
// for (let j = 0; j <= 6; j++) {
// 	RC[2**j - 1] = rcRes[j + 7 * ir]
// }
// console.log(RC)

'use strict'
const rc = require('../util').rc
const t = require('../util').rcRes
// let res = ''
// for(let i = 0; i < 256; i++) {
// 	res += rc(i)
// }
// let f = true
// for(let i =0; i<t.length;i++) {
// 	if (res[i] === t[i]) continue
// 	return f = false
// }
// console.log(f)
let ir = 0; let L = 6
for (let l = 0; l <= L; l++) {
  let m = new Map()
  for (let ir = 0; ir < 24; ir++) {
    let RC = '0'.repeat(64).split('')
    for (let j = 0; j <= l; j++) {
      RC[2 ** j - 1] = t[j + 7 * ir]
    }
    m.set(ir, RC)
  }
  console.log('----------------- L === ', l, '------------------\n')
  m.forEach((v, k) => {
    console.log(k, ' ->', v.join(''), '  长度 :', v.length)
  })
  console.log('-----------------------------------------------\n')
}
