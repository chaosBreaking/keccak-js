'use strict'
const k = require('./keccak.js')
const d = require('./derived.js')
const h = require('./hmac-sha3.js')
const mix = Object.assign(k, d, h)

module.exports = mix