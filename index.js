'use strict'
const k = require('./qKeccak.js')
const d = require('./qDerived.js')
const h = require('./hmac-sha3.js')

module.exports = Object.assign(k, d, h)
