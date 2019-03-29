'use strict'
const k = require('./keccak.js')
const d = require('./derived.js')
const h = require('./hmac-sha3.js')

module.exports = Object.assign(k, d, h)