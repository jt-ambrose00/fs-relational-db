const router = require('express').Router()

const { Blog } = require('../models')

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id)
  if (!req.blog) {
    return res.status(404).end()
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

router.post('/', async (req, res, next) => {
  try {
    const blog = await Blog.create({ ...req.body })
    res.json(blog)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', blogFinder, async (req, res) => {
  await req.blog.destroy()
  res.status(204).end()
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
