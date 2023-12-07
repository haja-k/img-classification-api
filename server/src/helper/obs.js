const appRoot = require('app-root-path')
const path = require('path')
const logger = require(`${appRoot}/src/plugins/logger`)
const fileName = __filename.split(path.sep).pop()
const directory = __dirname.split(path.sep).pop()
const { PassThrough } = require('stream')
const ObsClient = require('esdk-obs-nodejs')
const BUCKET_NAME = process.env.OBS_BUCKET
const ACCESS_KEY_ID = process.env.OBS_ACCESS_ID
const SECRET_ACCESS_KEY = process.env.OBS_SECRET_ID
const SERVER = process.env.OBS_SERVER

let obsClient

function initializeObsClient () {
  if (!obsClient) {
    obsClient = new ObsClient({
      access_key_id: ACCESS_KEY_ID,
      secret_access_key: SECRET_ACCESS_KEY,
      server: SERVER
    })
  }
}

module.exports = {
  initializeObsClient,

  checkFileMetadata: async (key) => {
    initializeObsClient()
    const res = {}
    return obsClient
      .getObjectMetadata({
        Bucket: BUCKET_NAME,
        Key: key
      })
      .then((result, err) => {
        logger.http('Status-->' + result.CommonMsg.Status)
        if (result.CommonMsg.Status < 300 && result.InterfaceResult) {
          res.success = true
          res.data = result.InterfaceResult
          return res
        } else {
          logger.error('Error--> checkFileMetadata ' + result.CommonMsg.Message)
          res.success = false
          res.data = result.CommonMsg.Message
          return res
        }
      })
  },

  upload: async (fileData, filePath, imgKey, type) => {
    initializeObsClient()
    const params = {
      Bucket: BUCKET_NAME,
      Key: imgKey,
      SourceFile: filePath,
      ContentType: type
    }
    try {
      const result = await new Promise((resolve, reject) => {
        obsClient.putObject(params, (err, data) => {
          if (err) {
            reject(err)
          } else {
            resolve(data)
          }
        })
      })
      if (result.CommonMsg.Status === 200) {
        const message = `Image ${imgKey} uploaded successfully to OBS.`
        logger.info(`[${directory}/${fileName}/upload] ${message}`)
        return { success: true, message, data: imgKey }
      } else {
        const message = `Failed to upload image ${imgKey} to OBS.`
        logger.info(`[${directory}/${fileName}/upload] ${message}`)
        return { success: false, message }
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/upload] Error uploading file to OBS: ${error}`)
      return { success: false, message: 'Internal server error' }
    }
  },

  uploadPlot: async (fileData, imgKey) => {
    initializeObsClient()
    const params = {
      Bucket: BUCKET_NAME,
      Key: imgKey,
      Body: fileData,
      ContentType: 'image/png'
    }

    try {
      const result = await new Promise((resolve, reject) => {
        obsClient.putObject(params, (err, data) => {
          if (err) {
            reject(err)
          } else {
            resolve(data)
          }
        })
      })
      if (result.CommonMsg.Status === 200) {
        const message = `Image ${imgKey} uploaded successfully to OBS.`
        logger.info(`[${directory}/${fileName}/uploadPlot] ${message}`)
        return { success: true, message, data: imgKey }
      } else {
        const message = `Failed to upload image ${imgKey} to OBS.`
        logger.info(`[${directory}/${fileName}/uploadPlot] ${message}`)
        return { success: false, message }
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/uploadPlot] Error uploading file to OBS: ${error}`)
      return { success: false, message: 'Internal server error' }
    }
  },

  streamImageFromObs: async (key) => {
    initializeObsClient()
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    }
    try {
      const response = await new Promise((resolve, reject) => {
        obsClient.getObject(params, (err, data) => {
          if (err) {
            const errorMsg = `[${directory}/${fileName}/streamImageFromObs] Error downloading file from OBS: ${err}`
            logger.error(errorMsg)
            reject(new Error(errorMsg))
          } else {
            resolve(data)
          }
        })
      })
      if (response && response.InterfaceResult && response.InterfaceResult.Content) {
        logger.info(`[${directory}/${fileName}/streamImageFromObs] File with key: ${key} successfully streamed`)
        const dataImg = response.InterfaceResult.Content
        const imageStream = new PassThrough()
        imageStream.end(dataImg)
        return imageStream
      } else {
        logger.error(`[${directory}/${fileName}/streamImageFromObs] No data in response for key: ${key}`)
        return null
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/streamImageFromObs] Error downloading file from OBS: ${error.message}`)
      return null
    }
  },

  downloadAsImage: async (key, folder) => {
    initializeObsClient()
    const parts = key.split('/')
    const charsAfterSlash = parts[1]
    return await obsClient
      .getObject({
        Bucket: BUCKET_NAME,
        Key: key,
        SaveAsFile: `${folder}/${charsAfterSlash}`
      })
      .then((result) => {
        logger.info(`[${directory}/${fileName}/downloadAsImage] Downloading file ${key} success.`)
        if (result.CommonMsg.Status < 300 && result.InterfaceResult) {
          console.log("🚀 ~ file: obs.js:165 IFFFFF")
          return result.InterfaceResult.Content
        } else {
          console.log("🚀 ~ file: obs.js:165 ELSSSEEEEE")
          logger.error(`[${directory}/${fileName}/downloadAsImage] Error downloading file from OBS ${key}: ${result.CommonMsg.Status}`)
          return result.CommonMsg
        }
      })
  },

  downloadModel: async (key) => {
    initializeObsClient()
    return await obsClient
      .getObject({
        Bucket: BUCKET_NAME,
        Key: key,
        SaveAsFile: `${appRoot}/tmp/download/${key}.h5`
      })
      .then((result) => {
        logger.info(`[${directory}/${fileName}/downloadModel] Downloading model ${key} success.`)
        if (result.CommonMsg.Status < 300 && result.InterfaceResult) {
          return result.InterfaceResult.Content
        } else {
          logger.error(`[${directory}/${fileName}/downloadModel] Error downloading model from OBS ${key}: ${result.CommonMsg.Status}`)
          return result.CommonMsg
        }
      })
  },

  listFile: async () => {
    initializeObsClient()
    return await obsClient
      .listObjects({
        Bucket: BUCKET_NAME,
        Key: ''
      })
      .then((result) => {
        console.log('🚀 ~ file: obs.js:220 ~ .then ~ result:', result)
        if (result.CommonMsg.Status < 300) {
          return result.InterfaceResult.Contents
        } else {
          logger.error('Error--> listFile')
          return result.CommonMsg
        }
      })
  }

}
