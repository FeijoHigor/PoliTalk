const express = require('express')
const router = express.Router()

const bcrypt = require('bcryptjs')

const crypto = require('crypto')

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

router.post('/forgot_password', async (req, res) => {
    const { email } = req.body

    try {
        const user = await User.findOne({ email })

        if(!user){
            return res.status(404).send({ err: "Email is not registered" })
        }

        const token = crypto.randomBytes(20).toString("hex")

        const now = new Date()
        now.setHours(now.getHours() + 1)

        await User.findByIdAndUpdate(user._id, {
                passwordResetToken: token,
                passwordResetExpires: now
            }
        )

        res.send({ refreshToken: token })
    }catch(err) {
        res.status(500).send({ err: "Error on forgot password" })
    }
})

router.post('/reset_password', async (req, res) => {
    try {
        const { email, token, password } = req.body

        const user = await User.findOne({ email }).select('+passwordResetToken passwordResetExpires')

        if(!user) {
            return res.status(404).send({ err: "Email is not registered" })
        }

        if(token !== user.passwordResetToken) {
            return res.status(401).send({ err: "Token invalid", sent: token, correct: user.passwordResetToken })
        }

        const now = new Date

        if(now > user.passwordResetExpires) {
            return res.status(408).send({ err: "Token expired, generate a new one" })
        }

        user.password = password

        await user.save()

        res.send()
    }catch(err) {
        res.status(500).send({ err: 'Error on reset token' })
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