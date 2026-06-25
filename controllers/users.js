const router = require('express').Router()
const bcrypt = require('bcrypt')

const { User, Blog } = require('../models')

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
  const users = await User.findAll({
    attributes: { exclude: ['passwordHash'] },
    include: {
      model: Blog,
      attributes: { exclude: ['userId'] }
    }
  })
  res.json(users)
})

router.get('/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: ['id', 'name', 'username'],
    include:[{
        model: Blog,
        as: 'marked_blogs',
        attributes: { exclude: ['userId', 'createdAt', 'updatedAt']},
        through: { attributes: ['id', 'unread'] }
    }]
  })

  if (user) {
    res.json(user)
  } else {
    res.status(404).end()
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { username, name, password } = req.body
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ username, name, passwordHash })
    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      createdAt: user.createdAt
    })
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
    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })
  } catch (error) {
    next(error)
  }
})

router.use(errorHandler)

module.exports = router
