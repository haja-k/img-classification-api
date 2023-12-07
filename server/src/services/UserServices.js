const appRoot = require('app-root-path')
const logger = require(`${appRoot}/src/plugins/logger`)
const database = require(`${appRoot}/src/sequelize/models`)
const path = require('path')
const fileName = __filename.split(path.sep).pop()
const directory = __dirname.split(path.sep).pop()

module.exports = {
  getUserList: async () => {
    try {
      const users = await database.User.findAll({
        attributes: ['id', 'username', 'email', 'full_name', 'is_active', 'login_type', 'role_id'],
        include: [
          {
            model: database.Group,
            as: 'groups',
            attributes: ['id', 'name']
          }
        ]
      })
      if (users.length === 0) {
        logger.error(`[${directory}/${fileName}/getUserList] Users table is empty`)
        return { success: false, message: 'empty' }
      } else {
        const userData = await Promise.all(users.map(async (entry) => {
          const groupNames = entry.groups.map((group) => {
            return {
              id: group.id,
              name: group.name
            }
          })
          const role = await database.Role.findOne({
            attributes: ['name'],
            where: {
              id: entry.role_id
            }
          })
          const roleDetails = { id: entry.role_id, name: role.name }
          return {
            id: entry.id,
            username: entry.username,
            email: entry.email,
            fullName: entry.full_name,
            loginType: entry.login_type,
            isActive: entry.is_active,
            role: roleDetails,
            groups: groupNames
          }
        }))
        logger.info(`[${directory}/${fileName}/getUserList] User list retrieved successfully`)
        return {
          success: true,
          data: userData
        }
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/getUserList] Error getting user list: ` + error)
      return { success: false, message: 'error' }
    }
  },
  getAdminList: async () => {
    try {
      const users = await database.User.findAll({
        attributes: ['id', 'username', 'email', 'full_name', 'is_active', 'login_type', 'role_id'],
        where: { role_id: 2, is_active: true },
        include: [
          {
            model: database.Group,
            as: 'groups',
            attributes: ['id', 'name']
          }
        ]
      })
      if (users.length === 0) {
        logger.error(`[${directory}/${fileName}/getAdminList] Users table is empty`)
        return { success: false, message: 'empty' }
      } else {
        const userData = await Promise.all(users.map(async (entry) => {
          return {
            id: entry.id,
            username: entry.username,
            email: entry.email,
            fullName: entry.full_name,
            loginType: entry.login_type
          }
        }))
        logger.info(`[${directory}/${fileName}/getAdminList] User list retrieved successfully`)
        return {
          success: true,
          data: userData
        }
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/getAdminList] Error getting user list: ` + error)
      return { success: false, message: 'error' }
    }
  },
  getUser: async (username) => {
    try {
      const userData = await database.User.findOne({
        where: { username }, attributes: ['id', 'username', 'email', 'login_type', 'password', 'full_name', 'role_id', 'is_active']
      })
      const role = await database.Role.findOne({
        attributes: ['name'],
        where: {
          id: userData.role_id
        }
      })
      const userProfile = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        roleID: userData.role_id,
        roleName: role.name,
        fullName: userData.full_name,
        isActive: userData.is_active,
        loginType: userData.login_type,
        password: userData.password
      }
      return userProfile
    } catch (error) {
      logger.error(`[${directory}/${fileName}/getUser] Error finding user: ${username} - ` + error)
      throw error
    }
  },
  getUserProfile: async (username) => {
    try {
      const userData = await database.User.findOne({
        where: { username },
        attributes: ['id', 'username', 'email', 'full_name', 'role_id', 'is_active', 'login_type'],
        include: [
          {
            model: database.Group,
            as: 'groups',
            attributes: ['id', 'name', 'description'],
            through: {
              model: database.Group_Member,
              attributes: []
            }
          },
          {
            model: database.Project,
            attributes: ['id', 'name', 'description'],
            through: {
              model: database.Project_Member,
              attributes: []
            }
          }
        ]
      })
      const groups = userData.groups.map((group) => ({
        id: group.id,
        name: group.name
      }))
      const projects = userData.Projects.map((project) => ({
        id: project.id,
        name: project.name
      }))

      const role = await database.Role.findOne({
        attributes: ['name'],
        where: {
          id: userData.role_id
        }
      })

      const userProfile = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        roleID: userData.role_id,
        role: role.name,
        fullName: userData.full_name,
        isActive: userData.is_active,
        loginType: userData.login_type,
        groups,
        projects
      }
      return userProfile
    } catch (error) {
      logger.error(`[${directory}/${fileName}/getUserProfile] Error retrieving user profile: ${username} - ` + error)
      throw error
    }
  },
  getAccValidity: async (username) => {
    try {
      const userData = await database.User.findOne({
        where: { username }, attributes: ['is_active']
      })
      if (userData.is_active === true) {
        return true
      } else {
        return false
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/getUser] Error getting user validity: ${username} - ` + error)
      return null
    }
  },
  getIDValidity: async (id) => {
    try {
      const userData = await database.User.findOne({
        where: { id }, attributes: ['is_active']
      })
      if (userData.is_active === true) {
        return true
      } else {
        return false
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/getUser] Error getting user ID validity: ${id} - ` + error)
      return null
    }
  },
  findByID: async (id) => {
    try {
      const userData = await database.User.findOne({ where: { id }, attributes: ['password'] })
      return {
        error: false,
        data: userData.password
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/findByID] Error finding user by ID: ${id} - ` + error)
      return {
        error: true
      }
    }
  },
  getUserStatusByID: async (id) => {
    try {
      const userData = await database.User.findOne({ where: { id }, attributes: ['username', 'is_active'] })
      if (userData === null) {
        return {
          error: true,
          message: 'User does not exist.'
        }
      } else {
        return {
          error: false,
          data: userData
        }
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/findByID] Error finding user by ID: ${id} - ` + error)
      return {
        error: true,
        message: 'User does not exist.'
      }
    }
  },
  addUser: async (username, email, fullName, loginType) => {
    try {
      const userData = await database.User.create({
        username,
        email,
        full_name: fullName,
        login_type: loginType
      })
      return userData
    } catch (error) {
      logger.error(`[${directory}/${fileName}/addUser] Error adding user: ${username} - ` + error)
      throw error
    }
  },
  deactivateUser: async (userID) => {
    try {
      const userData = await database.User.update({
        is_active: false
      },
      {
        where: {
          id: userID
        }
      })
      logger.error(`[${directory}/${fileName}/deactivateUser] User %${userID} deactivated successfully.`)
      return userData
    } catch (error) {
      logger.error(`[${directory}/${fileName}/deactivateUser] Error updating user: ${userID} - ` + error)
      throw error
    }
  },
  reactivateUser: async (userID) => {
    try {
      const userData = await database.User.update({
        is_active: true
      },
      {
        where: {
          id: userID
        }
      })
      logger.error(`[${directory}/${fileName}/reactivateUser] User %${userID} reactivated successfully.`)
      return {
        error: false,
        data: userData
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/reactivateUser] Error updating user: ${userID} - ` + error)
      return {
        error: true
      }
    }
  },
  changePassword: async (id, password) => {
    try {
      await database.User.update({ password }, { where: { id } })
      return {
        error: false
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/changePassword] Error updating user password: ${id} - ` + error)
      return {
        error: true
      }
    }
  },
  updateLoginTimestamp: async (timestamp, username) => {
    try {
      await database.User.update({ last_login: timestamp }, { where: { username } })
      return {
        error: false
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/updateLoginTimestamp] Error updating user login timestamp: ${username} - ` + error)
      return {
        error: true
      }
    }
  }
}
