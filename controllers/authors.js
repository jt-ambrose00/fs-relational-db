const router = require('express').Router()
const { fn, col } = require('sequelize')

const { Blog } = require('../models')

router.get('/', async (req, res) => {
  const authors = await Blog.findAll({
    attributes: [
      'author',
      [fn('count', col('id')), 'blogs'],
      [fn('sum', col('likes')), 'likes']
    ],
    order: [ ['likes', 'DESC'] ],
    group: ['author']
  })

  res.json(authors)
})

module.exports = router
