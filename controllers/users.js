const router = require('express').Router()

const { User } = require('../models')

const errorHandler = (error, req, res, next) => {
  console.error('error.message:', error.message)
  console.error('error.name:', error.name)

  if (
    error.name === 'TypeError' ||
    error.name === 'SequelizeValidationError' ||
    error.name === 'SequelizeUniqueConstraintError'
  ) {
    return res.status(400).send({ error: error.message })
  } 

  next(error)
}

router.get('/', async (req, res) => {
  const users = await User.findAll()
  res.json(users)
})

router.post('/', async (req, res, next) => {
  try {
    const user = await User.create(req.body)
    res.json(user)
  } catch (error) {
    next(error)
  }
})

router.put('/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username }
    })
    user.name = req.body.name
    await user.save()
    res.json(user)
  } catch (error) {
    next(error)
  }
})

router.use(errorHandler)

module.exports = router
