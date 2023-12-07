const express = require('express')
const router = express.Router()
const appRoot = require('app-root-path')
const adminCtrl = require(`${appRoot}/src/controllers/adminCtrl`)
const { path, logger, messenger, filePath, authenticate, restrictAccess, updateActivityTimestamp } = require(`${appRoot}/src/utils/util`)
const fileName = __filename.split(path.sep).pop()
const directory = __dirname.split(require('path').sep).pop()

router.use(authenticate)
router.use(updateActivityTimestamp)

router.post('/group-details', restrictAccess([1, 2]), async (req, res) => {
  /**
    #swagger.tags = [{ "admin + superadmin: group related" }]
    #swagger.description = "List All Group Details"
    #swagger.parameters['id'] = {
      in: 'formData',
      required: true,
      type: 'integer',
      description: 'ID of the group'
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const getDetails = await adminCtrl.groupDetail(req, res)
    return getDetails
  } catch (error) {
    logger.error(`[${directory}/${fileName}/group-details] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.get('/list-admin-groups', restrictAccess([2]), async (req, res) => {
  /**
    #swagger.tags = [{ "admin: group related" }]
    #swagger.description = "List Admin Group Details"
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const getDetails = await adminCtrl.listGroupsByAdminID(req, res)
    return getDetails
  } catch (error) {
    logger.error(`[${directory}/${fileName}/group-details] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.post('/create-project', restrictAccess([2]), async (req, res) => {
  /**
    #swagger.tags = [{ "admin: project related" }]
    #swagger.description = "Create New Project"
    #swagger.parameters['projectName'] = {
      in: 'formData',
      required: true,
      type: 'string',
      description: 'Name of the project'
    }
    #swagger.parameters['projectDescription'] = {
      in: 'formData',
      required: true,
      type: 'string',
      description: 'Description of the project'
    }
    #swagger.parameters['groupID'] = {
      in: 'formData',
      required: true,
      type: 'integer',
      description: 'Group related to the project'
    }
    #swagger.parameters['projectMembers'] = {
      in: 'formData',
      required: true,
      type: 'array',
      items: {
        type: 'integer'
      },
      collectionFormat: 'multi',
      description: 'ID list of project members'
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const createProject = await adminCtrl.createProject(req, res)
    return createProject
  } catch (error) {
    logger.error(`[${directory}/${fileName}/create-project] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.get('/list-projects', restrictAccess([1, 2]), async (req, res) => {
  /**
    #swagger.tags = [{ "admin + superadmin: project related" }]
    #swagger.description = "List All Registered Projects"
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const getProjects = await adminCtrl.listProjects(req, res)
    return getProjects
  } catch (error) {
    logger.error(`[${directory}/${fileName}/list-projects] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.get('/list-group-projects', restrictAccess([1, 2]), async (req, res) => {
  /**
    #swagger.tags = [{ "admin + superadmin: project related" }]
    #swagger.description = "List All Registered Group Projects"
    #swagger.parameters['groupID'] = {
      in: 'formData',
      required: true,
      type: 'integer',
      description: 'ID of the group'
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const getProjects = await adminCtrl.listProjectsByGroup(req, res)
    return getProjects
  } catch (error) {
    logger.error(`[${directory}/${fileName}/list-group-projects] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.get('/list-admin-projects', restrictAccess([2]), async (req, res) => {
  /**
    #swagger.tags = [{ "admin: project related" }]
    #swagger.description = "List All Registered Admin's Projects"
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const getProjects = await adminCtrl.listProjectsByAdminID(req, res)
    return getProjects
  } catch (error) {
    logger.error(`[${directory}/${fileName}/list-admin-projects] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.put('/edit-project', restrictAccess([2]), async (req, res) => {
  /**
    #swagger.tags = [{ "admin: project related" }]
    #swagger.description = "Edit Project BASIC Details: This includes deactivate/reactivate a project & remove members."
    #swagger.parameters['id'] = {
      in: 'formData',
      required: true,
      type: 'integer',
      description: 'ID of the project'
    }
    #swagger.parameters['projectName'] = {
      in: 'formData',
      required: true,
      type: 'string',
      description: 'Name of the project'
    }
    #swagger.parameters['projectDescription'] = {
      in: 'formData',
      required: true,
      type: 'string',
      description: 'Description of the project'
    }
    #swagger.parameters['isActive'] = {
      in: 'formData',
      required: true,
      type: 'boolean',
      description: 'Status of the project'
    }
    #swagger.parameters['projectMembers'] = {
      in: 'formData',
      required: true,
      type: 'array',
      items: {
        type: 'integer'
      },
      collectionFormat: 'multi',
      description: 'ID list of project members'
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const editProject = await adminCtrl.editProject(req, res)
    return editProject
  } catch (error) {
    logger.error(`[${directory}/${fileName}/edit-project] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.put('/deactivate-project', async (req, res) => {
  /**
    #swagger.tags = [{ "admin: project related" }]
    #swagger.description = "Deactivate Project Status"
    #swagger.parameters['group'] = {
      in: 'body',
      required: true,
      schema: {
        projectID: 4
      }
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const projectStatusUpdate = await adminCtrl.deactivateProject(req, res)
    return projectStatusUpdate
  } catch (error) {
    logger.error(`[${directory}/${fileName}/deactivate-project] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.put('/reactivate-project', async (req, res) => {
  /**
    #swagger.tags = [{ "admin: project related" }]
    #swagger.description = "Reactivate Project Status"
    #swagger.parameters['group'] = {
      in: 'body',
      required: true,
      schema: {
        projectID: 4
      }
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const projectStatusUpdate = await adminCtrl.reactivateProject(req, res)
    return projectStatusUpdate
  } catch (error) {
    logger.error(`[${directory}/${fileName}/reactivate-project] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

module.exports = router
