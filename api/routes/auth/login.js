const express = require('express')
const router = express.Router()
const { generateToken } = require('../../utils/tokens')
const { validateAuth } = require('../../utils/validation')
const authService = require('../../services/authService')

const CREDENTIALS_ERR = Object.assign(new Error('Incorrect credentials'), { statusCode: 401 })

router.post('/', validateAuth, async (req, res, next) => {
    try {
        const payload = await authService.login(req.body.username, req.body.password)
        if (!payload) return next(CREDENTIALS_ERR)
        const token = await generateToken(payload.id, payload.username)
        res.send({ message: 'Logged in successfully', accessToken: token })
    } catch (err) {
        next(err)
    }
})

module.exports = router
