const jwt = require('jsonwebtoken')

const secret = 'politalk'

function sign(payload) {
    return jwt.sign(payload, secret, { expiresIn: 86400 })
}

function verify(token) {
    return jwt.verify(token, secret)
}

module.exports = { sign, verify }