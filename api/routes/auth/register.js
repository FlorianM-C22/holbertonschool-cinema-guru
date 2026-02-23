const express = require('express')
const router = express.Router()
const { generateToken } = require('../../utils/tokens')
const { validateAuth } = require('../../utils/validation')
const authService = require('../../services/authService')

router.post('/', validateAuth, async (req, res, next) => {
    try {
        const payload = await authService.register(req.body.username, req.body.password)
        const token = await generateToken(payload.id, payload.username)
        res.send({ message: 'Registered successfully', accessToken: token })
    } catch (err) {
        const e = err.name === 'SequelizeUniqueConstraintError'
            ? Object.assign(new Error('Invalid username'), { statusCode: 400 })
            : err
        next(e)
    }
})

module.exports = router
