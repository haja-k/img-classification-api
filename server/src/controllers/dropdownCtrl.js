const appRoot = require('app-root-path')
const { path, logger, messenger, filePath, dropdownSvc } = require(`${appRoot}/src/utils/util`)
const { send } = require(`${appRoot}/src/utils/serve`)
const fileName = __filename.split(path.sep).pop()
const directory = __dirname.split(path.sep).pop()

module.exports = {
  dropdownColorMode: async (req, res) => {
    try {
      const colorModes = await dropdownSvc.colorModeOpt()
      const message = messenger(filePath, 'msgValueRetrieved')
      logger.info(`[${directory}/${fileName}/dropdownColorMode] ${message}`)
      return send(res, true, message, 200, colorModes)
    } catch (error) {
      const errorMessage = messenger(filePath, 'internalError')
      logger.error(`[${directory}/${fileName}/dropdownColorMode] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  dropdownVersions: async (req, res) => {
    try {
      const versions = await dropdownSvc.projectVersionDrops(req.body.projectID)
      const filteredVersions = versions.versions.filter(detail => {
        return detail.target.length !== 0
      })
      logger.info(`[${directory}/${fileName}/dropdownVersions] Version Retrieved.`)
      return send(res, true, 'Version Retrieved.', 200, filteredVersions)
    } catch (error) {
      const errorMessage = messenger(filePath, 'internalError')
      logger.error(`[${directory}/${fileName}/dropdownVersions] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  dropdownNormalizations: async (req, res) => {
    try {
      const normalizations = await dropdownSvc.normalizationOpt()
      const message = messenger(filePath, 'msgValueRetrieved')
      logger.info(`[${directory}/${fileName}/dropdownNormalizations] ${message}`)
      return send(res, true, message, 200, normalizations)
    } catch (error) {
      const errorMessage = messenger(filePath, 'internalError')
      logger.error(`[${directory}/${fileName}/dropdownNormalizations] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  dropdownSampling: async (req, res) => {
    try {
      const sampling = await dropdownSvc.samplingOpt()
      const message = messenger(filePath, 'msgValueRetrieved')
      logger.info(`[${directory}/${fileName}/dropdownSampling] ${message}`)
      return send(res, true, message, 200, sampling)
    } catch (error) {
      const errorMessage = messenger(filePath, 'internalError')
      logger.error(`[${directory}/${fileName}/dropdownSampling] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  dropdownAugmentation: async (req, res) => {
    try {
      const augmentation = await dropdownSvc.augmentOpt()
      const message = messenger(filePath, 'msgValueRetrieved')
      logger.info(`[${directory}/${fileName}/dropdownAugmentation] ${message}`)
      return send(res, true, message, 200, augmentation)
    } catch (error) {
      const errorMessage = messenger(filePath, 'internalError')
      logger.error(`[${directory}/${fileName}/dropdownAugmentation] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  dropdownModel: async (req, res) => {
    try {
      const modelDrops = await dropdownSvc.modelOpt()
      const message = messenger(filePath, 'msgValueRetrieved')
      logger.info(`[${directory}/${fileName}/dropdownModel] ${message}`)
      return send(res, true, message, 200, modelDrops)
    } catch (error) {
      const errorMessage = messenger(filePath, 'internalError')
      logger.error(`[${directory}/${fileName}/dropdownModel] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  dropdownOptimizer: async (req, res) => {
    try {
      const optimizer = await dropdownSvc.optimizerOpt()
      const message = messenger(filePath, 'msgValueRetrieved')
      logger.info(`[${directory}/${fileName}/dropdownOptimizer] ${message}`)
      return send(res, true, message, 200, optimizer)
    } catch (error) {
      const errorMessage = messenger(filePath, 'internalError')
      logger.error(`[${directory}/${fileName}/dropdownOptimizer] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  dropdownLoss: async (req, res) => {
    try {
      const loss = await dropdownSvc.loseOpt()
      const message = messenger(filePath, 'msgValueRetrieved')
      logger.info(`[${directory}/${fileName}/dropdownLoss] ${message}`)
      return send(res, true, message, 200, loss)
    } catch (error) {
      const errorMessage = messenger(filePath, 'internalError')
      logger.error(`[${directory}/${fileName}/dropdownLoss] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  }
}
