const appRoot = require('app-root-path')
const logger = require(`${appRoot}/src/plugins/logger`)
const database = require(`${appRoot}/src/sequelize/models`)
const path = require('path')
const fileName = __filename.split(path.sep).pop()
const directory = __dirname.split(path.sep).pop()

module.exports = {
  getBasicGroupDetails: async (groupID) => {
    try {
      const groupData = await database.Group.findOne({
        where: { id: groupID }, attributes: ['id', 'name', 'description', 'is_active', 'created_at', 'created_by']
      })
      return groupData
    } catch (error) {
      logger.error(`[${directory}/${fileName}/getGroupDetail] Error finding group: ${groupID} - ` + error)
      throw error
    }
  },
  getCompleteGroupDetails: async (groupID) => {
    try {
      const groupData = await database.Group.findOne({
        where: { id: groupID },
        attributes: ['id', 'name', 'description', 'created_at', 'created_by']
      })

      if (!groupData) {
        return null // Return null if the group doesn't exist
      }

      const groupMembers = await database.Group_Member.findAll({
        where: { group_id: groupID },
        attributes: ['user_id', 'is_admin', 'is_active'],
        include: {
          model: database.User,
          attributes: ['username', 'full_name', 'email'] // Add the user details you need
        }
      })

      // Map group members to include user details and is_admin status
      const members = groupMembers.map((member) => ({
        userID: member.user_id,
        isAdmin: member.is_admin,
        isActive: member.is_active,
        user: member.User // Contains user details
      }))

      const result = {
        id: groupData.id,
        name: groupData.name,
        description: groupData.description,
        created_at: groupData.created_at,
        created_by: groupData.created_by,
        members // Add the members information to the result
      }

      return result
    } catch (error) {
      logger.error(`[${directory}/${fileName}/getGroupDetail] Error finding group: ${groupID} - ` + error)
      throw error
    }
  },
  getGroupList: async () => {
    try {
      const groupData = await database.Group.findAll({
        attributes: ['id', 'name', 'description', 'is_active', 'created_at']
      })
      if (groupData.length === 0) {
        logger.error(`[${directory}/${fileName}/getGroupList] Groups table is empty`)
        return { success: false, message: 'empty' }
      } else {
        const groups = await Promise.all(groupData.map(async (entry) => {
          const groupMembers = await database.Group_Member.findAll({
            where: { group_id: entry.id },
            attributes: ['user_id', 'is_admin'],
            include: {
              model: database.User,
              attributes: ['id', 'full_name']
            }
          })
          const memberNames = groupMembers.map((member) => {
            return {
              id: member.User.id,
              name: member.User.full_name
            }
          })
          const adminMember = groupMembers.find((member) => member.is_admin)
          const id = adminMember ? adminMember.User.id : null
          const name = adminMember ? adminMember.User.full_name : null

          const adminProfile = { id, name }
          return {
            id: entry.id,
            name: entry.name,
            isActive: entry.is_active,
            description: entry.description,
            created_at: entry.created_at,
            members: memberNames,
            admin: adminProfile
          }
        }))

        logger.info(`[${directory}/${fileName}/getGroupList] Group list retrieved successfully`)
        return {
          success: true,
          data: groups
        }
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/getGroupList] Error getting group list: ` + error)
      return { success: false, message: 'error' }
    }
  },
  getGroupListUnderAdminID: async (adminID) => {
    try {
      const groupMemberCheck = await database.Group_Member.findAll({
        where: { user_id: adminID, is_admin: true },
        attributes: ['group_id']
      })
      if (groupMemberCheck.length === 0) {
        return { success: false, message: 'empty' }
      } else {
        const groupIds = groupMemberCheck.map((group) => group.group_id)
        const groupData = await database.Group.findAll({
          where: { id: groupIds, is_active: true },
          attributes: ['id', 'name', 'description', 'created_at', 'created_by']
        })
        if (groupData.length === 0) {
          logger.error(`[${directory}/${fileName}/getGroupListUnderAdminID] Groups table is empty`)
          return { success: false, message: 'empty' }
        } else {
          const groups = await Promise.all(groupData.map(async (entry) => {
            const groupMembers = await database.Group_Member.findAll({
              where: { group_id: entry.id },
              attributes: ['user_id', 'is_admin'],
              include: {
                model: database.User,
                attributes: ['id', 'full_name']
              }
            })
            const memberNames = groupMembers.map((member) => {
              return {
                id: member.User.id,
                name: member.User.full_name
              }
            })
            const adminMember = groupMembers.find((member) => member.is_admin)
            const id = adminMember ? adminMember.User.id : null
            const name = adminMember ? adminMember.User.full_name : null
            const adminProfile = { id, name }
            return {
              id: entry.id,
              name: entry.name,
              isActive: entry.is_active,
              description: entry.description,
              created_at: entry.created_at,
              members: memberNames,
              admin: adminProfile
            }
          }))

          logger.info(`[${directory}/${fileName}/getGroupListUnderAdminID] Group list retrieved successfully`)
          return {
            success: true,
            data: groups
          }
        }
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/getGroupListUnderAdminID] Error getting group list: ` + error)
      return { success: false, message: 'error' }
    }
  },
  doesGroupExists: async (id) => {
    try {
      const existingGroup = await database.Group.findOne({
        where: { id }
      })
      return existingGroup !== null
    } catch (error) {
      logger.error(`[${directory}/${fileName}/doesGroupExist] Error checking if group exists: ${name} - ` + error)
      return null
    }
  },
  doesGroupNameExists: async (name) => {
    try {
      const existingGroup = await database.Group.findOne({
        where: { name },
        attributes: ['id']
      })
      return existingGroup !== null
    } catch (error) {
      logger.error(`[${directory}/${fileName}/doesGroupExist] Error checking if group exists: ${name} - ` + error)
      throw error
    }
  },
  addGroup: async (name, description, adminID, membersID, creator) => {
    try {
      const groupData = await database.Group.create({
        name,
        description,
        created_by: creator
      })
      logger.info(`[${directory}/${fileName}/addGroup] Group ${name} record created.`)
      if (membersID && membersID.length > 0) {
        if (typeof membersID === 'string') {
          try {
            membersID = JSON.parse(membersID)
            if (Array.isArray(membersID)) {
              membersID = membersID.map(String)
            } else {
              membersID = [String(membersID)]
            }
          } catch (error) {
            logger.error(`[${directory}/${fileName}/addGroup] Error parsing memberID ${error}`)
          }
        }
        await Promise.all(
          /* eslint-disable */
          membersID.map(async (user_id) => {
            await database.Group_Member.create({
              user_id,
              group_id: groupData.id,
              is_active: true
            })
          })
          /* eslint-enable */
        )
      }
      logger.info(`[${directory}/${fileName}/addGroup] Group members for ${name} registered.`)
      await database.Group_Member.create({
        user_id: adminID,
        group_id: groupData.id,
        is_active: true,
        is_admin: true
      })
      logger.info(`[${directory}/${fileName}/addGroup] Group admin for ${name} assigned.`)
      return groupData
    } catch (error) {
      logger.error(`[${directory}/${fileName}/addGroup] Error creating group: ${name} - ` + error)
      throw error
    }
  },
  deactivateGroupMember: async (groupID, userID) => {
    try {
      const groupMemberData = await database.Group_Member.update({
        is_active: false
      },
      {
        where: {
          group_id: groupID, user_id: userID
        }
      })
      return groupMemberData
    } catch (error) {
      logger.error(`[${directory}/${fileName}/deactivateGroupMember] Error updating group member's status: ${groupID} - ` + error)
      throw error
    }
  },
  deactivateGroup: async (groupID) => {
    try {
      const group = await database.Group.update({
        is_active: false
      },
      {
        where: {
          id: groupID
        }
      })
      logger.info(`[${directory}/${fileName}/deactivateGroup] Status updated for group ${groupID} successfully.`)
      return group
    } catch (error) {
      logger.error(`[${directory}/${fileName}/deactivateGroup] Error updating group status: ${groupID} - ${error}`)
      return false
    }
  },
  reactivateGroup: async (groupID) => {
    try {
      const group = await database.Group.update({
        is_active: true
      },
      {
        where: {
          id: groupID
        }
      })
      logger.info(`[${directory}/${fileName}/reactivateGroup] Status updated for group ${groupID} successfully.`)
      return group
    } catch (error) {
      logger.error(`[${directory}/${fileName}/reactivateGroup] Error updating group status: ${groupID} - ${error}`)
      return false
    }
  },
  updateGroup: async (groupID, name, description, adminID, membersID) => {
    try {
      const existingGroup = await database.Group.findOne({ where: { id: groupID } })
      if (!existingGroup) {
        return false
      }
      existingGroup.name = name
      existingGroup.description = description
      await existingGroup.save()
      if (membersID && membersID.length > 0) {
        if (typeof membersID === 'string') {
          try {
            membersID = JSON.parse(membersID)
            if (Array.isArray(membersID)) {
              membersID = membersID.map(String)
            } else {
              membersID = [String(membersID)]
            }
          } catch (error) {
            logger.error(`[${directory}/${fileName}/updateGroup] Error parsing memberID ${error}`)
          }
        }
      }
      membersID.push(adminID)
      logger.info(`[${directory}/${fileName}/updateGroup] Find all group members for the given group ID`)
      const allGroupMembers = await database.Group_Member.findAll({
        where: { group_id: groupID },
        attributes: ['user_id']
      })
      logger.info(`[${directory}/${fileName}/updateGroup] Getting ID of previous group admin`)
      const oldAdmin = await database.Group_Member.findAll({
        where: { group_id: groupID, is_admin: true },
        attributes: ['user_id']
      })
      const existingMemberIDs = allGroupMembers.map((member) => member.user_id)
      logger.info(`[${directory}/${fileName}/updateGroup] Extract the user IDs of all existing members`)
      const userIDsToDeactivate = existingMemberIDs.filter((userID) => !membersID.includes(userID))
      await database.Group_Member.update(
        { is_active: false },
        {
          where: {
            group_id: groupID,
            user_id: userIDsToDeactivate
          }
        }
      )
      const userIDsToDemote = existingMemberIDs.filter((userID) => userID !== adminID)
      await database.Group_Member.update(
        { is_admin: false },
        {
          where: {
            group_id: groupID,
            user_id: userIDsToDemote
          }
        }
      )
      logger.info(`[${directory}/${fileName}/updateGroup] Update is_active & is_admin to false for relevant userIDs`)
      await Promise.all(
        membersID.map(async (memberID) => {
          const existingMember = await database.Group_Member.findOne({
            where: { group_id: groupID, user_id: memberID }
          })

          if (existingMember) {
            const shouldBeAdmin = memberID === adminID
            await existingMember.update({
              is_active: true,
              is_admin: shouldBeAdmin
            })
          } else {
            const shouldBeAdmin = memberID === adminID
            await database.Group_Member.create({
              user_id: memberID,
              group_id: groupID,
              is_active: true,
              is_admin: shouldBeAdmin
            })
          }
        })
      )
      const projectData = await database.Project.findAll({
        where: { group_id: groupID },
        attributes: ['id']
      })
      if (projectData && projectData.length > 0) {
        const projectIds = projectData.map((project) => project.id)
        const adminToRmv = oldAdmin[0].user_id
        const delAdminProjectMembership = await database.Project_Member.destroy({
          where: {
            project_id: projectIds,
            user_id: adminToRmv
          }
        })
        if (delAdminProjectMembership > 0) {
          logger.info(`[${directory}/${fileName}/updateGroup] Removed old admin (${adminToRmv}) from project memberships.`)
          const isNewAdminExistingMember = await database.Project_Member.findOne({
            where: { project_id: projectIds, user_id: adminID }
          })
          if (!isNewAdminExistingMember) {
            for (const projectId of projectIds) {
              await database.Project_Member.create({
                user_id: adminID,
                project_id: projectId,
                is_active: true
              })
            }
            logger.info(`[${directory}/${fileName}/updateGroup] Added new admin (${adminID}) to project memberships.`)
          } else {
            logger.info(`[${directory}/${fileName}/updateGroup] New admin (${adminID}) is already a member of the group.`)
          }
        }
      } else {
        logger.info(`[${directory}/${fileName}/updateGroup] No projects found for the given group.`)
      }
      logger.info(`[${directory}/${fileName}/updateGroup] Group details updated for: ${name}`)
      return true
    } catch (error) {
      logger.error(`[${directory}/${fileName}/updateGroup] Error updating group: ${name} - ` + error)
      return false
    }
  }
}
