const jwt = require('./jwt')
const User = require('../models/users')

async function authMiddleware(req, res, next) {
    const [ scheme, token ] = req.headers.authorization.split(' ')

    console.log('scheme: ' + scheme)
    console.log('token: ' + token)

    try {
        const payload = await jwt.verify(token)
        const user = await User.findOne({ _id: payload.user })

        if(!user) {
            return res.status(401).send({ err: "Invalid token" })
        }

        req.auth = user

        next()
    }catch(err) {
        res.status(400).send({ err: "Error" })
    }
}

module.exports = authMiddleware