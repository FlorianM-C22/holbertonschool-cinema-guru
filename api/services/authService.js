const User = require('../models/User')
const { comparePassword } = require('../utils/password')

async function register(username, password) {
    const user = await User.create({ username, password })
    return { id: user.id, username: user.username }
}

async function login(username, password) {
    const user = await User.findOne({ where: { username } })
    if (!user) return null
    const correct = await comparePassword(password, user.password)
    if (!correct) return null
    return { id: user.id, username: user.username }
}

module.exports = { register, login }
