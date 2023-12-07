const appRoot = require('app-root-path')
const logger = require(`${appRoot}/src/plugins/logger`)
const database = require(`${appRoot}/src/sequelize/models`)
const path = require('path')
const fileName = __filename.split(path.sep).pop()
const directory = __dirname.split(path.sep).pop()

module.exports = {
  projectVersionDrops: async (projectID) => {
    try {
      const projectVersions = await database.Project_Version.findAll({
        where: { project_id: projectID },
        include: {
          model: database.Target_Class_Detail,
          attributes: ['id', 'name']
        }
      })
      const versions = projectVersions.map((version) => ({
        id: version.id,
        name: version.name,
        target: (version.Target_Class_Details || []).map((target) => ({
          id: target.id,
          name: target.name
        }))
      }))
      const result = {
        versions
      }
      return result
    } catch (error) {
      logger.error(`[${directory}/${fileName}/projectVersionDrops] Error finding project: ${projectID} - ` + error)
      throw error
    }
  },
  colorModeOpt: async () => {
    try {
      const colorMode = await database.Color_Mode.findAll({
        attributes: ['id', 'name']
      })
      return colorMode
    } catch (error) {
      logger.error(`[${directory}/${fileName}/colorModeOpt] Error retrieving color modes ${error}`)
      throw error
    }
  },
  normalizationOpt: async () => {
    try {
      const normalizations = await database.Normalization.findAll({
        attributes: ['id', 'name']
      })
      return normalizations
    } catch (error) {
      logger.error(`[${directory}/${fileName}/colorModeOpt] Error retrieving normalizations ${error}`)
      throw error
    }
  },
  samplingOpt: async () => {
    try {
      const sampling = await database.Sampling.findAll({
        attributes: ['id', 'name']
      })
      return sampling
    } catch (error) {
      logger.error(`[${directory}/${fileName}/samplingOpt] Error retrieving sampling ${error}`)
      throw error
    }
  },
  augmentOpt: async () => {
    try {
      const augment = await database.Augmentation.findAll({
        attributes: ['id', 'name']
      })
      return augment
    } catch (error) {
      logger.error(`[${directory}/${fileName}/augmentOpt] Error retrieving augment ${error}`)
      throw error
    }
  },
  optimizerOpt: async () => {
    try {
      const optimizer = await database.Optimizer.findAll({
        attributes: ['id', 'name']
      })
      return optimizer
    } catch (error) {
      logger.error(`[${directory}/${fileName}/optimizerOpt] Error retrieving optimizer ${error}`)
      throw error
    }
  },
  loseOpt: async () => {
    try {
      const lose = await database.Lose.findAll({
        attributes: ['id', 'name']
      })
      return lose
    } catch (error) {
      logger.error(`[${directory}/${fileName}/loseOpt] Error retrieving lose ${error}`)
      throw error
    }
  },
  modelOpt: async () => {
    try {
      const model = await database.Model.findAll({
        attributes: ['id', 'name', 'description']
      })
      return model
    } catch (error) {
      logger.error(`[${directory}/${fileName}/modelOpt] Error retrieving model ${error}`)
      throw error
    }
  },
  modelName: async (id) => {
    try {
      const model = await database.Model.findOne({
        where: { id },
        attributes: ['name']
      })
      return model.name
    } catch (error) {
      logger.error(`[${directory}/${fileName}/modelOpt] Error retrieving model name ${error}`)
      throw error
    }
  },
  loseName: async (id) => {
    try {
      const lose = await database.Lose.findOne({
        where: { id },
        attributes: ['name']
      })
      return lose.name
    } catch (error) {
      logger.error(`[${directory}/${fileName}/loseOpt] Error retrieving lose name ${error}`)
      throw error
    }
  },
  optimizerName: async (id) => {
    try {
      const optimizer = await database.Optimizer.findOne({
        where: { id },
        attributes: ['name']
      })
      return optimizer.name
    } catch (error) {
      logger.error(`[${directory}/${fileName}/optimizerOpt] Error retrieving optimizer name ${error}`)
      throw error
    }
  },
  colorModeName: async (id) => {
    try {
      const colorMode = await database.Color_Mode.findOne({
        where: { id },
        attributes: ['name']
      })
      return colorMode.name
    } catch (error) {
      logger.error(`[${directory}/${fileName}/colorModeOpt] Error retrieving color modes ${error}`)
      throw error
    }
  },
  normName: async (id) => {
    try {
      const normName = await database.Normalization.findOne({
        where: { id },
        attributes: ['name']
      })
      return normName.name.replace(/ /g, '_')
    } catch (error) {
      logger.error(`[${directory}/${fileName}/normName] Error retrieving normalization name ${error}`)
      throw error
    }
  },
  augModeName: async (id) => {
    try {
      const augMode = await database.Augmentation.findOne({
        where: { id },
        attributes: ['name']
      })
      const augModeName = augMode.name.replace(/ /g, '_')
      return augModeName
    } catch (error) {
      logger.error(`[${directory}/${fileName}/augModeName] Error retrieving augmentation name ${error}`)
      throw error
    }
  },
  samplingName: async (id) => {
    try {
      const samplingName = await database.Sampling.findOne({
        where: { id },
        attributes: ['name']
      })
      return samplingName.name
    } catch (error) {
      logger.error(`[${directory}/${fileName}/samplingName] Error retrieving sampling name ${error}`)
      throw error
    }
  }
}
