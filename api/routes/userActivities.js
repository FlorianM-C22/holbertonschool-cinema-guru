const express = require('express')
const router = express.Router()
const UserActivity = require('../models/UserActivity')
const User = require('../models/User')
const { verifyToken } = require('../utils/tokens')

router.get('/', verifyToken, (req, res, next) => {
    UserActivity.findAll({
        where: { userId: req.userId },
        include: [{ model: User, as: "user", attributes: ["username"] }],
        order: [["createdAt", "DESC"]],
    })
        .then(data => res.send(data))
        .catch(err => next(err))
})

module.exports = router
