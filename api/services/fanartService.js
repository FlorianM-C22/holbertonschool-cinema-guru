const axios = require('axios')
const tmdbService = require('./tmdbService')

const FANART_BASE = 'https://webservice.fanart.tv/v3'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

const cache = new Map()

function cacheKey(type, id) {
    return `${type}:${id}`
}

function getCached(key) {
    const entry = cache.get(key)
    if (!entry) return null
    if (Date.now() - entry.at > CACHE_TTL_MS) {
        cache.delete(key)
        return null
    }
    return entry.data
}

function setCached(key, data) {
    cache.set(key, { data, at: Date.now() })
}

function getApiKey() {
    const key = process.env.FANART_TV_API_KEY
    if (!key) return null
    return key
}

function getClientKey() {
    return process.env.FANART_TV_CLIENT_KEY || null
}

const DEFAULT_LANGUAGE = 'en'

function pickBestUrl(items, preferredLang = DEFAULT_LANGUAGE) {
    if (!items || !items.length) return null
    const sorted = [...items].sort((a, b) => {
        const aMatch = (a.lang || '').toLowerCase() === preferredLang
        const bMatch = (b.lang || '').toLowerCase() === preferredLang
        if (aMatch && !bMatch) return -1
        if (!aMatch && bMatch) return 1
        return Number(b.likes || 0) - Number(a.likes || 0)
    })
    return sorted[0]?.url ?? null
}

async function fetchFanart(path) {
    const apiKey = getApiKey()
    if (!apiKey) return null
    const params = { api_key: apiKey }
    const clientKey = getClientKey()
    if (clientKey) params.client_key = clientKey
    const res = await axios.get(`${FANART_BASE}${path}`, {
        params,
        timeout: 10000,
    })
    return res.data
}

async function getMovieArt(tmdbId, options = {}) {
    const lang = (options.lang || DEFAULT_LANGUAGE).toLowerCase()
    const key = cacheKey('movie', `${tmdbId}:${lang}`)
    const cached = getCached(key)
    if (cached) return cached
    const result = { logoUrl: null, backgroundUrl: null }
    try {
        const data = await fetchFanart(`/movies/${tmdbId}`)
        if (data) {
            result.logoUrl = pickBestUrl(data.hdmovielogo, lang)
            result.backgroundUrl = pickBestUrl(data.moviebackground, lang)
        }
    } catch (_) {}
    setCached(key, result)
    return result
}

async function getTvArt(tmdbId, options = {}) {
    const lang = (options.lang || DEFAULT_LANGUAGE).toLowerCase()
    const key = cacheKey('tv', `${tmdbId}:${lang}`)
    const cached = getCached(key)
    if (cached) return cached
    const result = { logoUrl: null, backgroundUrl: null }
    try {
        const tvdbId = await tmdbService.getTvExternalIds(tmdbId)
        const fanartId = tvdbId ?? tmdbId
        const data = await fetchFanart(`/tv/${fanartId}`)
        if (data) {
            result.logoUrl = pickBestUrl(data.hdtvlogo, lang) ?? pickBestUrl(data.clearlogo, lang)
            result.backgroundUrl = pickBestUrl(data.showbackground, lang)
        }
    } catch (_) {}
    setCached(key, result)
    return result
}

module.exports = { getMovieArt, getTvArt }
