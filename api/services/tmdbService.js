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
    languages: null,
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

async function getLanguages() {
    if (cache.languages) return cache.languages
    const data = await request('/configuration/languages')
    cache.languages = Array.isArray(data) ? data : []
    return cache.languages
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

function normalizeMovieResult(result) {
    return {
        id: result.id,
        tmdbId: result.id,
        mediaType: 'movie',
        title: result.title ?? result.original_title ?? '',
        overview: result.overview ?? '',
        posterPath: result.poster_path ?? null,
        backdropPath: result.backdrop_path ?? null,
        voteAverage: result.vote_average ?? 0,
        voteCount: result.vote_count ?? 0,
        popularity: result.popularity ?? 0,
        releaseDate: result.release_date ?? null,
        firstAirDate: null,
        genreIds: result.genre_ids ?? [],
        originalLanguage: result.original_language ?? null,
    }
}

function normalizeTvResult(result) {
    return {
        id: result.id,
        tmdbId: result.id,
        mediaType: 'tv',
        title: result.name ?? result.original_name ?? '',
        overview: result.overview ?? '',
        posterPath: result.poster_path ?? null,
        backdropPath: result.backdrop_path ?? null,
        voteAverage: result.vote_average ?? 0,
        voteCount: result.vote_count ?? 0,
        popularity: result.popularity ?? 0,
        releaseDate: null,
        firstAirDate: result.first_air_date ?? null,
        genreIds: result.genre_ids ?? [],
        originalLanguage: result.original_language ?? null,
    }
}

async function searchMedia(options) {
    const {
        q,
        type = 'all',
        genreIds,
        yearMin,
        yearMax,
        page = 1,
        originalLanguage,
    } = options || {}

    const parsedPage = Number.isFinite(page) ? page : 1

    const hasQuery = typeof q === 'string' && q.trim().length > 0
    const hasGenres = Array.isArray(genreIds) && genreIds.length > 0
    const hasYearMin = typeof yearMin === 'number' && Number.isFinite(yearMin)
    const hasYearMax = typeof yearMax === 'number' && Number.isFinite(yearMax)
    const hasOriginalLanguage = typeof originalLanguage === 'string' && originalLanguage.trim().length > 0

    const yearRange = {}
    if (hasYearMin) {
        yearRange.yearMin = yearMin
    }
    if (hasYearMax) {
        yearRange.yearMax = yearMax
    }

    const sharedDiscoverParams = {}
    if (hasGenres) {
        sharedDiscoverParams.with_genres = genreIds.join(',')
    }
    if (hasYearMin) {
        sharedDiscoverParams['primary_release_date.gte'] = `${yearMin}-01-01`
    }
    if (hasYearMax) {
        sharedDiscoverParams['primary_release_date.lte'] = `${yearMax}-12-31`
    }
    if (hasOriginalLanguage) {
        sharedDiscoverParams.with_original_language = originalLanguage.trim()
    }

    const sharedTvDiscoverParams = {}
    if (hasGenres) {
        sharedTvDiscoverParams.with_genres = genreIds.join(',')
    }
    if (hasYearMin) {
        sharedTvDiscoverParams['first_air_date.gte'] = `${yearMin}-01-01`
    }
    if (hasYearMax) {
        sharedTvDiscoverParams['first_air_date.lte'] = `${yearMax}-12-31`
    }
    if (hasOriginalLanguage) {
        sharedTvDiscoverParams.with_original_language = originalLanguage.trim()
    }

    const results = []
    let combinedPage = parsedPage
    let combinedTotalPages = 1
    let combinedTotalResults = 0

    const hasSingleYear =
        hasYearMin &&
        hasYearMax &&
        typeof yearMin === 'number' &&
        typeof yearMax === 'number' &&
        yearMin === yearMax

    const searchYearMovie =
        hasQuery && hasSingleYear
            ? yearMin
            : undefined
    const searchYearTv =
        hasQuery && hasSingleYear
            ? yearMin
            : undefined

    if (type === 'movie' || type === 'all') {
        const params = { page: parsedPage }
        if (hasQuery) {
            params.query = q.trim()
            if (typeof searchYearMovie === 'number') {
                params.primary_release_year = searchYearMovie
            }
        } else {
            Object.assign(params, sharedDiscoverParams)
        }

        const movieData = await request(
            hasQuery ? '/search/movie' : '/discover/movie',
            params
        )

        let movieResults = Array.isArray(movieData.results)
            ? movieData.results.map(normalizeMovieResult)
            : []
        if (hasOriginalLanguage && movieResults.length > 0 && hasQuery) {
            const lang = originalLanguage.trim()
            movieResults = movieResults.filter((r) => r.originalLanguage === lang)
        }
        if (hasQuery && hasYearMin && hasYearMax && movieResults.length > 0) {
            const minDate = `${yearMin}-01-01`
            const maxDate = `${yearMax}-12-31`
            movieResults = movieResults.filter((r) => {
                const d = r.releaseDate
                return d && d >= minDate && d <= maxDate
            })
        }
        results.push(...movieResults)
        combinedTotalResults += movieData.total_results ?? 0
        combinedTotalPages = Math.max(combinedTotalPages, movieData.total_pages ?? 1)
    }

    if (type === 'tv' || type === 'all') {
        const params = { page: parsedPage }
        if (hasQuery) {
            params.query = q.trim()
            if (typeof searchYearTv === 'number') {
                params.first_air_date_year = searchYearTv
            }
        } else {
            Object.assign(params, sharedTvDiscoverParams)
        }

        const tvData = await request(
            hasQuery ? '/search/tv' : '/discover/tv',
            params
        )

        let tvResults = Array.isArray(tvData.results)
            ? tvData.results.map(normalizeTvResult)
            : []
        if (hasOriginalLanguage && tvResults.length > 0 && hasQuery) {
            const lang = originalLanguage.trim()
            tvResults = tvResults.filter((r) => r.originalLanguage === lang)
        }
        if (hasQuery && hasYearMin && hasYearMax && tvResults.length > 0) {
            const minDate = `${yearMin}-01-01`
            const maxDate = `${yearMax}-12-31`
            tvResults = tvResults.filter((r) => {
                const d = r.firstAirDate
                return d && d >= minDate && d <= maxDate
            })
        }
        results.push(...tvResults)
        combinedTotalResults += tvData.total_results ?? 0
        combinedTotalPages = Math.max(combinedTotalPages, tvData.total_pages ?? 1)
    }

    results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

    return {
        page: combinedPage,
        total_pages: combinedTotalPages,
        total_results: combinedTotalResults,
        results,
        filters: {
            q: hasQuery ? q.trim() : '',
            type,
            genreIds: hasGenres ? genreIds : [],
            ...yearRange,
            originalLanguage: hasOriginalLanguage ? originalLanguage.trim() : undefined,
        },
    }
}

module.exports = {
    getConfig,
    getMovieList,
    getTvList,
    getMovieGenres,
    getTvGenres,
    getLanguages,
    getMovieDetail,
    getTvDetail,
    getMovieCredits,
    getTvCredits,
    getTvExternalIds,
    searchMedia,
}
