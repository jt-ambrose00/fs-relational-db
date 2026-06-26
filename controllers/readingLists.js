const router = require('express').Router()
const jwt = require('jsonwebtoken')

const { Blog, User, ReadingList } = require('../models')
const { SECRET } = require('../util/config')

const readingListFinder = async (req, res, next) => {
  req.readingList = await ReadingList.findByPk(req.params.id)
  if (!req.readingList) {
    return res.status(404).end()
  }
  next()
}

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
    } catch {
      return res.status(401).json({ error: 'token invalid' })
    }
  } else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

const errorHandler = (error, req, res, next) => {
  console.error('error.message:', error.message)
  console.error('error.name:', error.name)

  if (
    error.name === 'SequelizeDatabaseError' ||
    error.name === 'SequelizeValidationError'
  ) {
    return res.status(400).send({ error: error.message })
  } 

  next(error)
}

router.post('/', tokenExtractor, async (req, res, next) => {
  try {
    const { blogId, userId } = req.body
    const blog = await Blog.findByPk(blogId)
    const user = await User.findByPk(userId)
    if (!blog) {
      return res.status(404).send({ error: 'blog not found' })
    }
    if (!user) {
      return res.status(404).send({ error: 'user not found' })
    }
    if (req.decodedToken.id !== userId) {
      return res.status(403).send({ error: 'you don\'t have permission to do that' })
    }
    const readingList = await ReadingList.create({ blogId, userId })
    res.json(readingList)
  } catch (error) {
    next(error)
  }
})

router.put('/:id', tokenExtractor, readingListFinder, async (req, res, next) => {
  try {
    if (req.decodedToken.id !== req.readingList.userId) {
      return res.status(403).send({ error: 'you don\'t have permission to do that' })
    }
    req.readingList.read = req.body.read
    await req.readingList.save()
    res.json(req.readingList)
  } catch (error) {
    next(error)
  }
})

router.use(errorHandler)

module.exports = router
