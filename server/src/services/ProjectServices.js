const appRoot = require('app-root-path')
const logger = require(`${appRoot}/src/plugins/logger`)
const database = require(`${appRoot}/src/sequelize/models`)
const path = require('path')
const fileName = __filename.split(path.sep).pop()
const directory = __dirname.split(path.sep).pop()

module.exports = {
  getBasicProjectDetails: async (projectID) => {
    try {
      const projectData = await database.Project.findOne({
        where: { id: projectID }, attributes: ['id', 'name', 'description', 'is_active', 'created_at', 'created_by']
      })
      return projectData
    } catch (error) {
      logger.error(`[${directory}/${fileName}/getBasicProjectDetails] Error finding project: ${projectID} - ` + error)
      throw error
    }
  },
  getCompleteProjectDetails: async (projectID) => {
    try {
      const project = await database.Project.findOne({
        where: { id: projectID },
        attributes: ['id', 'name', 'description', 'is_active', 'created_at', 'created_by']
      })
      if (!project) {
        return null
      }
      const projectMembers = await database.Project_Member.findAll({
        where: { project_id: projectID },
        attributes: ['user_id', 'is_active', 'last_viewed', 'member_since'],
        include: {
          model: database.User,
          attributes: ['username', 'full_name', 'email']
        }
      })
      const members = projectMembers.map((member) => ({
        userID: member.user_id,
        fullName: member.User.full_name,
        username: member.User.username,
        email: member.User.email,
        isActive: member.is_active,
        lastSeen: member.last_viewed,
        memberSince: member.member_since
      }))
      const seen = new Set()
      const uniqueMembers = members.reduce((unique, member) => {
        if (!seen.has(member.userID)) {
          seen.add(member.userID)
          unique.push(member)
        }
        return unique
      }, [])
      const projectVersions = await database.Project_Version.findAll({
        where: { project_id: projectID },
        include: {
          model: database.Target_Class_Detail,
          attributes: ['id', 'name']
        }
      })
      const versions = projectVersions.map((version) => ({
        id: version.id,
        name: version.name,
        description: version.description,
        isActive: version.is_active,
        preprocessProgress: version.preprocess_status,
        trainingProgress: version.training_status,
        fullyPassed: version.preprocess_status !== null && version.training_status !== null
                      ? version.fully_passed
                      : false,
        colorMode: version.color_mode_id,
        createdAt: version.created_at,
        createdBy: version.created_by,
        updatedAt: version.updated_at,
        updatedBy: version.updated_by,
        target: (version.Target_Class_Details || []).map((target) => ({
          id: target.id,
          name: target.name
        }))
      }))
      const result = {
        id: project.id,
        name: project.name,
        description: project.description,
        isActive: project.is_active,
        createdAt: project.created_at,
        createdBy: project.created_by,
        uniqueMembers,
        versions
      }
      return result
    } catch (error) {
      logger.error(`[${directory}/${fileName}/getCompleteProjectDetails] Error finding project: ${projectID} - ` + error)
      throw error
    }
  },
  getPVTargetClass: async (projectVersionID) => {
    try {
      const projectVersions = await database.Project_Version.findAll({
        where: { id: projectVersionID },
        attributes: ['id', 'name'],
        include: {
          model: database.Target_Class_Detail,
          attributes: ['id', 'name']
        }
      })
      if (Object.keys(projectVersions).length === 0) {
        return false
      }
      logger.info(`[${directory}/${fileName}/getPVTargetClass] Drafting response for version targets: ${projectVersionID} `)
      const versions = projectVersions.map((version) => ({
        id: version.id,
        name: version.name,
        target: (version.Target_Class_Details || []).map((target) => ({
          id: target.id,
          name: target.name
        }))
      }))
      return versions
    } catch (error) {
      logger.error(`[${directory}/${fileName}/getPVTargetClass] Error finding project version: ${projectVersionID}`)
      throw error
    }
  },
  isProjectValid: async (projectID, projectVersionID) => {
    try {
      const project = await database.Project.findOne({
        where: { id: projectID },
        attributes: ['is_active']
      })
      const projectVersions = await database.Project_Version.findOne({
        where: { id: projectVersionID },
        attributes: ['is_active']
      })
      if (!projectVersions || !project || projectVersions.is_active === false || projectVersions.is_active === false) {
        return false
      } else {
        return true
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/isProjectValid] Error finding project: ${projectID} - ` + error)
      throw error
    }
  },
  getProjectList: async () => {
    try {
      const projectData = await database.Project.findAll({
        attributes: ['id', 'name', 'description', 'is_active', 'group_id', 'created_at']
      })

      if (projectData.length === 0) {
        logger.error(`[${directory}/${fileName}/getProjectList] Projects table is empty`)
        return { success: false, message: 'empty' }
      } else {
        const projects = await Promise.all(
          projectData.map(async (entry) => {
            const projectMembers = await database.Project_Member.findAll({
              where: { project_id: entry.id },
              attributes: ['user_id'],
              include: {
                model: database.User,
                attributes: ['full_name', 'id']
              }
            })

            const memberNames = projectMembers.map((member) => ({
              id: member.User.id,
              name: member.User.full_name
            }))

            const group = await database.Group.findOne({
              where: { id: entry.group_id },
              attributes: ['id', 'name']
            })

            return {
              id: entry.id,
              name: entry.name,
              isActive: entry.is_active,
              description: entry.description,
              created_at: entry.created_at,
              group,
              members: memberNames
            }
          })
        )
        logger.info(`[${directory}/${fileName}/getProjectList] Project list retrieved successfully`)
        return {
          success: true,
          data: projects
        }
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/getProjectList] Error getting project list: ` + error)
      return { success: false, message: 'error' }
    }
  },
  getMyProjectList: async (username) => {
    try {
      const userData = await database.User.findOne({
        where: { username },
        attributes: ['id', 'full_name'],
        include: [
          {
            model: database.Project,
            attributes: ['id', 'name', 'description', 'is_active', 'created_at', 'created_by'],
            through: {
              model: database.Project_Member,
              attributes: []
            },
            include: [
              {
                model: database.User,
                attributes: ['id', 'full_name'],
                through: { attributes: [] }
              }
            ]
          }
        ]
      })
      const projects = userData.Projects.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        isActive: project.is_active,
        createdAt: project.created_at,
        createdBy: project.created_by,
        members: project.Users.map((user) => ({
          id: user.id,
          name: user.full_name
        }))
      }))

      const userProfile = {
        userID: userData.id,
        fullName: userData.full_name,
        projects
      }
      return userProfile
    } catch (error) {
      logger.error(`[${directory}/${fileName}/getMyProjectList] Error retrieving user profile: ${username} - ` + error)
      throw error
    }
  },
  getProjectListByGroup: async (groupID) => {
    try {
      const projectData = await database.Project.findAll({
        where: { group_id: groupID },
        attributes: ['id', 'name', 'description', 'is_active', 'created_at']
      })

      if (projectData.length === 0) {
        logger.error(`[${directory}/${fileName}/getProjectList] Projects table is empty`)
        return { success: false, message: 'empty' }
      } else {
        const projects = await Promise.all(
          projectData.map(async (entry) => {
            const projectMembers = await database.Project_Member.findAll({
              where: { project_id: entry.id },
              attributes: ['user_id'],
              include: {
                model: database.User,
                attributes: ['full_name']
              }
            })
            const memberNames = projectMembers.map((member) => member.User.full_name)

            return {
              id: entry.id,
              name: entry.name,
              isActive: entry.is_active,
              description: entry.description,
              created_at: entry.created_at,
              members: memberNames
            }
          })
        )
        logger.info(`[${directory}/${fileName}/getProjectList] Project list retrieved successfully`)
        return {
          success: true,
          data: projects
        }
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/getProjectList] Error getting project list: ` + error)
      return { success: false, message: 'error' }
    }
  },
  getProjectListByAdmin: async (adminID) => {
    try {
      const adminGroups = await database.Group_Member.findAll({
        where: { user_id: adminID, is_admin: true },
        attributes: ['group_id']
      })
      const groupIDs = adminGroups.map((group) => group.group_id)
      const projectData = await database.Project.findAll({
        where: { group_id: groupIDs },
        attributes: ['id', 'name', 'description', 'is_active', 'created_at'],
        include: {
          model: database.Group,
          attributes: ['id', 'name']
        }
      })
      if (projectData.length === 0) {
        logger.error(`[${directory}/${fileName}/getProjectListByAdmin] Projects table is empty`)
        return { success: false, message: 'empty' }
      } else {
        const projects = await Promise.all(
          projectData.map(async (entry) => {
            const projectMembers = await database.Project_Member.findAll({
              where: { project_id: entry.id },
              attributes: ['user_id'],
              include: {
                model: database.User,
                attributes: ['full_name']
              }
            })
            const memberNames = projectMembers.map((member) => ({
              id: member.user_id,
              name: member.User.full_name
            }))
            const group = ({
              id: entry.Group.id,
              name: entry.Group.name
            })
            return {
              id: entry.id,
              name: entry.name,
              isActive: entry.is_active,
              description: entry.description,
              createdAt: entry.created_at,
              group,
              members: memberNames
            }
          })
        )
        logger.info(`[${directory}/${fileName}/getProjectListByAdmin] Project list retrieved successfully`)
        return {
          success: true,
          data: projects
        }
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/getProjectListByAdmin] Error getting project list: ` + error)
      return { success: false, message: 'error' }
    }
  },
  doesProjectExists: async (projectID) => {
    try {
      const existingProject = await database.Project.findOne({
        where: { id: projectID }
      })
      return existingProject !== null
    } catch (error) {
      logger.error(`[${directory}/${fileName}/doesProjectExist] Error checking if project exists: ${name} - ` + error)
      throw error
    }
  },
  doesProjectNameExists: async (name) => {
    try {
      const existingProject = await database.Project.findOne({
        where: { name },
        attributes: ['id']
      })
      return existingProject !== null
    } catch (error) {
      logger.error(`[${directory}/${fileName}/doesProjectNameExists] Error checking if project name exists: ${name} - ` + error)
      throw error
    }
  },
  doesVersionNameExists: async (name, projectID) => {
    try {
      const existingProjectVersion = await database.Project_Version.findOne({
        where: { name, project_id: projectID },
        attributes: ['id']
      })
      return existingProjectVersion !== null
    } catch (error) {
      logger.error(`[${directory}/${fileName}/doesVersionNameExists] Error checking if project version name exists: ${name} - ` + error)
      throw error
    }
  },
  doesProjectVersionExists: async (versionID) => {
    try {
      const existingProjectVersion = await database.Project_Version.findOne({
        where: { id: versionID }
      })
      return existingProjectVersion !== null
    } catch (error) {
      logger.error(`[${directory}/${fileName}/doesProjectExist] Error checking if project exists: ${name} - ` + error)
      throw error
    }
  },
  doesVersionNameExistOPV: async (name, projectID, currentProjectVersionID) => {
    try {
      const existingProjectVersion = await database.Project_Version.findOne({
        where: {
          name,
          project_id: projectID,
          id: { [database.Sequelize.not]: currentProjectVersionID }
        },
        attributes: ['id']
      })
      return existingProjectVersion !== null
    } catch (error) {
      logger.error(`[${directory}/${fileName}/doesVersionNameExistOPV] Error checking if project version name exists in other projects: ${name} - ` + error)
      throw error
    }
  },
  doesOtherProjectHaveTheName: async (name, id) => {
    try {
      const existingProjectVersion = await database.Project.findOne({
        where: {
          name,
          id: { [database.Sequelize.not]: id }
        },
        attributes: ['id']
      })
      return existingProjectVersion !== null
    } catch (error) {
      logger.error(`[${directory}/${fileName}/doesOtherProjectHaveTheName] Error checking if project name exists in other projects: ${name} - ` + error)
      throw error
    }
  },
  addProject: async (name, description, groupID, membersID, creatorID) => {
    try {
      const project = await database.Project.create({
        name,
        description,
        group_id: groupID,
        created_by: creatorID
      })
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
            logger.error(`[${directory}/${fileName}/addProject] Error parsing memberID ${error}`)
          }
        }
      }
      const uniqueMembersMap = new Map()
      membersID.forEach((memberID) => {
        uniqueMembersMap.set(memberID, true)
      })
      const uniqueMembersID = Array.from(uniqueMembersMap.keys())
      await Promise.all(
        uniqueMembersID.map(async (memberID) => {
          await database.Project_Member.create({
            user_id: memberID,
            project_id: project.id
          })
        })
      )
      logger.info(`[${directory}/${fileName}/addProject] Project added successfully`)
      return {
        success: true,
        data: {
          project,
          uniqueMembersID
        }
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/addProject] Error creating project: ${name} - ` + error)
      throw error
    }
  },
  deactivateProjectMember: async (projectID, userID) => {
    try {
      const projectMemberData = await database.Project_Member.update({
        is_active: false
      },
      {
        where: {
          project_id: projectID, user_id: userID
        }
      })
      return projectMemberData
    } catch (error) {
      logger.error(`[${directory}/${fileName}/deactivateProjectMember] Error updating project member's status: ${projectID} - ` + error)
      throw error
    }
  },
  updateProject: async (projectID, name, description, groupID, membersID, isActive, updatedBy) => {
    const t = await database.sequelize.transaction()
    try {
      const existingProject = await database.Project.findOne({ where: { id: projectID } })
      if (!existingProject) {
        await t.rollback()
        return false
      }
      existingProject.name = name
      existingProject.description = description
      existingProject.group_id = groupID
      existingProject.is_active = isActive
      existingProject.updated_by = updatedBy
      await existingProject.save({ transaction: t })

      const allProjectMembers = await database.Project_Member.findAll({
        where: { project_id: projectID },
        attributes: ['user_id']
      })
      const existingMemberIDs = allProjectMembers.map((member) => member.user_id)
      logger.info(`[${directory}/${fileName}/updateProject] Extract the user IDs of all existing members`)
      /* eslint-disable */
      const userIDsToDeactivate = existingMemberIDs.filter((userID) => !membersID.includes(userID))
      /* eslint-enable */
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
            logger.error(`[${directory}/${fileName}/updateProject] Error parsing memberID ${error}`)
          }
        }
      }
      await database.Project_Member.update(
        { is_active: false },
        {
          where: {
            project_id: projectID,
            user_id: { [database.Sequelize.Op.notIn]: membersID }
          },
          transaction: t
        }
      )
      await database.Project_Member.update(
        { is_active: true },
        {
          where: {
            project_id: projectID,
            user_id: { [database.Sequelize.Op.in]: membersID }
          },
          transaction: t
        }
      )
      await Promise.all(
        membersID.map(async (memberID) => {
          const existingMember = await database.Project_Member.findOne({
            where: { project_id: projectID, user_id: memberID }
          })

          if (existingMember) {
            await existingMember.update({
              is_active: true
            },
            { transaction: t })
          } else {
            await database.Project_Member.create({
              user_id: memberID,
              project_id: projectID,
              is_active: true
            },
            { transaction: t })
          }
        })
      )
      await t.commit()
      return true
    } catch (error) {
      await t.rollback()
      logger.error(`[${directory}/${fileName}/updateProject] Error updating project: ${projectID} - ` + error)
      throw error
    }
  },
  updateProjectVersion: async (projectVersionProfile) => {
    try {
      const existingVersion = await database.Project_Version.findOne({ where: { id: projectVersionProfile.projectVersionID, project_id: projectVersionProfile.projectID } })
      if (!existingVersion) {
        return false
      }
      if (existingVersion.project_id !== Number(projectVersionProfile.projectID)) {
        return false
      }
      existingVersion.name = projectVersionProfile.name
      existingVersion.description = projectVersionProfile.description
      existingVersion.is_active = projectVersionProfile.isActive
      existingVersion.updated_by = projectVersionProfile.updatedBy
      await existingVersion.save()
      logger.info(`[${directory}/${fileName}/updateProjectVersion] Project version updated successfully`)
      return true
    } catch (error) {
      logger.error(`[${directory}/${fileName}/updateProjectVersion] Error updating project version: ${projectVersionProfile.versionID} - ` + error)
      return false
    }
  },
  deleteProjectVersion: async (projectVersionId) => {
    let transaction
    try {
      transaction = await database.sequelize.transaction()
      const projectVersion = await database.Project_Version.findOne({ where: { id: projectVersionId } })
      if (!projectVersion) {
        await transaction.rollback()
        logger.error(`[${directory}/${fileName}/deleteProjectVersion] Project version not found.`)
        return false
      } else if (projectVersion.training_status) {
        await transaction.rollback()
        logger.error(`[${directory}/${fileName}/deleteProjectVersion] Project version is fully trained. Not allowed to delete.`)
        return false
      } else {
        const targetClassDetails = await database.Target_Class_Detail.findAll({ where: { pv_id: projectVersionId } })
        for (const targetClassDetail of targetClassDetails) {
          await database.Image.destroy({ where: { target_class_id: targetClassDetail.id }, transaction })
        }
        await database.Target_Class_Detail.destroy({ where: { pv_id: projectVersionId }, transaction })
        await database.Pv_Model.destroy({ where: { pv_id: projectVersionId }, transaction })
        await database.Pv_Norm.destroy({ where: { pv_id: projectVersionId }, transaction })
        await database.Pv_Resize.destroy({ where: { pv_id: projectVersionId }, transaction })
        await database.Pv_Sampling.destroy({ where: { pv_id: projectVersionId }, transaction })
        await database.Pv_Split.destroy({ where: { pv_id: projectVersionId }, transaction })
        await database.Pv_Model.destroy({ where: { pv_id: projectVersionId }, transaction })
        await database.Augment_Detail.destroy({ where: { pv_id: projectVersionId }, transaction })
        await database.Project_Version.destroy({ where: { id: projectVersionId }, transaction })
        await transaction.commit()
        return true
      }
    } catch (error) {
      /* eslint-disable */
      if (transaction) {
        await transaction.rollback();
      }
      /* eslint-enable */
      logger.error(`[${directory}/${fileName}/deleteProjectVersion] Failed to delete project version: ${error}`)
      return false
    }
  },
  addVersionPreprocess: async (projectID, projectVersionID, projectVersionProfile, taskID) => {
    try {
      const checkTaskID = await database.Project_Version.findOne({ where: { project_id: projectID, id: projectVersionID }, attributes: ['ppd_task_id'] })
      if (checkTaskID.ppd_task_id) {
        return {
          success: false,
          message: 'Preprocessing for this project version has already been recorded. '
        }
      }
      await database.Project_Version.update(
        { ppd_task_id: taskID },
        { where: { id: projectVersionID } }
      )
      /* eslint-disable */
      let pp
      for (const option of projectVersionProfile) {
        if ('resize' in option) {
          pp = await database.Pv_Resize.create({
            pv_id: projectVersionID,
            resize_height: option.resize.resizeHeight,
            resize_width: option.resize.resizeWidth
          })
        } else if ('colorModeID' in option) {
          pp = await database.Project_Version.update({ color_mode_id: option.colorModeID }, { where: { id: projectVersionID } })
        } else if ('split' in option) {
          pp = await database.Pv_Split.create({
            pv_id: projectVersionID,
            val_ratio: option.split.valRatio,
            test_ratio: option.split.testRatio
          })
        } else if ('normalize' in option) {
          pp = await database.Pv_Norm.create({
            pv_id: projectVersionID,
            normalization_id: option.normalize.normalizationID
          })
        } else if ('augment' in option) {
          pp = await database.Augment_Detail.create({
            pv_id: projectVersionID,
            augmentation_mode_id: option.augment.augmentationID,
            ratio: option.augment.augmentationRatio,
            value: option.augment.augmentationValue
          })
        } else if ('balance' in option) {
          pp = await database.Pv_Sampling.create({
            pv_id: projectVersionID,
            sampling_id: option.balance.samplingID
          })
        }
      }
      /* eslint-enable */
      logger.info(`[${directory}/${fileName}/addVersionPreprocess] Project ${projectID} v${projectVersionID} preprocessing details updated successfully`)
      return { success: true }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/addVersionPreprocess] Error updating project preprocessing details: Project ${projectID} v${projectVersionID} - ${error}`)
      return {
        success: false,
        message: `${error}`
      }
    }
  },
  getPPDTaskID: async (projectVersionID) => {
    try {
      const existingVersion = await database.Project_Version.findOne({ where: { id: projectVersionID }, attributes: ['ppd_task_id', 'created_at'] })
      if (!existingVersion) {
        return false
      }
      const createdAt = new Date(existingVersion.created_at)
      const currentDate = new Date()
      const oneDayInMilliseconds = 24 * 60 * 60 * 1000
      if (currentDate - createdAt > oneDayInMilliseconds) {
        return false
      }
      return existingVersion.ppd_task_id
    } catch (error) {
      logger.error(`[${directory}/${fileName}/getPPDTaskID] Error retrieving ppd task ID for project version: ${projectVersionID} - ${error} `)
      return false
    }
  },
  updatePPDProgress: async (projectVersionID, taskID, taskProgress) => {
    try {
      const existingEntry = await database.Project_Version.findOne({ where: { id: projectVersionID }, attributes: ['preprocess_status'] })
      console.log("🚀 ~ file: ProjectServices.js:719 ~ updatePPDProgress: ~ existingEntry:", existingEntry)
      if (existingEntry.preprocess_status === null || existingEntry.preprocess_status === 0){
        const progressUpdate = await database.Project_Version.update({ preprocess_status: taskProgress }, { where: { id: projectVersionID, ppd_task_id: taskID } })
        console.log("🚀 ~ file: ProjectServices.js:722 ~ updatePPDProgress: ~ progressUpdate:", progressUpdate)
        if (!progressUpdate) {
          return false
        }
      }
      return true
    } catch (error) {
      logger.error(`[${directory}/${fileName}/updatePPDProgress] Error updating progress for project version: ${projectVersionID} - ${error} `)
      return false
    }
  },
  getTrainingTaskID: async (projectVersionID) => {
    try {
      const getTaskID = await database.Pv_Model.findOne({ where: { pv_id: projectVersionID }, attributes: ['training_task_id', 'created_at'] })
      if (!getTaskID) {
        return false
      }
      const createdAt = new Date(getTaskID.created_at)
      const currentDate = new Date()
      const oneDayInMilliseconds = 24 * 60 * 60 * 1000
      if (currentDate - createdAt > oneDayInMilliseconds) {
        return false
      }
      return getTaskID.training_task_id
    } catch (error) {
      logger.error(`[${directory}/${fileName}/getTrainingTaskID] Error retrieving training task ID for project version: ${projectVersionID} - ${error} `)
      return false
    }
  },
  updateTrainingProgress: async (projectVersionID, taskProgress) => {
    if (taskProgress === null) {
      const progressUpdate = await database.Project_Version.update({ fully_passed: false }, { where: { id: projectVersionID } })
      if (!progressUpdate) {
        return false
      }
      return true
    }
    try {
      const progressUpdate = await database.Project_Version.update({ training_status: taskProgress, fully_passed: true }, { where: { id: projectVersionID } })
      if (!progressUpdate) {
        return false
      }
      return true
    } catch (error) {
      logger.error(`[${directory}/${fileName}/updateTrainingProgress] Error updating training progress for project version: ${projectVersionID} - ${error} `)
      return false
    }
  },
  updateTrainingResult: async (projectVersionID, result, keys) => {
    if (!result) {
      return false
    }
    try {
      const trainResult = await database.Project_Version.update({
        train_history: result.result.train_history,
        validation_results: result.result.validation_results,
        train_curve_key: keys.trainPlot,
        roc_plot_key: keys.rocPlot,
        cm_plot_key: keys.cmPlot
      }, { where: { id: projectVersionID } })
      if (!trainResult) {
        return false
      }
      return true
    } catch (error) {
      logger.error(`[${directory}/${fileName}/updateTrainingResult] Error updating training result for project version: ${projectVersionID} - ${error} `)
      return false
    }
  },
  addTargetClass: async (targetClassDetails) => {
    try {
      const existingProject = await database.Project.findOne({ where: { id: targetClassDetails.projectID } })
      if (!existingProject) {
        logger.info(`[${directory}/${fileName}/addTargetClass] Project not found in database`)
        return false
      }
      const existingProjectVersionTargets = await database.Target_Class_Detail.findOne({ where: { pv_id: targetClassDetails.projectVersionID, name: targetClassDetails.targetClassName } })
      if (existingProjectVersionTargets) {
        logger.info(`[${directory}/${fileName}/addTargetClass] Project version ${targetClassDetails.projectVersionID} with target class name "${targetClassDetails.targetClassName}" already has a record in database.`)
        return existingProjectVersionTargets
      }
      const addTargetClass = await database.Target_Class_Detail.create({
        pv_id: targetClassDetails.projectVersionID,
        name: targetClassDetails.targetClassName,
        directory: targetClassDetails.folderName
      })
      logger.info(`[${directory}/${fileName}/addTargetClass] Images for project version ${targetClassDetails.projectVersionID}, target class ${targetClassDetails.targetClassName} added successfully`)
      return addTargetClass
    } catch (error) {
      logger.error(`[${directory}/${fileName}/addTargetClass] Error uploading images for project version: ${targetClassDetails.projectVersionID}, target class ${targetClassDetails.targetClassID} - ${error}`)
      return false
    }
  },
  updateModelKey: async (projectVersionID, imgKey) => {
    try {
      const addKey = await database.Pv_Model.update({ model_key: imgKey }, { where: { pv_id: projectVersionID } })
      if (!addKey) {
        return false
      }
      return true
    } catch (error) {
      logger.error(`[${directory}/${fileName}/updateModelKey] Error updating model key for project version: ${projectVersionID} - ${error} `)
      return false
    }
  },
  findProjectVersionTargetClass: async (targetClass) => {
    try {
      const target = await database.Target_Class_Detail.findOne({
        where: { pv_id: targetClass.projectVersionID, name: targetClass.targetClassName },
        attributes: ['id']
      })
      if (!target) {
        logger.info(`[${directory}/${fileName}/findProjectVersionTargetClass] No target named ${targetClass.targetClassName} found for project version ${targetClass.projectVersionID}`)
        return false
      } else {
        logger.info(`[${directory}/${fileName}/findProjectVersionTargetClass] Existing target named ${targetClass.targetClassName} found for project version ${targetClass.projectVersionID}`)
        return target.id
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/findProjectVersionTargetClass] Error retrieving target named ${targetClass.targetClassName} found for project version ${targetClass.projectVersionID} - ${error} `)
      return false
    }
  },
  findProjectVersionTargetClassNameID: async (projectVersionID) => {
    try {
      const target = await database.Target_Class_Detail.findAll({ where: { pv_id: projectVersionID }, attributes: ['id', 'name'] })
      if (!target) {
        logger.info(`[${directory}/${fileName}/findProjectVersionTargetClassNameID] No target under project version ${projectVersionID} found.`)
        return false
      } else {
        logger.info(`[${directory}/${fileName}/findProjectVersionTargetClassNameID] Target under project version ${projectVersionID} found.`)
        return target
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/findProjectVersionTargetClassNameID] Error retrieving target under project version ${projectVersionID} found - ${error} `)
      return false
    }
  },
  addProjectVersionImg: async (uploadDetails) => {
    try {
      await database.Image.create({
        target_class_id: uploadDetails.targetClassID,
        key: uploadDetails.imgKey
      })
      logger.info(`[${directory}/${fileName}/addProjectVersionImg] Images for target class ${uploadDetails.targetClassID} added successfully`)
      return true
    } catch (error) {
      logger.error(`[${directory}/${fileName}/addProjectVersionImg] Error uploading images for project version: ${uploadDetails.projectVersionID}, target class ${uploadDetails.targetClassID} - ${error}`)
      return false
    }
  },
  findProjectVersionImg: async (name, targetClassID) => {
    try {
      const images = await database.Image.findOne({
        where: { target_class_id: targetClassID, key: name },
        attributes: ['key']
      })
      if (!images) {
        logger.info(`[${directory}/${fileName}/findProjectVersionImg] No image named ${name} found for target class ${targetClassID}`)
        return false
      } else {
        logger.info(`[${directory}/${fileName}/findProjectVersionImg] Existing image named ${name} found for target class ${targetClassID}`)
        return true
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/findProjectVersionImg] Error retrieving image named ${name} found for target class ${targetClassID} - ${error} `)
      return false
    }
  },
  getProjectVersionImg: async (downloadDetails) => {
    try {
      const existingVersion = await database.Project_Version.findOne({ where: { id: downloadDetails.projectVersionID } })
      if (!existingVersion) {
        return false
      }
      const images = await database.Image.findAll({
        where: { target_class_id: downloadDetails.targetClassID },
        attributes: ['key']
      })
      if (images.length === 0) {
        logger.info(`[${directory}/${fileName}/getProjectVersionImg] No images found for project ${downloadDetails.projectID} version ${downloadDetails.projectVersionID}, target class ${downloadDetails.targetClassID}`)
        return false
      } else {
        logger.info(`[${directory}/${fileName}/getProjectVersionImg] Image list for project ${downloadDetails.projectID} version ${downloadDetails.projectVersionID}, target class ${downloadDetails.targetClassID} retrieved successfully`)
        return images
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/getProjectVersionImg] Error retrieving image list for project ${downloadDetails.projectID} version: ${downloadDetails.projectVersionID}, target class ${downloadDetails.targetClassID} - ${error} `)
      return false
    }
  },
  addProjectVersion: async (addVersion) => {
    try {
      const newVersion = await database.Project_Version.create({
        project_id: addVersion.projectID,
        name: addVersion.versionName,
        description: addVersion.versionDescription,
        created_by: addVersion.createdBy
      })
      logger.info(`[${directory}/${fileName}/addProjectVersion] Project version added successfully`)
      return newVersion
    } catch (error) {
      logger.error(`[${directory}/${fileName}/addProjectVersion] Error adding project version for project ${addVersion.projectID} - ` + error)
      throw error
    }
  },
  deactivateProject: async (projectID) => {
    try {
      const project = await database.Project.update({
        is_active: false
      },
      {
        where: {
          id: projectID
        }
      })
      logger.info(`[${directory}/${fileName}/deactivateProject] Status updated for project ${projectID} successfully.`)
      return project
    } catch (error) {
      logger.error(`[${directory}/${fileName}/deactivateProject] Error updating project status: ${projectID} - ${error}`)
      return false
    }
  },
  reactivateProject: async (projectID) => {
    try {
      const project = await database.Project.update({
        is_active: true
      },
      {
        where: {
          id: projectID
        }
      })
      logger.info(`[${directory}/${fileName}/reactivateProject] Status updated for project ${projectID} successfully.`)
      return project
    } catch (error) {
      logger.error(`[${directory}/${fileName}/reactivateGroup] Error updating project status: ${projectID} - ${error}`)
      return false
    }
  },
  addModelTraining: async (projectID, projectVersionID, trainingDetails, taskID) => {
    try {
      const existingTraining = await database.Pv_Model.findOne({ where: { pv_id: projectVersionID }, attributes: ['training_task_id'] })
      if (existingTraining !== null) {
        logger.info(`[${directory}/${fileName}/addModelTraining] Project ${projectID} v${projectVersionID} training details exists for task ${taskID}`)
        return false
      }
      await database.Pv_Model.create({
        pv_id: projectVersionID,
        training_task_id: taskID,
        model_id: trainingDetails.modelParams.modelID,
        loss_id: trainingDetails.trainingParams.lossID,
        optimizer_id: trainingDetails.trainingParams.optimizerID,
        dense_neurons: trainingDetails.modelParams.denseNeurons,
        input_shape: trainingDetails.modelParams.inputShape.toString(),
        epoch: trainingDetails.trainingParams.epoch,
        learning_rate: trainingDetails.trainingParams.learningRate,
        batch_size: trainingDetails.trainingParams.batchSize
      })
      logger.info(`[${directory}/${fileName}/addModelTraining] Project ${projectID} v${projectVersionID} training details updated successfully`)
      return true
    } catch (error) {
      logger.error(`[${directory}/${fileName}/addModelTraining] Error updating project training details: Project ${projectID} v${projectVersionID} - ${error}`)
      return false
    }
  },
  destroyDataItems: async (projectID, projectVersionID, targetClassName) => {
    let transaction
    try {
      transaction = await database.sequelize.transaction()
      const targetClassDetail = await database.Target_Class_Detail.findOne({ where: { name: targetClassName } })
      if (!targetClassDetail){
        return false
      }
      await database.Image.destroy({ where: { target_class_id: targetClassDetail.id }, transaction })
      await database.Target_Class_Detail.destroy({ where: { pv_id: projectVersionID, name: targetClassName }, transaction })
      await transaction.commit()
      return true
    } catch (error) {
      /* eslint-disable */
      if (transaction) {
        await transaction.rollback();
      }
      logger.error(`[${directory}/${fileName}/destroyDataItems] Error deleting target ${targetClassName} images: Project ${projectID} v${projectVersionID} - ${error}`)
      return false
    }
  }
}
