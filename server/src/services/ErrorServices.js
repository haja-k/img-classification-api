// const { Op, where } = require('sequelize')
const appRoot = require('app-root-path')
const { path, logger, database } = require(`${appRoot}/src/utils/util`)
const fileName = __filename.split(path.sep).pop()
const directory = __dirname.split(path.sep).pop()

module.exports = {
  fetchError: async (code) => {
    try {
      const errorData = await database.ErrorCode.findOne({
        where: {
          code
        }
      })

      return errorData
    } catch (error) {
      logger.error(`[${directory}/${fileName}/fetchError] Error retrieving error data: ${code} - ` + error)
      throw error
    }
  }
}
