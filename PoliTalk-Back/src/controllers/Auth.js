const express = require('express')
const router = express.Router()

const bcrypt = require('bcryptjs')

const jwt = require('../auth/jwt')
const authMiddleware = require('../auth/authMiddleware')

const User = require('../models/users')

router.post('/sign_up', async (req, res) => {
    try {
        const { name, email, password } = req.body

        const user = await User.create({
            name,
            email,
            password
        })

        user.password = undefined

        res.send({ 
            user,
            token: jwt.sign({ user: user._id })
        })
    } catch(err) {
        res.status(500).send(err)
        console.log(err)
    }
})

router.get('/sign_in', async (req, res) => {
    try {
        const [hashtype, hash] = req.headers.authorization.split(' ')
        const [email, password] = Buffer.from(hash, 'base64').toString().split(':')

        const user = await User.findOne({ email }).select('+password')

        if(!user) {
            return res.status(404).send({ err: 'User does not exists' })
        }

        if(! await bcrypt.compare(password, user.password)){
            return res.status(401).send({ err: "Email or password is wrong" })
        }

        user.password = undefined

        res.send({
            user,
            token: jwt.sign({ user: user._id })
        })
    } catch(err) {
        res.status(500).send({ err: "Error on login" })
    }
})

router.get('/me', authMiddleware, (req, res) => {
    try {
        res.send({ user: req.auth })
    }catch(err) {
        res.status(500).send({ err })
    }
})

module.exports = app => app.use('/auth', router)