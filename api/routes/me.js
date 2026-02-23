const express = require('express')
const router = express.Router()
const { verifyToken } = require('../utils/tokens')
const meListService = require('../services/meListService')

router.use(verifyToken)

function validateTmdbIdMediaType(req, res, next) {
    const tmdbId = req.body?.tmdbId
    const mediaType = req.body?.mediaType
    if (tmdbId == null || mediaType == null) {
        return next(Object.assign(new Error('tmdbId and mediaType are required'), { statusCode: 400 }))
    }
    if (!['movie', 'tv'].includes(mediaType)) {
        return next(Object.assign(new Error('mediaType must be movie or tv'), { statusCode: 400 }))
    }
    next()
}

router.get('/favorites', async (req, res, next) => {
    try {
        const list = await meListService.getList(req.userId, 'favorite')
        res.json(list)
    } catch (err) {
        next(err)
    }
})

router.get('/watch-later', async (req, res, next) => {
    try {
        const list = await meListService.getList(req.userId, 'watchLater')
        res.json(list)
    } catch (err) {
        next(err)
    }
})

router.post('/favorites', validateTmdbIdMediaType, async (req, res, next) => {
    try {
        const entry = await meListService.addToList(
            req.userId,
            req.body.tmdbId,
            req.body.mediaType,
            'favorite'
        )
        res.status(201).json(entry)
    } catch (err) {
        next(err)
    }
})

router.post('/watch-later', validateTmdbIdMediaType, async (req, res, next) => {
    try {
        const entry = await meListService.addToList(
            req.userId,
            req.body.tmdbId,
            req.body.mediaType,
            'watchLater'
        )
        res.status(201).json(entry)
    } catch (err) {
        next(err)
    }
})

router.delete('/favorites/:tmdbId', async (req, res, next) => {
    try {
        const result = await meListService.removeFromList(req.userId, req.params.tmdbId, 'favorite')
        res.json(result)
    } catch (err) {
        next(err)
    }
})

router.delete('/watch-later/:tmdbId', async (req, res, next) => {
    try {
        const result = await meListService.removeFromList(req.userId, req.params.tmdbId, 'watchLater')
        res.json(result)
    } catch (err) {
        next(err)
    }
})

module.exports = router
