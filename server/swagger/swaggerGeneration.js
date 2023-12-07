const dotenv = require('dotenv')
const appRoot = require('app-root-path')
const generateSwaggerDocument = require(`${appRoot}/swagger/swaggerGenerator`)

dotenv.config({ path: '.env.local' })

const appURL = process.env.APP_URL || 'http://localhost'

const generateSwagger = async () => {
  try {
    const [authRoutesSwagger, adminRoutesSwagger, userRoutesSwagger, restrictedRoutesSwagger] = await Promise.all([
      generateSwaggerDocument(
        `${appRoot}/swagger/documentations/authRoutesSwagger.json`,
        [`${appRoot}/src/routes/authRoutes.js`],
        {
          host: process.env.HOST || appURL,
          basePath: '/auth'
        }
      ),
      generateSwaggerDocument(
        `${appRoot}/swagger/documentations/adminRoutesSwagger.json`,
        [`${appRoot}/src/routes/adminRoutes.js`],
        {
          host: process.env.HOST || appURL,
          basePath: '/admin'
        }
      ),
      generateSwaggerDocument(
        `${appRoot}/swagger/documentations/userRoutesSwagger.json`,
        [`${appRoot}/src/routes/userRoutes.js`],
        {
          host: process.env.HOST || appURL,
          basePath: '/user'
        }
      ),
      generateSwaggerDocument(
        `${appRoot}/swagger/documentations/restrictedRoutesSwagger.json`,
        [`${appRoot}/src/routes/restrictedRoutes.js`],
        {
          host: process.env.HOST || appURL,
          basePath: '/restricted'
        }
      )
    ])

    const basePath = {
      auth: '/auth',
      admin: '/admin',
      user: '/user',
      restricted: '/restricted'
    }

    const addBasePath = (swagger, prefix) => {
      const paths = {}
      for (const [path, route] of Object.entries(swagger.paths)) {
        paths[prefix + path] = route
      }
      swagger.paths = paths
    }

    addBasePath(authRoutesSwagger, basePath.auth)
    addBasePath(adminRoutesSwagger, basePath.admin)
    addBasePath(userRoutesSwagger, basePath.user)
    addBasePath(restrictedRoutesSwagger, basePath.restricted)

    const combinedSwagger = {
      swagger: '2.0',
      info: {
        version: '1.0.0',
        title: 'Image Classifications Platform',
        description: 'API Documentation'
      },
      paths: {
        ...authRoutesSwagger.paths,
        ...adminRoutesSwagger.paths,
        ...userRoutesSwagger.paths,
        ...restrictedRoutesSwagger.paths
      }
    }

    return combinedSwagger
  } catch (error) {
    console.error('Error generating Swagger documentation:', error)
    process.exit(1)
  }
}

module.exports = generateSwagger
