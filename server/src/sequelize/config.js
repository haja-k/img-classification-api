const { MYSQL_DATABASE, MYSQL_ROOT_PASSWORD } = process.env

module.exports = {
  local: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '12345',
    database: process.env.DB_NAME || 'icp_web',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql'
  },
  dev: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '12345',
    database: process.env.DB_NAME || 'icp_web',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql'
  },
  test: {
    username: 'root',
    password: MYSQL_ROOT_PASSWORD,
    database: MYSQL_DATABASE,
    host: 'mysql',
    dialect: 'mysql'
  },
  production: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '12345',
    database: process.env.DB_NAME || 'icp_web',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql'
  }
}
