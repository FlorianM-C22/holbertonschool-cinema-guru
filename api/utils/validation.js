function validationError(message) {
    const err = new Error(message)
    err.statusCode = 400
    return err
}

function validateAuth(req, res, next) {
    const username = req.body && req.body.username
    const password = req.body && req.body.password
    if (!username || typeof username !== 'string' || !username.trim()) {
        return next(validationError('Username is required'))
    }
    if (!password || typeof password !== 'string') {
        return next(validationError('Password is required'))
    }
    if (password.length < 6) {
        return next(validationError('Password must be at least 6 characters'))
    }
    next()
}

module.exports = {
    validateAuth,
}
