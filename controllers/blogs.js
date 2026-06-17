const router = require('express').Router()
const jwt = require('jsonwebtoken')

const { Blog, User } = require('../models')
const { SECRET } = require('../util/config')

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id)
  if (!req.blog) {
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

router.get('/', async (req, res) => {
  const blogs = await Blog.findAll()  
  res.json(blogs)
})

router.post('/', tokenExtractor, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.decodedToken.id)
    const blog = await Blog.create({ ...req.body, userId: user.id })
    res.json(blog)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', blogFinder, tokenExtractor, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.decodedToken.id)
    if (req.blog.userId !== user.id) {
      return res.status(403).send({ error: 'you don\'t have permission to do that' })
    }
    await req.blog.destroy()
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

router.put('/:id', blogFinder, async (req, res, next) => {
  try {
    req.blog.likes = req.body.likes
    await req.blog.save()
    res.json(req.blog)
  } catch (error) {
    next(error)
  }
})

router.use(errorHandler)

module.exports = router
