const express = require('express')
const app = express()
const appRoot = require('app-root-path')
const session = require(`${appRoot}/src/middleware/session`)
const corsMiddleware = require(`${appRoot}/src/middleware/cors`)
const swaggerUi = require('swagger-ui-express')

module.exports = (combinedSwagger) => {
  // app.options('*', corsMiddleware)
  app.use(corsMiddleware)
  app.use(express.json())
  app.use(session)
  app.use(express.urlencoded({ extended: true }))

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(combinedSwagger))

  app.use('/auth', require(`${appRoot}/src/routes/authRoutes`))
  app.use('/admin', require(`${appRoot}/src/routes/adminRoutes`))
  app.use('/user', require(`${appRoot}/src/routes/userRoutes`))
  app.use('/restricted', require(`${appRoot}/src/routes/restrictedRoutes`))

  return app
}
