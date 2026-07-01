const router = require('express').Router()
const jwt = require('jsonwebtoken')

const { Blog, User, ReadingList, Session } = require('../models')
const { SECRET } = require('../util/config')

const readingListFinder = async (req, res, next) => {
  req.readingList = await ReadingList.findByPk(req.params.id)
  if (!req.readingList) {
    return res.status(404).end()
  }
  next()
}

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      const token = authorization.substring(7)
      req.decodedToken = jwt.verify(token, SECRET)

      const session = await Session.findOne({ 
        where: { token } 
      })
      if (!session) {
        return res.status(401).json({ error: 'you don\'t have permission to do that' })
      }

      const user = await User.findByPk(req.decodedToken.id)
      if (user.disabled) {
        return res.status(401).json({ error: 'account disabled' })
      }
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

router.post('/', async (req, res, next) => {
  try {
    const { blogId, userId } = req.body
    if (!blogId) {
      return res.status(400).send({ error: 'blog id must be included' })
    }
    if (!userId) {
      return res.status(400).send({ error: 'user id must be included' })
    }

    const blog = await Blog.findByPk(blogId)
    const user = await User.findByPk(userId)

    if (!blog) {
      return res.status(404).send({ error: 'blog not found' })
    }
    if (!user) {
      return res.status(404).send({ error: 'user not found' })
    }

    const readingListExists = await ReadingList.findOne({
      where: { userId, blogId }
    })
    if (readingListExists) {
      return res.status(400).send({ error: 'blog already exists in reading list' })
    }

    const readingList = await (await ReadingList.create({ blogId, userId })).toJSON()

    res.json({
      id: readingList.id,
      read: readingList.read,
      user_id: readingList.userId,
      blog_id: readingList.blogId
    })
  } catch (error) {
    next(error)
  }
})

router.put('/:id', tokenExtractor, readingListFinder, async (req, res, next) => {
  try {
    if (req.decodedToken.id !== req.readingList.userId) {
      return res.status(401).send({ error: 'you don\'t have permission to do that' })
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
