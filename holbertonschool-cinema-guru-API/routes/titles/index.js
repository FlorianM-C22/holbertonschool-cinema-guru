const express = require('express')
const router = express.Router()
const { Title } = require('../../models/Title')
const { verifyToken } = require('../../utils/tokens')
const { Op } = require('@sequelize/core');
const userTitlesRouter = require('./userTitles')
const axios = require('axios')

router.use('/', userTitlesRouter)
const PAGE_SIZE = 10;
router.get('/advancedsearch', verifyToken, async (req, res) => {
    const maxYear = parseInt(req.query.maxYear)
    const minYear = parseInt(req.query.maxYear)
    const genre = req.query.genres ? req.query.genres.split(',').map(genre => genre.charAt(0).toUpperCase() + genre.slice(1)) : []
    const params = {
        maxYear: isNaN(maxYear) ? 2022 : maxYear,
        minYear: isNaN(minYear) ? 0 : minYear,
        sort: req.query.sort ?? "",
        genres: genre,
        title: req.query.title ? req.query.title : "",
        page: req.query.page ? req.query.page : 1,
    }
    const titles = await Title.findAll({
        where: {
            released: {
                [Op.between]: [params.minYear, params.maxYear]
            },
            genres: {
                [Op.contains]: params.genres ? params.genres : true
            },
            title: {
                [Op.iLike]: `%${params.title}%`
            }
        },
        order: [getSort(params.sort)],
        limit: PAGE_SIZE,
        offset: (params.page - 1) * PAGE_SIZE,
    }).catch(err => res.status(500).send(err))
    res.send({ totalCount: titles.length, titles })
})

router.get('/:imdbId', verifyToken, (req, res) => {
    const { imdbId } = req.params
    Title.findOne({ where: { imdbId } }).then(data => res.send(data)).catch(err => res.status(500).send(err))
})

const getSort = (param) => {
    switch (param) {
        case "oldest":
            return ['released', 'ASC']
        case "highestrated":
            return ['imdbrating', 'DESC']
        case "lowestrated":
            return ['imdbrating', 'ASC']
        default:
            return ['released', 'DESC']
    }
}

module.exports = router
