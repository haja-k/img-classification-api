const express = require('express')
const router = express.Router()
const appRoot = require('app-root-path')
const userCtrl = require(`${appRoot}/src/controllers/userCtrl`)
const dropCtrl = require(`${appRoot}/src/controllers/dropdownCtrl`)
const { path, logger, messenger, filePath, upload, authenticate, restrictAccess, updateActivityTimestamp } = require(`${appRoot}/src/utils/util`)
const fileName = __filename.split(path.sep).pop()
const directory = __dirname.split(require('path').sep).pop()

router.put('/change-password', async (req, res) => {
  /**
    #swagger.tags = [{ "user" }]
    #swagger.description = "Change Account Password"
    #swagger.parameters['password'] = {
      in: 'body',
      required: false,
      schema: {
        email: "dwightschrute@sains.com.my",
        oldPassword: "",
        newPassword: "dwightschrute",
      }
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const changePassword = await userCtrl.changePassword(req, res)
    return changePassword
  } catch (error) {
    logger.error(`[${directory}/${fileName}/change-password] ${error}`)
    res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.use(authenticate)
router.use(updateActivityTimestamp)

router.get('/profile', restrictAccess([1, 2, 3]), async (req, res) => {
  /**
    #swagger.tags = [{ "user" }]
    #swagger.description = "User Profile"
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const getUserDetails = await userCtrl.getUserDetails(req, res)
    return getUserDetails
  } catch (error) {
    logger.error(`[${directory}/${fileName}/profile] ${error}`)
    res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.get('/list-auth-projects', restrictAccess([2, 3]), async (req, res) => {
  /**
    #swagger.tags = [{ "user + admin: project related" }]
    #swagger.description = "List All Authorized Registered Projects"
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const getProjects = await userCtrl.listMyProjects(req, res)
    return getProjects
  } catch (error) {
    logger.error(`[${directory}/${fileName}/list-projects] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.post('/project-details', restrictAccess([1, 2, 3]), async (req, res) => {
  /**
    #swagger.tags = [{ "public: project related" }]
    #swagger.description = "List All Authorized Project Details: For users with "user" or "admin" role, they can only view project details based on their groupID "
    #swagger.parameters['id'] = {
      in: 'formData',
      required: true,
      type: 'integer',
      description: 'ID of the project'
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const getDetails = await userCtrl.projectDetail(req, res)
    return getDetails
  } catch (error) {
    logger.error(`[${directory}/${fileName}/create-project] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.post('/create-project-version', restrictAccess([2, 3]), async (req, res) => {
  /**
    #swagger.tags = [{ "user + admin: project related" }]
    #swagger.description = "Create New Project Version"
    #swagger.parameters['versionName'] = {
      in: 'formData',
      required: true,
      type: 'string',
      description: 'Name of the version'
    }
    #swagger.parameters['versionDescription'] = {
      in: 'formData',
      required: true,
      type: 'string',
      description: 'Description of the version'
    }
    #swagger.parameters['projectID'] = {
      in: 'formData',
      required: true,
      type: 'integer',
      description: 'Project ID related to the version'
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const createProjectVersion = await userCtrl.createProjectVersion(req, res)
    return createProjectVersion
  } catch (error) {
    logger.error(`[${directory}/${fileName}/create-project-version] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.put('/edit-project-version', restrictAccess([2, 3]), async (req, res) => {
  /**
    #swagger.tags = [{ "user + admin: project related" }]
    #swagger.description = "Edit Project BASIC Details: This includes deactivate/reactivate a project & remove members."
    #swagger.parameters['projectVersionID'] = {
      in: 'formData',
      required: true,
      type: 'integer',
      description: 'ID of the version'
    }
    #swagger.parameters['projectID'] = {
      in: 'formData',
      required: true,
      type: 'integer',
      description: 'Project ID of the version'
    }
    #swagger.parameters['versionName'] = {
      in: 'formData',
      required: true,
      type: 'string',
      description: 'Name of the version'
    }
    #swagger.parameters['versionDescription'] = {
      in: 'formData',
      required: true,
      type: 'string',
      description: 'Description of the version'
    }
    #swagger.parameters['isActive'] = {
      in: 'formData',
      required: true,
      type: 'boolean',
      description: 'Validity status of the version'
    }
    #swagger.parameters['preprocess_progress'] = {
      in: 'formData',
      required: true,
      type: 'integer',
      collectionFormat: 'multi',
      description: 'Status of the project'
    }
    #swagger.parameters['training_progress'] = {
      in: 'formData',
      required: true,
      type: 'integer',
      collectionFormat: 'multi',
      description: 'Status of the project'
    }
    #swagger.parameters['color_mode'] = {
      in: 'formData',
      required: true,
      type: 'integer',
      collectionFormat: 'multi',
      description: 'Status of the project'
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const editProjectVersion = await userCtrl.editProjectVersion(req, res)
    return editProjectVersion
  } catch (error) {
    logger.error(`[${directory}/${fileName}/edit-project-version] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.post('/pv-options', restrictAccess([1, 2, 3]), async (req, res) => {
  /**
    #swagger.tags = [{ "dropdown options" }]
    #swagger.description = "Porject Version Options"
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const pv = await dropCtrl.dropdownVersions(req, res)
    return pv
  } catch (error) {
    logger.error(`[${directory}/${fileName}/pv-options] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.get('/color-options', restrictAccess([1, 2, 3]), async (req, res) => {
  /**
    #swagger.tags = [{ "dropdown options" }]
    #swagger.description = "Color Options"
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const colorModes = await dropCtrl.dropdownColorMode(req, res)
    return colorModes
  } catch (error) {
    logger.error(`[${directory}/${fileName}/color-options] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.get('/normalization-options', restrictAccess([1, 2, 3]), async (req, res) => {
  /**
    #swagger.tags = [{ "dropdown options" }]
    #swagger.description = "Normalization Options"
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const normalization = await dropCtrl.dropdownNormalizations(req, res)
    return normalization
  } catch (error) {
    logger.error(`[${directory}/${fileName}/normalization-options] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.get('/sampling-options', restrictAccess([1, 2, 3]), async (req, res) => {
  /**
    #swagger.tags = [{ "dropdown options" }]
    #swagger.description = "Sampling Options"
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const sampling = await dropCtrl.dropdownSampling(req, res)
    return sampling
  } catch (error) {
    logger.error(`[${directory}/${fileName}/sampling-options] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.get('/augmentation-options', restrictAccess([1, 2, 3]), async (req, res) => {
  /**
    #swagger.tags = [{ "dropdown options" }]
    #swagger.description = "Sampling Options"
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const augmentation = await dropCtrl.dropdownAugmentation(req, res)
    return augmentation
  } catch (error) {
    logger.error(`[${directory}/${fileName}/augmentation-options] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.get('/model-options', restrictAccess([1, 2, 3]), async (req, res) => {
  /**
    #swagger.tags = [{ "dropdown options" }]
    #swagger.description = "Normalization Options"
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const model = await dropCtrl.dropdownModel(req, res)
    return model
  } catch (error) {
    logger.error(`[${directory}/${fileName}/model-options] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.get('/optimizer-options', restrictAccess([1, 2, 3]), async (req, res) => {
  /**
    #swagger.tags = [{ "dropdown options" }]
    #swagger.description = "Sampling Options"
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const optimizer = await dropCtrl.dropdownOptimizer(req, res)
    return optimizer
  } catch (error) {
    logger.error(`[${directory}/${fileName}/optimizer-options] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.get('/loss-options', restrictAccess([1, 2, 3]), async (req, res) => {
  /**
    #swagger.tags = [{ "dropdown options" }]
    #swagger.description = "Sampling Options"
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const loss = await dropCtrl.dropdownLoss(req, res)
    return loss
  } catch (error) {
    logger.error(`[${directory}/${fileName}/loss-options'] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.post('/upload', restrictAccess([1, 2, 3]), upload.array('files'), async (req, res) => {
  /**
    #swagger.tags = [{ "public: project related" }]
    #swagger.description = "upload images for the project"
    #swagger.parameters['files'] = {
      in: 'formData',
      required: true,
      type: 'file',
      description: 'The folder to upload'
    }
    #swagger.responses['200'] = { description: "Folder uploaded successfully." }
    #swagger.responses['500'] = { description: "Bad request - Invalid file or folder." }
  */
  try {
    const uploadItems = await userCtrl.upload(req, res)
    return uploadItems
  } catch (error) {
    logger.error(`[${directory}/${fileName}/upload] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.get('/download', restrictAccess([1, 2, 3]), async (req, res) => {
  /**
    #swagger.tags = [{ "public: project related" }]
    #swagger.description = "download images for the project"
    #swagger.parameters['projectVersion'] = {
      in: 'formData',
      required: true,
      type: 'integer',
      description: 'ID of the project version'
    }
    #swagger.parameters['projectID'] = {
      in: 'formData',
      required: true,
      type: 'integer',
      description: 'ID of the project'
    }
    #swagger.responses['200'] = { description: "Folder uploaded successfully." }
    #swagger.responses['500'] = { description: "Bad request - Invalid file or folder." }
  */
  try {
    const downloadItems = await userCtrl.download(req, res)
    return downloadItems
  } catch (error) {
    logger.error(`[${directory}/${fileName}/download] ${error}`)
    // return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.post('/stream-images', restrictAccess([1, 2, 3]), async (req, res) => {
  try {
    const downloadItems = await userCtrl.streamImages(req, res)
    if (req.io) {
      req.io.emit('image-stream', downloadItems)
    }
    return downloadItems
  } catch (error) {
    logger.error(`[${directory}/${fileName}/stream-images] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.post('/preprocessing', restrictAccess([2, 3]), async (req, res) => {
  try {
    const preprocessResult = await userCtrl.addPreprocessDetails(req, res)
    return preprocessResult
  } catch (error) {
    logger.error(`[${directory}/${fileName}/preprocessing] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.post('/ppd-progress', async (req, res) => {
  /**
    #swagger.tags = [{ "user + admin: project related" }]
    #swagger.description = "Project Version Preprocess Progress"
    #swagger.parameters['projectVersionID'] = {
      in: 'formData',
      required: true,
      type: 'integer',
      description: 'Project Version ID related to the version'
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const getPPDProgress = await userCtrl.checkPreprocessStatus(req, res)
    return getPPDProgress
  } catch (error) {
    logger.error(`[${directory}/${fileName}/ppd-progress] ${error}`)
    res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.post('/training-progress', async (req, res) => {
  /**
    #swagger.tags = [{ "user + admin: project related" }]
    #swagger.description = "Project Version Training Progress"
    #swagger.parameters['projectVersionID'] = {
      in: 'formData',
      required: true,
      type: 'integer',
      description: 'Project Version ID related to the version'
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const getTrainingProgress = await userCtrl.checkTrainingStatus(req, res)
    return getTrainingProgress
  } catch (error) {
    logger.error(`[${directory}/${fileName}/training-progress] ${error}`)
    res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.get('/project-session-data', async (req, res) => {
  /**
    #swagger.tags = [{ "user + admin: project related" }]
    #swagger.description = "Project Session Data"
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const getProject = await userCtrl.projectSessionData(req, res)
    return getProject
  } catch (error) {
    logger.error(`[${directory}/${fileName}/project-session-data] ${error}`)
    res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.post('/project-session-clear', async (req, res) => {
  /**
    #swagger.tags = [{ "user + admin: project related" }]
    #swagger.description = "Project Session Clear"
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const clearProject = await userCtrl.deleteProjectSession(req, res)
    return clearProject
  } catch (error) {
    logger.error(`[${directory}/${fileName}/project-session-clear] ${error}`)
    res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.post('/training-submit', async (req, res) => {
  /**
    #swagger.tags = [{ "user + admin: project related" }]
    #swagger.description = "Training Parameter Submission"
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const trainingSubmit = await userCtrl.trainingSubmit(req, res)
    return trainingSubmit
  } catch (error) {
    logger.error(`[${directory}/${fileName}/training-submit] ${error}`)
    res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.post('/export', async (req, res) => {
  /**
    #swagger.tags = [{ "user + admin: project related" }]
    #swagger.description = "Export Dockerfile"
    #swagger.parameters['projectID'] = {
      in: 'formData',
      required: true,
      type: 'integer',
      description: 'Project ID related to the version'
    }
    #swagger.parameters['projectVersionID'] = {
      in: 'formData',
      required: true,
      type: 'integer',
      description: 'Project Version ID related to the version'
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const getManual = await userCtrl.generateManual(req, res)
    return getManual
  } catch (error) {
    logger.error(`[${directory}/${fileName}/export] ${error}`)
    res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.post('/get-assets', async (req, res) => {
  /**
    #swagger.tags = [{ "user + admin: project related" }]
    #swagger.description = "Project Version Model Assets"
    #swagger.parameters['projectID'] = {
      in: 'formData',
      required: true,
      type: 'integer',
      description: 'Project ID related to the version'
    }
    #swagger.parameters['projectVersionID'] = {
      in: 'formData',
      required: true,
      type: 'integer',
      description: 'Project Version ID related to the version'
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const getAssets = await userCtrl.getAssets(req, res)
    return getAssets
  } catch (error) {
    logger.error(`[${directory}/${fileName}/get-assets] ${error}`)
    res.status(500).send(messenger(filePath, 'internalError'))
  }
})

module.exports = router
