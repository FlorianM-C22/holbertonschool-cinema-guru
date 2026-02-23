const UserListEntry = require('../models/UserListEntry')
const UserActivity = require('../models/UserActivity')

const LIST_TYPES = ['favorite', 'watchLater']
const MEDIA_TYPES = ['movie', 'tv']

async function getList(userId, listType) {
    if (!LIST_TYPES.includes(listType)) throw new Error('Invalid list type')
    const entries = await UserListEntry.findAll({
        where: { UserId: userId, listType },
        order: [['createdAt', 'DESC']],
    })
    return entries.map(e => ({ tmdbId: e.tmdbId, mediaType: e.mediaType }))
}

async function addToList(userId, tmdbId, mediaType, listType) {
    if (!LIST_TYPES.includes(listType)) throw new Error('Invalid list type')
    if (!MEDIA_TYPES.includes(mediaType)) throw new Error('Invalid media type')
    const n = parseInt(tmdbId, 10)
    if (isNaN(n)) throw new Error('Invalid tmdbId')
    const [entry] = await UserListEntry.findOrCreate({
        where: { UserId: userId, tmdbId: n, mediaType, listType },
        defaults: { UserId: userId, tmdbId: n, mediaType, listType },
    })
    await UserActivity.create({ userId, tmdbId: n, mediaType, activityType: listType })
    return entry
}

async function removeFromList(userId, tmdbId, listType) {
    if (!LIST_TYPES.includes(listType)) throw new Error('Invalid list type')
    const n = parseInt(tmdbId, 10)
    if (isNaN(n)) throw new Error('Invalid tmdbId')
    const entry = await UserListEntry.findOne({ where: { UserId: userId, tmdbId: n, listType } })
    const mediaType = entry ? entry.mediaType : 'movie'
    const deleted = entry ? await entry.destroy().then(() => true) : false
    const activityType = listType === 'favorite' ? 'removeFavorited' : 'removeWatchLater'
    await UserActivity.create({ userId, tmdbId: n, mediaType, activityType })
    return { deleted }
}

module.exports = { getList, addToList, removeFromList }
