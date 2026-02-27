const express = require('express')
const router = express.Router()
const { verifyToken } = require('../utils/tokens')
const fanartService = require('../services/fanartService')

router.use(verifyToken)

const DEFAULT_LANGUAGE = 'en'

router.get('/movies/:tmdbId', async (req, res, next) => {
    try {
        const tmdbId = parseInt(req.params.tmdbId, 10)
        if (isNaN(tmdbId)) return next(Object.assign(new Error('Invalid tmdbId'), { statusCode: 400 }))
        const lang = typeof req.query.language === 'string' && req.query.language.trim()
            ? req.query.language.trim()
            : DEFAULT_LANGUAGE
        const art = await fanartService.getMovieArt(tmdbId, { lang })
        res.json(art)
    } catch (err) {
        next(err)
    }
})

router.get('/tv/:tmdbId', async (req, res, next) => {
    try {
        const tmdbId = parseInt(req.params.tmdbId, 10)
        if (isNaN(tmdbId)) return next(Object.assign(new Error('Invalid tmdbId'), { statusCode: 400 }))
        const lang = typeof req.query.language === 'string' && req.query.language.trim()
            ? req.query.language.trim()
            : DEFAULT_LANGUAGE
        const art = await fanartService.getTvArt(tmdbId, { lang })
        res.json(art)
    } catch (err) {
        next(err)
    }
})

module.exports = router
