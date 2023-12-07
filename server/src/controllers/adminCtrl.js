const appRoot = require('app-root-path')
const { path, logger, messenger, filePath, finder, process, usersSvc, groupsSvc, projectSvc, redis } = require(`${appRoot}/src/utils/util`)
const { send } = require(`${appRoot}/src/utils/serve`)
const fileName = __filename.split(path.sep).pop()
const directory = __dirname.split(path.sep).pop()

module.exports = {
  internalRegister: async (req, res) => {
    try {
      const { email, fullName, loginType } = req.body
      const username = process.usernameExtraction(email).data
      const findUser = await finder.checkUserPresence(username)
      if (findUser.error) {
        const register = await usersSvc.addUser(username, email, fullName, loginType)
        logger.info(`[${directory}/${fileName}/internalRegister] ${messenger(filePath, 'logUserReg')}`)
        const response = {
          success: true,
          message: messenger(filePath, 'msgUserRegSuccess'),
          data: register.dataValues
        }
        return response
      }
      logger.error(`[${directory}/${fileName}/internalRegister] ${findUser.message}`)
      const response = {
        success: false,
        message: messenger(filePath, 'msgUserAlreadyReg')
      }
      return response
    } catch (error) {
      const message = messenger(filePath, 'logUserRegError')
      logger.error(`[${directory}/${fileName}/internalRegister] ${message} - ${error}`)
      const response = {
        success: false,
        message
      }
      return response
    }
  },
  userRegistration: async (req, res) => {
    try {
      const { email, fullName, loginType } = req.body

      if (!email || !fullName || !process.isValidEmail(email)) {
        logger.error(`[${directory}/${fileName}/userRegistration] ${messenger(filePath, 'logIncompleteForm')}`)
        return send(res, false, messenger(filePath, 'incompleteForm'), 401)
      }
      const username = process.usernameExtraction(email).data
      const findUser = await finder.checkUserPresence(username)
      if (findUser.error) {
        await usersSvc.addUser(username, email, fullName, loginType)
        logger.info(`[${directory}/${fileName}/userRegistration] ${messenger(filePath, 'logUserReg')}`)
        return send(res, true, messenger(filePath, 'msgUserRegSuccess'), 200)
      }
      logger.error(`[${directory}/${fileName}/userRegistration] ${findUser.message}`)
      return send(res, false, messenger(filePath, 'msgUserAlreadyReg'), 400)
    } catch (error) {
      const message = messenger(filePath, 'logUserRegError')
      logger.error(`[${directory}/${fileName}/userRegistration] ${message} - ${error}`)
      return send(res, false, message, 500)
    }
  },
  groupDetail: async (req, res) => {
    const { id } = req.body
    if (!id) {
      logger.error(`[${directory}/${fileName}/groupDetail] ${messenger(filePath, 'logIncompleteForm')}`)
      return send(res, false, messenger(filePath, 'incompleteForm'), 401)
    }
    try {
      const checkIfExists = await groupsSvc.doesGroupExists(id)
      if (checkIfExists) {
        const getDetails = await groupsSvc.getCompleteGroupDetails(id)
        if (getDetails) {
          const retrieveMsg = messenger(filePath, 'groupDetailsRetrieved')
          logger.info(`[${directory}/${fileName}/groupDetail] ${retrieveMsg}`)
          return send(res, true, retrieveMsg, 200, getDetails)
        } else {
          const failedMsg = messenger(filePath, 'groupDetailsRetrievedError')
          logger.info(`[${directory}/${fileName}/groupDetail] ${failedMsg}`)
          return send(res, false, failedMsg, 400)
        }
      } else {
        const unknownGroupMsg = messenger(filePath, 'unknownGroupMsg') + ` Group ID: ${id}`
        logger.error(`[${directory}/${fileName}/groupDetail] ${unknownGroupMsg}`)
        return send(res, false, unknownGroupMsg, 404)
      }
    } catch (error) {
      const errorMessage = error.message || 'internalError'
      logger.error(`[${directory}/${fileName}/groupDetail] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  listGroupsByAdminID: async (req, res) => {
    try {
      const adminID = req.session.userID
      if (!adminID) {
        logger.error(`[${directory}/${fileName}/listGroupsByAdminID] ${messenger(filePath, 'logIncompleteForm')}`)
        return send(res, false, messenger(filePath, 'incompleteForm'), 401)
      }
      const getGroups = await groupsSvc.getGroupListUnderAdminID(adminID)
      if (getGroups.success === false && getGroups.message === 'empty') {
        const noGroupsMsg = messenger(filePath, 'groupEmpty')
        logger.error(`[${directory}/${fileName}/listGroupsByAdminID] ${noGroupsMsg}`)
        return send(res, true, noGroupsMsg, 200, [])
      } else if (getGroups.success === false && getGroups.message === 'error') {
        const dbErrorMsg = messenger(filePath, 'groupListRetrieveError')
        logger.error(`[${directory}/${fileName}/listGroupsByAdminID] ${dbErrorMsg} in database`)
        return send(res, false, dbErrorMsg, 500)
      } else {
        const groupsListed = messenger(filePath, 'groupListedSuccess')
        logger.info(`[${directory}/${fileName}/listGroupsByAdminID] ${groupsListed}`)
        return send(res, true, groupsListed, 200, getGroups.data)
      }
    } catch (error) {
      const errorMessage = error.message || 'internalError'
      logger.error(`[${directory}/${fileName}/listGroupsByAdminID] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  createProject: async (req, res) => {
    const { projectName, groupID, projectMembers, projectDescription } = req.body
    if (!projectName) {
      logger.error(`[${directory}/${fileName}/createProject] ${messenger(filePath, 'logIncompleteForm')}`)
      return send(res, false, messenger(filePath, 'incompleteForm'), 401)
    }
    const groupExists = await groupsSvc.getBasicGroupDetails(groupID)
    if (groupExists === null) {
      const groupUnknown = `Group ID: ${groupID}: ${messenger(filePath, 'unknownGroupMsg')}`
      logger.error(`[${directory}/${fileName}/createProject] ${groupUnknown}`)
      return send(res, false, groupUnknown, 404)
    }
    try {
      const checkName = await projectSvc.doesProjectNameExists(projectName)
      if (checkName) {
        const duplicateNameMsg = projectName + messenger(filePath, 'projectNameExists')
        logger.error(`[${directory}/${fileName}/createProject] ${duplicateNameMsg}`)
        return send(res, false, duplicateNameMsg, 400)
      }
      const getUserSession = await redis.getSessionData(req)
      await projectSvc.addProject(projectName, projectDescription, groupID, projectMembers, getUserSession.userID)
      const projectCreatedMsg = projectName + messenger(filePath, 'projectCreated')
      logger.info(`[${directory}/${fileName}/createProject] ${projectCreatedMsg}`)
      return send(res, true, projectCreatedMsg, 200)
    } catch (error) {
      const errorMessage = error.message || 'internalError'
      logger.error(`[${directory}/${fileName}/createProject] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  listProjects: async (req, res) => {
    try {
      const getProjects = await projectSvc.getProjectList()
      if (getProjects.success === false && getProjects.message === 'empty') {
        const noProjectsMsg = messenger(filePath, 'projectEmpty')
        logger.error(`[${directory}/${fileName}/listProjects] ${noProjectsMsg}`)
        return send(res, true, noProjectsMsg, 200, [])
      } else if (getProjects.success === false && getProjects.message === 'error') {
        const dbErrorMsg = messenger(filePath, 'projectListRetrieveError')
        logger.error(`[${directory}/${fileName}/listProjects] ${dbErrorMsg} in database`)
        return send(res, false, dbErrorMsg, 500)
      } else {
        const projectsListed = messenger(filePath, 'projectListedSuccess')
        logger.info(`[${directory}/${fileName}/listProjects] ${projectsListed}`)
        return send(res, true, projectsListed, 200, getProjects.data)
      }
    } catch (error) {
      const errorMessage = error.message || 'internalError'
      logger.error(`[${directory}/${fileName}/listProjects] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  listProjectsByGroup: async (req, res) => {
    try {
      const { groupID } = req.body
      if (!groupID) {
        logger.error(`[${directory}/${fileName}/listProjectsByGroup] ${messenger(filePath, 'logIncompleteForm')}`)
        return send(res, false, messenger(filePath, 'incompleteForm'), 401)
      }
      const getProjects = await projectSvc.getProjectListByGroup(groupID)
      if (getProjects.success === false && getProjects.message === 'empty') {
        const noProjectsMsg = messenger(filePath, 'projectEmpty')
        logger.error(`[${directory}/${fileName}/listProjectsByGroup] ${noProjectsMsg}`)
        return send(res, true, noProjectsMsg, 200, [])
      } else if (getProjects.success === false && getProjects.message === 'error') {
        const dbErrorMsg = messenger(filePath, 'projectListRetrieveError')
        logger.error(`[${directory}/${fileName}/listProjectsByGroup] ${dbErrorMsg} in database`)
        return send(res, false, dbErrorMsg, 500)
      } else {
        const projectsListed = messenger(filePath, 'projectListedSuccess')
        logger.info(`[${directory}/${fileName}/listProjectsByGroup] ${projectsListed}`)
        return send(res, true, projectsListed, 200, getProjects.data)
      }
    } catch (error) {
      const errorMessage = error.message || 'internalError'
      logger.error(`[${directory}/${fileName}/listProjectsByGroup] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  listProjectsByAdminID: async (req, res) => {
    try {
      const adminID = req.session.userID
      if (!adminID) {
        logger.error(`[${directory}/${fileName}/listProjectsByAdminID] ${messenger(filePath, 'logIncompleteForm')}`)
        return send(res, false, messenger(filePath, 'incompleteForm'), 401)
      }
      const getProjects = await projectSvc.getProjectListByAdmin(adminID)
      if (getProjects.success === false && getProjects.message === 'empty') {
        const noProjectsMsg = messenger(filePath, 'projectEmpty')
        logger.error(`[${directory}/${fileName}/listProjectsByAdminID] ${noProjectsMsg}`)
        return send(res, true, noProjectsMsg, 200, [])
      } else if (getProjects.success === false && getProjects.message === 'error') {
        const dbErrorMsg = messenger(filePath, 'projectListRetrieveError')
        logger.error(`[${directory}/${fileName}/listProjectsByAdminID] ${dbErrorMsg} in database`)
        return send(res, false, dbErrorMsg, 500)
      } else {
        const projectsListed = messenger(filePath, 'projectListedSuccess')
        logger.info(`[${directory}/${fileName}/listProjectsByAdminID] ${projectsListed}`)
        return send(res, true, projectsListed, 200, getProjects.data)
      }
    } catch (error) {
      const errorMessage = error.message || 'internalError'
      logger.error(`[${directory}/${fileName}/listProjectsByAdminID] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  editProject: async (req, res) => {
    const { id, projectName, projectMembers, groupID, projectDescription, isActive } = req.body
    if (!id || !projectName) {
      logger.error(`[${directory}/${fileName}/editProject] ${messenger(filePath, 'logIncompleteForm')}`)
      return send(res, false, messenger(filePath, 'incompleteForm'), 401)
    }
    try {
      const checkIfExists = await projectSvc.doesProjectExists(id)
      if (checkIfExists) {
        const checkName = await projectSvc.doesOtherProjectHaveTheName(projectName, id)
        if (checkName) {
          const duplicateNameMsg = projectName + messenger(filePath, 'projectNameExists')
          logger.error(`[${directory}/${fileName}/createProject] ${duplicateNameMsg}`)
          return send(res, false, duplicateNameMsg, 400)
        }
        const getUserSession = await redis.getSessionData(req)
        const updateProject = await projectSvc.updateProject(id, projectName, projectDescription, groupID, projectMembers, isActive, getUserSession.userID)
        if (updateProject) {
          const projectEditedMsg = projectName + messenger(filePath, 'projectEdited')
          logger.info(`[${directory}/${fileName}/editProject] ${projectEditedMsg}`)
          return send(res, true, projectEditedMsg, 200)
        } else {
          const editFailedMsg = projectName + messenger(filePath, 'projectEditedError')
          logger.info(`[${directory}/${fileName}/editProject] ${editFailedMsg}`)
          return send(res, false, editFailedMsg, 400)
        }
      } else {
        const unknownProjectMsg = projectName + messenger(filePath, 'unknownProjectMsg')
        logger.error(`[${directory}/${fileName}/editProject] ${unknownProjectMsg}`)
        return send(res, false, unknownProjectMsg, 404)
      }
    } catch (error) {
      const errorMessage = error.message || 'internalError'
      logger.error(`[${directory}/${fileName}/editProject] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  deactivateProject: async (req, res) => {
    const { projectID } = req.body
    if (!projectID) {
      logger.error(`[${directory}/${fileName}/deactivateProject] ${messenger(filePath, 'logIncompleteForm')}`)
      return send(res, false, messenger(filePath, 'incompleteForm'), 401)
    }
    const projectExists = await projectSvc.getBasicProjectDetails(projectID)
    if (projectExists === null) {
      return send(res, false, messenger(filePath, 'unknownProjectMsg'), 404)
    } else if (projectExists.is_active === false) {
      const message = `${projectExists.name}${messenger(filePath, 'msgProjectStatusRemains')}`
      logger.info(`[${directory}/${fileName}/deactivateProject] ${message}`)
      return send(res, false, message, 404)
    } else {
      try {
        const updateStatus = await projectSvc.deactivateProject(projectID)
        if (updateStatus === false) {
          logger.info(`[${directory}/${fileName}/deactivateProject] ${updateStatus} (projectID: ${projectID})`)
        } else {
          const message = messenger(filePath, 'projectEdited')
          logger.info(`[${directory}/${fileName}/deactivateProject] ${message} (projectID: ${projectID})`)
          return send(res, true, message, 200)
        }
      } catch (error) {
        const errorMessage = error.message || 'internalError'
        logger.error(`[${directory}/${fileName}/deactivateProject] ${error}`)
        return send(res, false, messenger(filePath, errorMessage), 500)
      }
    }
  },
  reactivateProject: async (req, res) => {
    const { projectID } = req.body
    if (!projectID) {
      logger.error(`[${directory}/${fileName}/reactivateProject] ${messenger(filePath, 'logIncompleteForm')}`)
      return send(res, false, messenger(filePath, 'incompleteForm'), 401)
    }
    const projectExists = await projectSvc.getBasicProjectDetails(projectID)
    if (projectExists === null) {
      return send(res, false, messenger(filePath, 'unknownProjectMsg'), 404)
    } else if (projectExists.is_active === true) {
      const message = `${projectExists.name}${messenger(filePath, 'msgProjectStatusRemains')}`
      logger.info(`[${directory}/${fileName}/reactivateProject] ${message}`)
      return send(res, false, message, 404)
    } else {
      try {
        const updateStatus = await projectSvc.reactivateProject(projectID)
        if (updateStatus === false) {
          logger.info(`[${directory}/${fileName}/reactivateProject] ${updateStatus} (projectID: ${projectID})`)
        } else {
          const message = messenger(filePath, 'projectEdited')
          logger.info(`[${directory}/${fileName}/reactivateProject] ${message} (projectID: ${projectID})`)
          return send(res, true, message, 200)
        }
      } catch (error) {
        const errorMessage = error.message || 'internalError'
        logger.error(`[${directory}/${fileName}/reactivateProject] ${error}`)
        return send(res, false, messenger(filePath, errorMessage), 500)
      }
    }
  }
}
