const appRoot = require('app-root-path')
const roleSvc = require(`${appRoot}/src/services/RoleServices`)
const { path, logger, messenger, filePath, usersSvc, groupsSvc, redis } = require(`${appRoot}/src/utils/util`)
const { send } = require(`${appRoot}/src/utils/serve`)
const fileName = __filename.split(path.sep).pop()
const directory = __dirname.split(path.sep).pop()

module.exports = {
  listAllUsers: async (req, res) => {
    try {
      const getUsers = await usersSvc.getUserList()
      if (getUsers.success === false && getUsers.message === 'empty') {
        const noUsersMsg = messenger(filePath, 'usersEmpty')
        logger.error(`[${directory}/${fileName}/listAllUsers] ${noUsersMsg}`)
        return send(res, false, noUsersMsg, 404)
      } else if (getUsers.success === false && getUsers.message === 'error') {
        const dbErrorMsg = messenger(filePath, 'userListRetrieveError')
        logger.error(`[${directory}/${fileName}/listAllUsers] ${dbErrorMsg} in database`)
        return send(res, false, dbErrorMsg, 500)
      } else {
        const usersListed = messenger(filePath, 'userListedSuccess')
        logger.info(`[${directory}/${fileName}/listAllUsers] ${usersListed}`)
        return send(res, true, usersListed, 200, getUsers.data)
      }
    } catch (error) {
      const errorMessage = error.message || 'internalError'
      logger.error(`[${directory}/${fileName}/listAllUsers] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  listAllAdmin: async (req, res) => {
    try {
      const getUsers = await usersSvc.getAdminList()
      if (getUsers.success === false && getUsers.message === 'empty') {
        const noUsersMsg = messenger(filePath, 'usersEmpty')
        logger.error(`[${directory}/${fileName}/listAllAdmin] ${noUsersMsg}`)
        return send(res, false, noUsersMsg, 404)
      } else if (getUsers.success === false && getUsers.message === 'error') {
        const dbErrorMsg = messenger(filePath, 'userListRetrieveError')
        logger.error(`[${directory}/${fileName}/listAllAdmin] ${dbErrorMsg} in database`)
        return send(res, false, dbErrorMsg, 500)
      } else {
        const usersListed = messenger(filePath, 'userListedSuccess')
        logger.info(`[${directory}/${fileName}/listAllAdmin] ${usersListed}`)
        return send(res, true, usersListed, 200, getUsers.data)
      }
    } catch (error) {
      const errorMessage = error.message || 'internalError'
      logger.error(`[${directory}/${fileName}/listAllAdmin] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  updateUserRole: async (req, res) => {
    const { id, roleAssigned } = req.body
    if (!id || !roleAssigned) {
      logger.error(`[${directory}/${fileName}/updateUserRole] ${messenger(filePath, 'logIncompleteForm')}`)
      return send(res, false, messenger(filePath, 'incompleteForm'), 401)
    }
    const userValidity = await usersSvc.getIDValidity(id)
    if (userValidity === false) {
      return send(res, false, messenger(filePath, 'msgUserInvalid'), 403)
    }
    try {
      const checkRole = await roleSvc.sameRoleCheck(id, roleAssigned)
      if (checkRole) {
        const unchangedRoleMessage = messenger(filePath, 'roleUnchanged') + roleAssigned.toUpperCase()
        logger.error(`[${directory}/${fileName}/updateUserRole] ${unchangedRoleMessage} (${id})`)
        return send(res, false, unchangedRoleMessage, 400)
      }
      await roleSvc.updateUserRole(id, roleAssigned)
      const roleUpdatedMessage = messenger(filePath, 'roleUpdated') + roleAssigned
      logger.info(`[${directory}/${fileName}/updateUserRole] ${roleUpdatedMessage} (${id})`)
      return send(res, true, roleUpdatedMessage, 200)
    } catch (error) {
      const errorMessage = error.message || 'internalError'
      logger.error(`[${directory}/${fileName}/updateUserRole] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  deactivateUserAccount: async (req, res) => {
    const { userID } = req.body
    if (!userID) {
      logger.error(`[${directory}/${fileName}/deactivateUserAccount] ${messenger(filePath, 'logIncompleteForm')}`)
      return send(res, false, messenger(filePath, 'incompleteForm'), 401)
    }
    if (userID === req.session.userID) {
      logger.info(`[${directory}/${fileName}/deactivateUserAccount] ${messenger(filePath, 'msgRefuseUpdateSelf')} (${userID})`)
      return send(res, false, messenger(filePath, 'msgRefuseUpdateSelf'), 401)
    }
    try {
      const getUser = await usersSvc.getUserStatusByID(userID)
      if (getUser.error) {
        return send(res, false, getUser.message, 404)
      }
      if (!getUser.data.is_active) {
        const userNotDeactivatedMsg = getUser.data.username.toUpperCase() + messenger(filePath, 'msgUserNotDeleted')
        logger.error(`[${directory}/${fileName}/deactivateUserAccount] ${userNotDeactivatedMsg}`)
        return send(res, false, userNotDeactivatedMsg, 400)
      }
      await usersSvc.deactivateUser(userID)
      const userDeactivatedMsg = getUser.data.username.toUpperCase() + messenger(filePath, 'msgUserDeleted')
      logger.info(`[${directory}/${fileName}/deactivateUserAccount] ${userDeactivatedMsg} (${userID})`)
      return send(res, true, userDeactivatedMsg, 200)
    } catch (error) {
      logger.error(`[${directory}/${fileName}/deactivateUserAccount] ${error}`)
      return send(res, false, messenger(filePath, 'internalError'), 500)
    }
  },
  reactivateUserAccount: async (req, res) => {
    const { userID } = req.body
    if (!userID) {
      logger.error(`[${directory}/${fileName}/reactivateUserAccount] ${messenger(filePath, 'logIncompleteForm')}`)
      return send(res, false, messenger(filePath, 'incompleteForm'), 401)
    }
    if (userID === req.session.userID) {
      logger.info(`[${directory}/${fileName}/reactivateUserAccount] ${messenger(filePath, 'msgRefuseUpdateSelf')} (${userID})`)
      return send(res, false, messenger(filePath, 'msgRefuseUpdateSelf'), 401)
    }
    try {
      const getUser = await usersSvc.getUserStatusByID(userID)
      if (getUser.error) {
        return send(res, false, getUser.message, 404)
      }
      if (getUser.data.is_active) {
        const userNotReactivatedMsg = getUser.data.username.toUpperCase() + messenger(filePath, 'msgUserNotReactivated')
        logger.error(`[${directory}/${fileName}/reactivateUserAccount] ${userNotReactivatedMsg}`)
        return send(res, false, userNotReactivatedMsg, 400)
      }
      await usersSvc.reactivateUser(userID)
      const userReactivatedMsg = getUser.data.username.toUpperCase() + messenger(filePath, 'msgUserReactivated')
      logger.info(`[${directory}/${fileName}/reactivateUserAccount] ${userReactivatedMsg} (${userID})`)
      return send(res, true, userReactivatedMsg, 200)
    } catch (error) {
      logger.error(`[${directory}/${fileName}/reactivateUserAccount] ${error}`)
      return send(res, false, messenger(filePath, 'internalError'), 500)
    }
  },
  deactivateGroup: async (req, res) => {
    const { groupID } = req.body
    if (!groupID) {
      logger.error(`[${directory}/${fileName}/deactivateGroup] ${messenger(filePath, 'logIncompleteForm')}`)
      return send(res, false, messenger(filePath, 'incompleteForm'), 401)
    }
    const groupExists = await groupsSvc.getBasicGroupDetails(groupID)
    if (groupExists === null) {
      return send(res, false, messenger(filePath, 'unknownGroupMsg'), 404)
    } else if (groupExists.is_active === false) {
      const message = `${groupExists.name}${messenger(filePath, 'msgGroupStatusRemains')}`
      logger.info(`[${directory}/${fileName}/deactivateGroup] ${message}`)
      return send(res, false, message, 404)
    } else {
      try {
        const updateStatus = await groupsSvc.deactivateGroup(groupID)
        if (updateStatus === false) {
          logger.info(`[${directory}/${fileName}/deactivateGroup] ${updateStatus} (groupID: ${groupID})`)
        } else {
          const message = messenger(filePath, 'groupEdited')
          logger.info(`[${directory}/${fileName}/deactivateGroup] ${message} (groupID: ${groupID})`)
          return send(res, true, message, 200)
        }
      } catch (error) {
        const errorMessage = error.message || 'internalError'
        logger.error(`[${directory}/${fileName}/deactivateGroup] ${error}`)
        return send(res, false, messenger(filePath, errorMessage), 500)
      }
    }
  },
  reactivateGroup: async (req, res) => {
    const { groupID } = req.body
    if (!groupID) {
      logger.error(`[${directory}/${fileName}/reactivateGroup] ${messenger(filePath, 'logIncompleteForm')}`)
      return send(res, false, messenger(filePath, 'incompleteForm'), 401)
    }
    const groupExists = await groupsSvc.getBasicGroupDetails(groupID)
    if (groupExists === null) {
      return send(res, false, messenger(filePath, 'unknownGroupMsg'), 404)
    } else if (groupExists.is_active === true) {
      const message = `${groupExists.name}${messenger(filePath, 'msgGroupStatusRemains')}`
      logger.info(`[${directory}/${fileName}/reactivateGroup] ${message}`)
      return send(res, false, message, 404)
    } else {
      try {
        const updateStatus = await groupsSvc.reactivateGroup(groupID)
        if (updateStatus === false) {
          logger.info(`[${directory}/${fileName}/reactivateGroup] ${updateStatus} (groupID: ${groupID})`)
        } else {
          const message = messenger(filePath, 'groupEdited')
          logger.info(`[${directory}/${fileName}/reactivateGroup] ${message} (groupID: ${groupID})`)
          return send(res, true, message, 200)
        }
      } catch (error) {
        const errorMessage = error.message || 'internalError'
        logger.error(`[${directory}/${fileName}/reactivateGroup] ${error}`)
        return send(res, false, messenger(filePath, errorMessage), 500)
      }
    }
  },
  createGroup: async (req, res) => {
    const { groupName, groupAdmin, groupMembers, groupDescription } = req.body
    if (!groupName || !groupAdmin) {
      logger.error(`[${directory}/${fileName}/createGroup] ${messenger(filePath, 'logIncompleteForm')}`)
      return send(res, false, messenger(filePath, 'incompleteForm'), 401)
    }
    try {
      const checkName = await groupsSvc.doesGroupNameExists(groupName)
      if (checkName) {
        const duplicateNameMsg = groupName + messenger(filePath, 'groupNameExists')
        logger.error(`[${directory}/${fileName}/createGroup] ${duplicateNameMsg}`)
        return send(res, false, duplicateNameMsg, 400)
      }
      const getUserSession = await redis.getSessionData(req)
      const groupCreation = await groupsSvc.addGroup(groupName, groupDescription, groupAdmin, groupMembers, getUserSession.userID)
      const groupProfile = {
        groupID: groupCreation.id,
        groupName: groupCreation.name,
        isActive: groupCreation.is_active,
        groupDescription: groupCreation.description,
        createdAt: groupCreation.created_at
      }
      const groupCreatedMsg = groupName + messenger(filePath, 'groupCreated')
      logger.info(`[${directory}/${fileName}/createGroup] ${groupCreatedMsg}`)
      return send(res, true, groupCreatedMsg, 200, groupProfile)
    } catch (error) {
      const errorMessage = error.message || 'internalError'
      logger.error(`[${directory}/${fileName}/createGroup] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  editGroup: async (req, res) => {
    const { id, groupName, groupAdmin, groupMembers, groupDescription } = req.body
    if (!id || !groupName || !groupAdmin) {
      logger.error(`[${directory}/${fileName}/editGroup] ${messenger(filePath, 'logIncompleteForm')}`)
      return send(res, false, messenger(filePath, 'incompleteForm'), 401)
    }
    try {
      const checkIfExists = await groupsSvc.doesGroupExists(id)
      if (checkIfExists) {
        const updateGroup = await groupsSvc.updateGroup(id, groupName, groupDescription, groupAdmin, groupMembers)
        if (updateGroup) {
          const groupEditedMsg = groupName + messenger(filePath, 'groupEdited')
          logger.info(`[${directory}/${fileName}/editGroup] ${groupEditedMsg}`)
          return send(res, true, groupEditedMsg, 200)
        } else {
          const editFailedMsg = groupName + messenger(filePath, 'groupEditedError')
          logger.info(`[${directory}/${fileName}/editGroup] ${editFailedMsg}`)
          return send(res, false, editFailedMsg, 400)
        }
      } else {
        const unknownGroupMsg = groupName + messenger(filePath, 'unknownGroupMsg')
        logger.error(`[${directory}/${fileName}/editGroup] ${unknownGroupMsg}`)
        return send(res, false, unknownGroupMsg, 404)
      }
    } catch (error) {
      const errorMessage = error.message || 'internalError'
      logger.error(`[${directory}/${fileName}/editGroup] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  listGroups: async (req, res) => {
    try {
      const getGroups = await groupsSvc.getGroupList()
      if (getGroups.success === false && getGroups.message === 'empty') {
        const noGroupsMsg = messenger(filePath, 'groupEmpty')
        logger.error(`[${directory}/${fileName}/listGroups] ${noGroupsMsg}`)
        return send(res, false, noGroupsMsg, 404)
      } else if (getGroups.success === false && getGroups.message === 'error') {
        const dbErrorMsg = messenger(filePath, 'groupListRetrieveError')
        logger.error(`[${directory}/${fileName}/listGroups] ${dbErrorMsg} in database`)
        return send(res, false, dbErrorMsg, 500)
      } else {
        const groupsListed = messenger(filePath, 'groupListedSuccess')
        logger.info(`[${directory}/${fileName}/listGroups] ${groupsListed}`)
        return send(res, true, groupsListed, 200, getGroups.data)
      }
    } catch (error) {
      const errorMessage = error.message || 'internalError'
      logger.error(`[${directory}/${fileName}/listGroups] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  }
}
