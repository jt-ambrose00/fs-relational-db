const Blog = require('./blog')
const User = require('./user')

User.hasMany(Blog)
Blog.belongsTo(User)

const syncDatabase = async () => {
  await Blog.sync({ alter: true })
  await User.sync({ alter: true })
}

module.exports = {
  Blog, User, syncDatabase
}
