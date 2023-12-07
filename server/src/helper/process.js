const appRoot = require('app-root-path')
const logger = require(`${appRoot}/src/plugins/logger`)
const messenger = require(`${appRoot}/src/helper/messenger`)
const getNameSvc = require(`${appRoot}/src/services/DropdownServices`)
const filePath = `${appRoot}/src/config/messages.json`
const path = require('path')
const fs = require('fs')
const fileName = __filename.split(path.sep).pop()
const directory = __dirname.split(require('path').sep).pop()
const { Stream } = require('stream')

function usernameExtraction (email) {
  try {
    if (!email) {
      const message = messenger(filePath, 'emailRequired')
      throw new Error(message)
    }
    const username = email.includes('@') ? email.split('@')[0] : email
    return {
      error: false,
      data: username
    }
  } catch (error) {
    const message = messenger(filePath, 'nameExtractError') + ': ' + error.message
    logger.error(`[${directory}/${fileName}/usernameExtraction] ${message}`)
    return {
      error: true,
      message
    }
  }
}

function isValidEmail (email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function userLoginError (e) {
  logger.error(`[${directory}/${fileName}/userLoginError] ${e}`)
  const emptyUsername = 'empty username'
  const err = e.toString()
  if (err.includes(emptyUsername)) {
    return messenger(filePath, 'noUsernameORPassword')
  } else {
    return typeof e === 'object' ? e.name : e
  }
}

function generateUniqueKey () {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const keyLength = 5
  let uniqueKey = ''
  for (let i = 0; i < keyLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    uniqueKey += characters.charAt(randomIndex)
  }
  return uniqueKey
}

function deleteOldLogFiles (logDir) {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 60)
    const files = fs.readdirSync(logDir)
    files.forEach((file) => {
      if (file.match(/^\d{2}_\d{2}_\d{4}\.log$/)) {
        const fileDateParts = file.split('.')[0].split('_')
        const fileDate = new Date(`${fileDateParts[2]}-${fileDateParts[1]}-${fileDateParts[0]}`)
        if (fileDate < thirtyDaysAgo) {
          const filePath = path.join(logDir, file)
          fs.unlinkSync(filePath)
          logger.info(`[${directory}/${fileName}/deleteOldLogFiles] Deleted ${file} from ${logDir} which was created more than 30 days ago `)
        }
      }
    })
  } catch (error) {
    logger.error(`[${directory}/${fileName}/deleteOldLogFiles] Error in deleteOldLogFiles: ${error}`)
  }
}

function deleteFolders (folderPath) {
  try {
    const now = new Date()
    const oneDayAgo = new Date(now)
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    const items = fs.readdirSync(folderPath)
    for (const item of items) {
      const itemPath = path.join(folderPath, item)
      const stats = fs.statSync(itemPath)
      if (stats.isDirectory() && stats.mtime < oneDayAgo) {
        logger.info(`[${directory}/${fileName}/deleteFolders] Deleting folder: ${itemPath}`)
        deleteFolderRecursive(itemPath)
      }
    }
  } catch (error) {
    logger.error(`[${directory}/${fileName}/deleteFolders] Error in deleteFolders: ${error}`)
  }
}

function deleteFolderRecursive (folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file, index) => {
      const curPath = path.join(folderPath, file)
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(folderPath)
  }
}

function countFolders (directoryPath) {
  try {
    const files = fs.readdirSync(directoryPath)
    const folderCount = files.filter(file => fs.statSync(path.join(directoryPath, file)).isDirectory()).length

    return folderCount
  } catch (error) {
    console.error(`Error counting folders: ${error.message}`)
    return -1 // Return -1 to indicate an error
  }
}

function getContentType (filename) {
  const extension = path.extname(filename).toLowerCase()
  if (extension === '.jpg' || extension === '.jpeg') {
    return 'image/jpeg'
  } else if (extension === '.png') {
    return 'image/png'
  } else {
    return 'application/octet-stream'
  }
}

async function getColorModeName (colorModeID) {
  return await getNameSvc.colorModeName(colorModeID)
}
async function getNormName (normalizationID) {
  return await getNameSvc.normName(normalizationID)
}
async function getAugModeName (augmentationID) {
  return await getNameSvc.augModeName(augmentationID)
}
async function getSamplingName (samplingID) {
  return await getNameSvc.samplingName(samplingID)
}
async function mapProjectDataToJSON (projectID, projectVersionID, projectData) {
  logger.info(`[${directory}/${fileName}/mapProjectDataToJSON] Map PPD into acceptable worker input for Project ${projectID} v${projectVersionID}`)
  const steps = []
  async function handleColorMode (item) {
    if (item.colorModeID) {
      return {
        load: {
          colour_mode: await getColorModeName(item.colorModeID)
        }
      }
    }
    return null
  }
  async function handleNormalization (item) {
    if (item.normalize && item.normalize.normalizationID) {
      return {
        normalize: {
          normalization_mode: await getNormName(item.normalize.normalizationID)
        }
      }
    }
    return null
  }
  async function handleResize (item) {
    if (item.resize && item.resize.resizeHeight) {
      return {
        resize: {
          width: parseInt(item.resize.resizeWidth, 10),
          height: parseInt(item.resize.resizeHeight, 10)
        }
      }
    }
    return null
  }
  async function handleAugmentation (item) {
    if (item.augment && item.augment.augmentationID) {
      return {
        augment: {
          augmentation_mode: await getAugModeName(item.augment.augmentationID),
          ratio: parseFloat(item.augment.augmentationRatio),
          value: item.augment.augmentationValue
        }
      }
    }
    return null
  }
  async function handleBalance (item) {
    if (item.balance && item.balance.samplingID) {
      return {
        balance: {
          sampling_mode: await getSamplingName(item.balance.samplingID)
        }
      }
    }
    return null
  }
  async function handleDataSplit (item) {
    if (item.split) {
      return {
        split: {
          val_ratio: parseFloat(item.split.valRatio),
          test_ratio: parseFloat(item.split.testRatio)
        }
      }
    }
    return null
  }
  const splitSteps = []
  for (const item of projectData) {
    const stepPromises = [
      handleColorMode(item),
      handleNormalization(item),
      handleResize(item),
      handleAugmentation(item),
      handleBalance(item),
      handleDataSplit(item)
    ]
    const resolvedSteps = await Promise.all(stepPromises)
    const validSteps = resolvedSteps.filter(step => step !== null)
    if (validSteps.length > 0) {
      steps.push(...validSteps)
    }
    const splitStep = await handleDataSplit(item)
    if (splitStep) {
      splitSteps.push(splitStep)
    }
  }
  steps.push(...splitSteps)
  const jsonResult = {
    project_id: `${projectID}_${projectVersionID}`,
    steps
  }
  logger.info(`[${directory}/${fileName}/mapProjectDataToJSON] Preparing JSON for worker PPD transaction`)
  return jsonResult
}

function streamToBuffer (stream) {
  return new Promise((resolve, reject) => {
    if (!(stream instanceof Stream.Readable)) {
      reject(new Error('Input must be a Readable Stream'))
      return
    }

    const chunks = []
    stream.on('data', (chunk) => {
      chunks.push(chunk)
    })

    stream.on('end', () => {
      resolve(Buffer.concat(chunks))
    })

    stream.on('error', (error) => {
      reject(error)
    })
  })
}

function streamToBase64Promise (stream) {
  return new Promise((resolve, reject) => {
    if (!stream || typeof stream.on !== 'function') {
      reject(new Error('Input must be a readable stream'))
      return
    }

    const chunks = []
    stream.on('data', (chunk) => {
      chunks.push(chunk)
    })

    stream.on('end', () => {
      try {
        const uint8Array = new Uint8Array(Buffer.concat(chunks))
        const base64String = Buffer.from(uint8Array).toString('base64')
        resolve(base64String)
      } catch (error) {
        reject(error)
      }
    })

    stream.on('error', (error) => {
      reject(error)
    })
  })
}

function binaryToBase64Promise (data) {
  return new Promise((resolve, reject) => {
    try {
      const base64String = Buffer.from(data).toString('base64')
      resolve(base64String)
    } catch (error) {
      reject(error)
    }
  })
}

async function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = {
  usernameExtraction,
  isValidEmail,
  userLoginError,
  generateUniqueKey,
  deleteFolders,
  deleteOldLogFiles,
  deleteFolderRecursive,
  getContentType,
  mapProjectDataToJSON,
  streamToBuffer,
  streamToBase64Promise,
  binaryToBase64Promise,
  countFolders,
  sleep
}
