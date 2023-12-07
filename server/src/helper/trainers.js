const appRoot = require('app-root-path')
const logger = require(`${appRoot}/src/plugins/logger`)
const getNameSvc = require(`${appRoot}/src/services/DropdownServices`)
const path = require('path')
const fileName = __filename.split(path.sep).pop()
const directory = __dirname.split(require('path').sep).pop()

async function getModelName (modelID) {
  return await getNameSvc.modelName(modelID)
}

async function getOptimizerName (optimizerID) {
  return await getNameSvc.optimizerName(optimizerID)
}

async function getLossName (lossID) {
  return await getNameSvc.loseName(lossID)
}

async function transformTrainingJson (projectID, projectVersionID, input) {
  logger.info(`[${directory}/${fileName}/transformTrainingJson] Map training data into acceptable worker input for Project ${projectID} v${projectVersionID}`)
  const modelParamMapping = {
    modelID: 'model_name',
    numClasses: 'num_classes',
    inputShape: 'input_shape',
    denseNeurons: 'dense_neurons'
  }
  const trainingParamMapping = {
    optimizerID: 'optimizer',
    lossID: 'loss',
    epoch: 'epoch',
    batchSize: 'batch_size',
    learningRate: 'learning_rate'
  }
  async function transformKeys (obj, mapping) {
    const transformed = {}
    for (const key of Object.keys(obj)) {
      if (key === 'inputShape') {
        transformed[mapping[key] || key] = obj[key]
      } else if (typeof obj[key] === 'object') {
        transformed[mapping[key] || key] = await transformKeys(obj[key], mapping)
      } else {
        transformed[mapping[key] || key] = obj[key]
        if (mapping[key] === 'model_name') {
          transformed[mapping[key]] = await getModelName(obj[key])
        }
        if (mapping[key] === 'optimizer') {
          transformed[mapping[key]] = await getOptimizerName(obj[key])
        }
        if (mapping[key] === 'loss') {
          transformed[mapping[key]] = await getLossName(obj[key])
        }
      }
    }
    return transformed
  }
  const transformed = {
    project_id: `${projectID}_${projectVersionID}`,
    model_params: await transformKeys(input.modelParams, modelParamMapping),
    training_params: await transformKeys(input.trainingParams, trainingParamMapping)
  }
  logger.info(`[${directory}/${fileName}/transformTrainingJson] Preparing JSON for worker training transaction`)
  return transformed
}

module.exports = {
  transformTrainingJson
}
