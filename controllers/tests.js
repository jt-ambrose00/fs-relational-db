const router = require('express').Router()

const { Blog, User } = require('../models')

router.get('/', (req, res) => {
  return res.status(200).end()
})

router.post('/api/reset', async (req, res) => {
  try {
    await Blog.truncate({ cascade: true })
    await User.truncate({ cascade: true })
    res.status(204).end()
  } catch (error) {
    console.error(error)
  }
})

module.exports = router
