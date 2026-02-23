const express = require('express')
const router = express.Router()
const { verifyToken } = require('../utils/tokens')
const fanartService = require('../services/fanartService')

router.use(verifyToken)

router.get('/movies/:tmdbId', async (req, res, next) => {
    try {
        const tmdbId = parseInt(req.params.tmdbId, 10)
        if (isNaN(tmdbId)) return next(Object.assign(new Error('Invalid tmdbId'), { statusCode: 400 }))
        const art = await fanartService.getMovieArt(tmdbId)
        res.json(art)
    } catch (err) {
        next(err)
    }
})

router.get('/tv/:tmdbId', async (req, res, next) => {
    try {
        const tmdbId = parseInt(req.params.tmdbId, 10)
        if (isNaN(tmdbId)) return next(Object.assign(new Error('Invalid tmdbId'), { statusCode: 400 }))
        const art = await fanartService.getTvArt(tmdbId)
        res.json(art)
    } catch (err) {
        next(err)
    }
})

module.exports = router
