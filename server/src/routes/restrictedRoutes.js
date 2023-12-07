const express = require('express')
const router = express.Router()
const appRoot = require('app-root-path')
const restrictedCtrl = require(`${appRoot}/src/controllers/restrictedCtrl`)
const adminCtrl = require(`${appRoot}/src/controllers/adminCtrl`)
const { path, logger, messenger, filePath, authenticate, restrictAccess, updateActivityTimestamp } = require(`${appRoot}/src/utils/util`)
const fileName = __filename.split(path.sep).pop()
const directory = __dirname.split(require('path').sep).pop()

router.use(authenticate)
router.use(updateActivityTimestamp)

router.get('/all-users', restrictAccess([1, 2]), async (req, res) => {
  /**
   #swagger.tags = [{ "superadmin: user related" }]
   #swagger.description = "List All Registered User Accounts"
   #swagger.responses['200'] = { description: "API call is successful" }
   #swagger.responses['500'] = { description: "Server Error" }
   */
  try {
    const getUsers = await restrictedCtrl.listAllUsers(req, res)
    return getUsers
  } catch (error) {
    logger.error(`[${directory}/${fileName}/all-users] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.get('/all-admin', restrictAccess([1]), async (req, res) => {
  /**
   #swagger.tags = [{ "superadmin: user related" }]
   #swagger.description = "List All Registered Admin Accounts"
   #swagger.responses['200'] = { description: "API call is successful" }
   #swagger.responses['500'] = { description: "Server Error" }
   */
  try {
    const getUsers = await restrictedCtrl.listAllAdmin(req, res)
    return getUsers
  } catch (error) {
    logger.error(`[${directory}/${fileName}/all-admin] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

const allowedRoles = [1]
router.use(restrictAccess(allowedRoles))

router.post('/register-user', async (req, res) => {
  /**
    #swagger.tags = [{ "restricted: user related" }]
    #swagger.description = "User Creation"
    #swagger.parameters['profile'] = {
      in: 'body',
      required: true,
      schema: {
        email: "dwightschrute@sains.com.my",
        fullName: "Dwight K. Schrute III",
      }
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    req.body.loginType = 'local'
    const registeringNewUser = await adminCtrl.userRegistration(req, res)
    return registeringNewUser
  } catch (error) {
    logger.error(`[${directory}/${fileName}/register-user] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.put('/update-role', async (req, res) => {
  /**
    #swagger.tags = [{ "superadmin: user related" }]
    #swagger.description = "Update User Role"
    #swagger.parameters['profile'] = {
      in: 'body',
      required: true,
      schema: {
        id: "8",
        roleAssigned: "superadmin"
      }
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const updateUserRole = await restrictedCtrl.updateUserRole(req, res)
    return updateUserRole
  } catch (error) {
    logger.error(`[${directory}/${fileName}/update-role] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.put('/deactivate-account', async (req, res) => {
  /**
    #swagger.tags = [{ "superadmin: user related" }]
    #swagger.description = "Deactivate User Account"
    #swagger.parameters['profile'] = {
      in: 'body',
      required: true,
      schema: {
        userID: "27",
      }
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const deactivateAccount = await restrictedCtrl.deactivateUserAccount(req, res)
    return deactivateAccount
  } catch (error) {
    logger.error(`[${directory}/${fileName}/deactivate-account] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.put('/reactivate-account', async (req, res) => {
  /**
    #swagger.tags = [{ "superadmin: user related" }]
    #swagger.description = "Reactivate User Account"
    #swagger.parameters['profile'] = {
      in: 'body',
      required: true,
      schema: {
        userID: "27",
      }
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const reactivateAccount = await restrictedCtrl.reactivateUserAccount(req, res)
    return reactivateAccount
  } catch (error) {
    logger.error(`[${directory}/${fileName}/reactivate-account] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.put('/deactivate-group', async (req, res) => {
  /**
    #swagger.tags = [{ "superadmin: group related" }]
    #swagger.description = "Deactivate Group Status"
    #swagger.parameters['group'] = {
      in: 'body',
      required: true,
      schema: {
        groupID: 4
      }
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const groupUpdate = await restrictedCtrl.deactivateGroup(req, res)
    return groupUpdate
  } catch (error) {
    logger.error(`[${directory}/${fileName}/deactivate-group] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.put('/reactivate-group', async (req, res) => {
  /**
    #swagger.tags = [{ "superadmin: group related" }]
    #swagger.description = "Reactivate Group Status"
    #swagger.parameters['group'] = {
      in: 'body',
      required: true,
      schema: {
        groupID: 4
      }
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const groupUpdate = await restrictedCtrl.reactivateGroup(req, res)
    return groupUpdate
  } catch (error) {
    logger.error(`[${directory}/${fileName}/reactivate-group] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.post('/create-group', restrictAccess([1]), async (req, res) => {
  /**
    #swagger.tags = [{ "admin: group related" }]
    #swagger.description = "Create New Group"
    #swagger.parameters['groupName'] = {
      in: 'formData',
      required: true,
      type: 'string',
      description: 'Name of the group'
    }
    #swagger.parameters['groupDescription'] = {
      in: 'formData',
      required: true,
      type: 'string',
      description: 'Description of the group'
    }
    #swagger.parameters['groupAdmin'] = {
      in: 'formData',
      required: true,
      type: 'string',
      description: 'ID of the group admin'
    }
    #swagger.parameters['groupMembers'] = {
      in: 'formData',
      required: true,
      type: 'array',
      items: {
        type: 'integer'
      },
      collectionFormat: 'multi',
      description: 'ID list of group members'
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const createGroup = await restrictedCtrl.createGroup(req, res)
    return createGroup
  } catch (error) {
    logger.error(`[${directory}/${fileName}/create-group] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.put('/edit-group', restrictAccess([1]), async (req, res) => {
  /**
    #swagger.tags = [{ "admin: group related" }]
    #swagger.description = "Edit Group Details: This includes deactivate/reactivate a group, assign new admin & remove members."
    #swagger.parameters['id'] = {
      in: 'formData',
      required: true,
      type: 'integer',
      description: 'ID of the group'
    }
    #swagger.parameters['groupName'] = {
      in: 'formData',
      required: true,
      type: 'string',
      description: 'Name of the group'
    }
    #swagger.parameters['groupDescription'] = {
      in: 'formData',
      required: true,
      type: 'string',
      description: 'Description of the group'
    }
    #swagger.parameters['groupAdmin'] = {
      in: 'formData',
      required: true,
      type: 'string',
      description: 'ID of the group admin'
    }
    #swagger.parameters['isActive'] = {
      in: 'formData',
      required: true,
      type: 'boolean',
      description: 'Status of the group'
    }
    #swagger.parameters['groupMembers'] = {
      in: 'formData',
      required: true,
      type: 'array',
      items: {
        type: 'integer'
      },
      collectionFormat: 'multi',
      description: 'ID list of group members'
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const editGroup = await restrictedCtrl.editGroup(req, res)
    return editGroup
  } catch (error) {
    logger.error(`[${directory}/${fileName}/edit-group] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.get('/list-groups', restrictAccess([1, 2]), async (req, res) => {
  /**
    #swagger.tags = [{ "superadmin: group related" }]
    #swagger.description = "List All Registered Groups"
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const getGroups = await restrictedCtrl.listGroups(req, res)
    return getGroups
  } catch (error) {
    logger.error(`[${directory}/${fileName}/list-groups] ${error}`)
    return res.status(500).send(messenger(filePath, 'internalError'))
  }
})

module.exports = router
