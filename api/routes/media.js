const express = require('express')
const router = express.Router()
const { verifyToken } = require('../utils/tokens')
const tmdbService = require('../services/tmdbService')
const kinocheckService = require('../services/kinocheckService')

router.use(verifyToken)

router.get('/:tmdbId', async (req, res, next) => {
    try {
        const tmdbId = parseInt(req.params.tmdbId, 10)
        if (Number.isNaN(tmdbId)) {
            return next(Object.assign(new Error('Invalid tmdbId'), { statusCode: 400 }))
        }

        const typeParam = typeof req.query.type === 'string' ? req.query.type.toLowerCase() : 'movie'
        const mediaType = typeParam === 'tv' ? 'tv' : 'movie'
        const language =
            typeof req.query.language === 'string' && req.query.language
                ? req.query.language
                : 'fr'

        const [trailer, detail, credits] = await Promise.all([
            kinocheckService.getTrailerByTmdbId({ tmdbId, mediaType, language }),
            mediaType === 'movie'
                ? tmdbService.getMovieDetail(tmdbId, language)
                : tmdbService.getTvDetail(tmdbId, language),
            mediaType === 'movie'
                ? tmdbService.getMovieCredits(tmdbId, language)
                : tmdbService.getTvCredits(tmdbId, language),
        ])

        const title = mediaType === 'movie' ? detail.title : detail.name
        const rating = typeof detail.vote_average === 'number' ? detail.vote_average : null
        const overview = detail.overview || ''
        const releaseDate = mediaType === 'movie' ? detail.release_date : detail.first_air_date
        const genres = Array.isArray(detail.genres)
            ? detail.genres.map((g) => g.name)
            : []
        const runtime = mediaType === 'movie' ? detail.runtime ?? null : null
        const tagline = mediaType === 'movie' ? (detail.tagline || null) : null
        const numberOfSeasons = mediaType === 'tv' ? detail.number_of_seasons ?? null : null
        const cast = Array.isArray(credits?.cast)
            ? credits.cast.slice(0, 10).map((person) => ({
                  id: person.id,
                  name: person.name,
                  character: person.character,
                  profilePath: person.profile_path || null,
              }))
            : []

        res.json({
            trailer,
            tmdb: {
                id: detail.id,
                title,
                rating,
                overview,
                releaseDate: releaseDate || null,
                genres,
                runtime,
                tagline,
                numberOfSeasons,
                cast,
            },
        })
    } catch (err) {
        next(err)
    }
})

module.exports = router

