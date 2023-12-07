const swaggerAutogen = require('swagger-autogen')()

async function generateSwaggerDocument (outputFile, endpointsFiles, swaggerOptions) {
  try {
    await swaggerAutogen(outputFile, endpointsFiles, swaggerOptions)
    return require(outputFile)
  } catch (error) {
    console.error('Error generating Swagger documentation:', error)
    process.exit(1)
  }
}

module.exports = generateSwaggerDocument
