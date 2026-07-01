const router = require('express').Router()
const jwt = require('jsonwebtoken')

const { User, Session } = require('../models')
const { SECRET } = require('../util/config')

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

router.delete('/', tokenExtractor, async (req, res, next) => {
  try {
    await Session.destroy({
      where: { userId: req.decodedToken.id }
    })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

router.use(errorHandler)

module.exports = router
