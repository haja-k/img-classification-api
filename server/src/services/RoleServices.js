const appRoot = require('app-root-path')
const { logger, database } = require(`${appRoot}/src/utils/util`)
const path = require('path')
const fileName = __filename.split(path.sep).pop()
const directory = __dirname.split(path.sep).pop()

module.exports = {
  updateUserRole: async (id, roleAssigned) => {
    try {
      const role = await database.Role.findOne({
        attributes: ['id'],
        where: {
          name: roleAssigned
        }
      })

      if (!role) {
        throw new Error(`Role with name "${roleAssigned}" not found.`)
      }
      const userData = await database.User.update({
        role_id: role.id
      },
      {
        where: {
          id
        }
      })
      return userData
    } catch (error) {
      logger.error(`[${directory}/${fileName}/updateUserRole] Error updating user role: ${id} - ` + error)
      throw error
    }
  },
  sameRoleCheck: async (id, roleAssigned) => {
    try {
      const role = await database.Role.findOne({
        attributes: ['id'],
        where: {
          name: roleAssigned
        }
      })
      if (!role) {
        throw new Error(`Role Not Found: ${roleAssigned}`)
      }
      const userData = await database.User.findOne({ where: { id }, attributes: ['role_id'] })
      if (!userData) {
        throw new Error(`User ID Not Found: ${id}`)
      }
      if (userData.role_id === role.id) {
        return true
      } else {
        return false
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/sameRoleCheck] Error checking user role: ${id} - ` + error)
      throw error
    }
  },
  roleName: async (id) => {
    try {
      const roleName = await database.Role.findOne({
        where: { id },
        attributes: ['name']
      })
      return roleName.name
    } catch (error) {
      logger.error(`[${directory}/${fileName}/roleName] Error retrieving role name ${error}`)
      throw error
    }
  }
}
