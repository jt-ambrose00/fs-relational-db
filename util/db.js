const { Sequelize } = require('sequelize')

const { DATABASE_URL, TEST_DATABASE_URL, TESTING } = require('./config')

const URL = TESTING === 'true' ? TEST_DATABASE_URL : DATABASE_URL

const sequelize = new Sequelize(URL, {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
})

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate()
    console.log('connected to the database')
  } catch (err) {
    console.log('failed to connect to the database')
    return process.exit(1)
  }

  return null
}

module.exports = { connectToDatabase, sequelize }
