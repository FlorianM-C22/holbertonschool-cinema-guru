const express = require('express')
const router = express.Router()
const { verifyToken } = require('../utils/tokens')
const tmdbService = require('../services/tmdbService')

router.use(verifyToken)

router.get('/config', async (req, res, next) => {
    try {
        const config = await tmdbService.getConfig()
        res.json(config)
    } catch (err) {
        next(err)
    }
})

router.get('/movies/:category', async (req, res, next) => {
    try {
        const { category } = req.params
        const page = req.query.page ? parseInt(req.query.page, 10) : 1
        const valid = ['popular', 'upcoming', 'top_rated'].includes(category)
        if (!valid) return next(Object.assign(new Error('Invalid category'), { statusCode: 400 }))
        const data = await tmdbService.getMovieList(category, page)
        res.json(data)
    } catch (err) {
        next(err)
    }
})

router.get('/tv/:category', async (req, res, next) => {
    try {
        const { category } = req.params
        const page = req.query.page ? parseInt(req.query.page, 10) : 1
        const valid = ['popular', 'upcoming', 'top_rated'].includes(category)
        if (!valid) return next(Object.assign(new Error('Invalid category'), { statusCode: 400 }))
        const data = await tmdbService.getTvList(category, page)
        res.json(data)
    } catch (err) {
        next(err)
    }
})

router.get('/genres/movies', async (req, res, next) => {
    try {
        const genres = await tmdbService.getMovieGenres()
        res.json({ genres })
    } catch (err) {
        next(err)
    }
})

router.get('/genres/tv', async (req, res, next) => {
    try {
        const genres = await tmdbService.getTvGenres()
        res.json({ genres })
    } catch (err) {
        next(err)
    }
})

router.get('/movies/:tmdbId/detail', async (req, res, next) => {
    try {
        const tmdbId = parseInt(req.params.tmdbId, 10)
        if (isNaN(tmdbId)) return next(Object.assign(new Error('Invalid tmdbId'), { statusCode: 400 }))
        const data = await tmdbService.getMovieDetail(tmdbId)
        res.json(data)
    } catch (err) {
        next(err)
    }
})

router.get('/tv/:tmdbId/detail', async (req, res, next) => {
    try {
        const tmdbId = parseInt(req.params.tmdbId, 10)
        if (isNaN(tmdbId)) return next(Object.assign(new Error('Invalid tmdbId'), { statusCode: 400 }))
        const data = await tmdbService.getTvDetail(tmdbId)
        res.json(data)
    } catch (err) {
        next(err)
    }
})

router.get('/tv/:tmdbId/external_ids', async (req, res, next) => {
    try {
        const tvdbId = await tmdbService.getTvExternalIds(req.params.tmdbId)
        res.json({ tvdb_id: tvdbId })
    } catch (err) {
        next(err)
    }
})

module.exports = router
