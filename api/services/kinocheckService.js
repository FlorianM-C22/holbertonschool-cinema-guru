const axios = require('axios')

const KINOCHECK_BASE = 'https://api.kinocheck.com'

async function request(path, params = {}) {
    const res = await axios.get(`${KINOCHECK_BASE}${path}`, {
        params,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Api-Host': 'api.kinocheck.com',
        },
        timeout: 10000,
    })
    return res.data
}

function videoToTrailer(video) {
    if (!video || !video.youtube_video_id) return null
    return {
        youtubeVideoId: video.youtube_video_id,
        title: video.title || null,
        thumbnail: video.thumbnail || video.youtube_thumbnail || null,
        language: video.language || null,
    }
}

function pickFirstTrailerFromVideos(videos) {
    if (!Array.isArray(videos) || videos.length === 0) return null
    const trailer = videos.find(
        (v) => Array.isArray(v.categories) && v.categories.includes('Trailer'),
    )
    return videoToTrailer(trailer || videos[0])
}

async function getTrailerByTmdbId({ tmdbId, mediaType, language }) {
    const id = parseInt(tmdbId, 10)
    if (Number.isNaN(id)) {
        throw Object.assign(new Error('Invalid tmdbId'), { statusCode: 400 })
    }

    const params = { tmdb_id: id }
    if (language) params.language = language

    const path = mediaType === 'tv' ? '/shows' : '/movies'

    try {
        const data = await request(path, params)
        if (data.trailer) return videoToTrailer(data.trailer)
        if (Array.isArray(data.videos) && data.videos.length > 0) {
            return pickFirstTrailerFromVideos(data.videos)
        }
        return null
    } catch (err) {
        if (err.response && err.response.status === 404) return null
        throw err
    }
}

module.exports = {
    getTrailerByTmdbId,
}

