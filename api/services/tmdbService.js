const axios = require('axios')

const TMDB_BASE = 'https://api.themoviedb.org/3'

function getToken() {
    const token = process.env.TMDB_ACCESS_TOKEN
    if (!token) throw new Error('TMDB_ACCESS_TOKEN not configured')
    return token
}

const cache = {
    config: null,
    movieGenres: null,
    tvGenres: null,
    externalIds: new Map(),
}

async function request(path, params = {}) {
    const token = getToken()
    const res = await axios.get(`${TMDB_BASE}${path}`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
    })
    return res.data
}

async function getConfig() {
    if (cache.config) return cache.config
    cache.config = await request('/configuration')
    return cache.config
}

async function getMovieList(category, page = 1) {
    const path = category === 'popular' ? '/movie/popular' : category === 'upcoming' ? '/movie/upcoming' : '/movie/top_rated'
    return request(path, { page })
}

async function getTvList(category, page = 1) {
    const path = category === 'popular' ? '/tv/popular' : category === 'upcoming' ? '/tv/on_the_air' : '/tv/top_rated'
    return request(path, { page })
}

async function getMovieGenres() {
    if (cache.movieGenres) return cache.movieGenres
    const data = await request('/genre/movie/list')
    cache.movieGenres = data.genres || []
    return cache.movieGenres
}

async function getTvGenres() {
    if (cache.tvGenres) return cache.tvGenres
    const data = await request('/genre/tv/list')
    cache.tvGenres = data.genres || []
    return cache.tvGenres
}

async function getMovieDetail(tmdbId, language) {
    const params = {}
    if (language) params.language = language
    return request(`/movie/${tmdbId}`, params)
}

async function getTvDetail(tmdbId, language) {
    const params = {}
    if (language) params.language = language
    return request(`/tv/${tmdbId}`, params)
}

async function getMovieCredits(tmdbId, language) {
    const params = {}
    if (language) params.language = language
    return request(`/movie/${tmdbId}/credits`, params)
}

async function getTvCredits(tmdbId, language) {
    const params = {}
    if (language) params.language = language
    return request(`/tv/${tmdbId}/credits`, params)
}

async function getTvExternalIds(tmdbId) {
    const id = parseInt(tmdbId, 10)
    if (cache.externalIds.has(id)) return cache.externalIds.get(id)
    try {
        const data = await request(`/tv/${tmdbId}/external_ids`)
        const tvdbId = data.tvdb_id ?? null
        cache.externalIds.set(id, tvdbId)
        return tvdbId
    } catch {
        cache.externalIds.set(id, null)
        return null
    }
}

module.exports = {
    getConfig,
    getMovieList,
    getTvList,
    getMovieGenres,
    getTvGenres,
    getMovieDetail,
    getTvDetail,
    getMovieCredits,
    getTvCredits,
    getTvExternalIds,
}
