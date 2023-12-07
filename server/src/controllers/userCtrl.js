const appRoot = require('app-root-path')
const archiver = require('archiver')
const { path, logger, messenger, filePath, finder, process, trainer, bcrypt, usersSvc, obs, projectSvc, redis, fs } = require(`${appRoot}/src/utils/util`)
const { send } = require(`${appRoot}/src/utils/serve`)
const worker = require(`${appRoot}/src/worker/preprocessing`)
const train = require(`${appRoot}/src/worker/training`)
const fileName = __filename.split(path.sep).pop()
const directory = __dirname.split(path.sep).pop()

const self = (module.exports = {
  changePassword: async (req, res) => {
    try {
      const { email, oldPassword, newPassword } = req.body

      if (!email || !newPassword) {
        logger.error(`[${directory}/${fileName}/changePassword] ${messenger(filePath, 'logIncompleteForm')}`)
        return send(res, false, messenger(filePath, 'incompleteForm'), 401)
      }
      const username = process.usernameExtraction(email).data
      const userValidity = await usersSvc.getAccValidity(username)
      if (userValidity === false) {
        return send(res, false, messenger(filePath, 'msgUserInvalid'), 403)
      }
      const getUserData = await finder.getUserData(username)
      if (getUserData.error) {
        return send(res, false, getUserData.message, 404)
      }
      let newPasswordHashed = null
      const userData = getUserData.data
      newPasswordHashed = await bcrypt.getHash(newPassword)
      const changePasswordResult = await self._compareAndChangePassword(
        res,
        userData,
        oldPassword,
        newPasswordHashed,
        newPassword
      )
      return changePasswordResult
    } catch (error) {
      logger.error(`[${directory}/${fileName}/changePassword] ${error}`)
      return send(res, false, messenger(filePath, 'internalError'), 500)
    }
  },
  _compareAndChangePassword: async (res, userData, oldPassword, newPasswordHashed, newPassword) => {
    if (userData.password !== null) {
      const oldPassCheck = await bcrypt.compareHash(oldPassword, userData.password)
      const samePassCheck = await bcrypt.compareHash(newPassword, userData.password)
      if (!oldPassCheck) { // if old password doesn't match
        return send(res, false, messenger(filePath, 'msgPassChangeFail'), 400)
      } else if (samePassCheck) { // if old password and new password match
        return send(res, false, messenger(filePath, 'msgSameAsOldPwd'), 400)
      } else { // if old password and new password different
        return self._changePasswordSvc(res, userData, newPasswordHashed, filePath)
      }
    } else {
      return self._changePasswordSvc(res, userData, newPasswordHashed, filePath)
    }
  },
  _changePasswordSvc: async (res, userData, newPasswordHashed) => {
    const passChange = await usersSvc.changePassword(userData.id, newPasswordHashed)
    if (passChange.error === false) {
      const message = messenger(filePath, 'msgPassChangeSuccess')
      logger.info(`[${directory}/${fileName}/_changePasswordSvc] ${message}`)
      return send(res, true, message, 200)
    } else {
      logger.error(`[${directory}/${fileName}/_changePasswordSvc] ${passChange.message}`)
      return send(res, false, messenger(filePath, 'msgPassChangeFail'), 400)
    }
  },
  getUserDetails: async (req, res) => {
    try {
      const getUserProfile = await usersSvc.getUserProfile(req.session.user)
      return send(res, true, messenger(filePath, 'userExists'), 200, getUserProfile)
    } catch (error) {
      const errorMessage = error.message || 'internalError'
      logger.error(`[${directory}/${fileName}/getUserDetails] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  listMyProjects: async (req, res) => {
    try {
      const getUserProfile = await projectSvc.getMyProjectList(req.session.user)
      return send(res, true, messenger(filePath, 'userExists'), 200, getUserProfile)
    } catch (error) {
      const errorMessage = error.message || 'internalError'
      logger.error(`[${directory}/${fileName}/listMyProjects] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  projectDetail: async (req, res) => {
    const { id } = req.body
    if (!id) {
      logger.error(`[${directory}/${fileName}/projectDetail] ${messenger(filePath, 'logIncompleteForm')}`)
      return send(res, false, messenger(filePath, 'incompleteForm'), 401)
    }
    try {
      const checkIfExists = await projectSvc.doesProjectExists(id)
      if (checkIfExists) {
        const getDetails = await projectSvc.getCompleteProjectDetails(id)
        if (getDetails) {
          if (getDetails.versions) {
            const versions = getDetails.versions
            const updateProgressPromises = []
            versions.forEach((version) => {
              const versionId = version.id
              const updateProgressP = self.checkPreprocessStatus(versionId)
              const updateProgressT = self.checkTrainStatus(versionId)
              updateProgressPromises.push(updateProgressP, updateProgressT)
            })
            try {
              await Promise.all(updateProgressPromises)
            } catch (error) {
              logger.error(`[${directory}/${fileName}/projectDetail] Error in promise: ${error}`)
            }
          }
          const retrieveMsg = messenger(filePath, 'projectDetailsRetrieved')
          logger.info(`[${directory}/${fileName}/projectDetail] ${retrieveMsg}`)
          return send(res, true, retrieveMsg, 200, getDetails)
        } else {
          const failedMsg = messenger(filePath, 'projectDetailsRetrievedError')
          logger.info(`[${directory}/${fileName}/projectDetail] ${failedMsg}`)
          return send(res, false, failedMsg, 400)
        }
      } else {
        const unknownProjectMsg = messenger(filePath, 'unknownProjectMsg') + ` Project ID: ${id}`
        logger.error(`[${directory}/${fileName}/projectDetail] ${unknownProjectMsg}`)
        return send(res, false, unknownProjectMsg, 404)
      }
    } catch (error) {
      const errorMessage = error.message || 'internalError'
      logger.error(`[${directory}/${fileName}/projectDetail] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  createProjectVersion: async (req, res) => {
    const { versionName, projectID, versionDescription } = req.body
    if (!versionName) {
      logger.error(`[${directory}/${fileName}/createProjectVersion] ${messenger(filePath, 'logIncompleteForm')}`)
      return send(res, false, messenger(filePath, 'incompleteForm'), 401)
    }
    try {
      const checkIfExists = await projectSvc.doesProjectExists(projectID)
      if (!checkIfExists) {
        const unknownProjectMsg = `Project ID ${projectID}: ${messenger(filePath, 'unknownProjectMsg')}`
        logger.error(`[${directory}/${fileName}/createProjectVersion] ${unknownProjectMsg}`)
        return send(res, false, unknownProjectMsg, 404)
      }
      const checkName = await projectSvc.doesVersionNameExists(versionName, projectID)
      if (checkName) {
        const duplicateNameMsg = versionName + messenger(filePath, 'projectVersionNameExists')
        logger.error(`[${directory}/${fileName}/createProjectVersion] ${duplicateNameMsg}`)
        return send(res, false, duplicateNameMsg, 400)
      }
      const getUserSession = await redis.getSessionData(req)
      const addVersion = {
        projectID,
        versionName,
        versionDescription,
        createdBy: getUserSession.userID
      }
      const pv = await projectSvc.addProjectVersion(addVersion)
      if (getUserSession.project) {
        if (getUserSession.project.projectID !== pv.project_id || getUserSession.project.projectVersionID !== pv.id) {
          const delPV = await projectSvc.deleteProjectVersion(getUserSession.project.projectVersionID)
          if (delPV) {
            await redis.deleteProjectData(req)
              .then((result) => {
                if (result.success) {
                  delete req.session.project
                  logger.info(`[${directory}/${fileName}/createProjectVersion] ${messenger(filePath, 'logSessionDeleteRedis')}`)
                } else {
                  logger.error(`[${directory}/${fileName}/createProjectVersion] ${messenger(filePath, 'logSessionDeleteFailedRedis')}`)
                }
              })
          } else {
            logger.error(`[${directory}/${fileName}/createProjectVersion] ${messenger(filePath, 'logSessionDeleteFailedDB')}`)
          }
        }
      }
      if (!req.session.project) {
        req.session.project = {}
      }
      req.session.project.projectVersionID = pv.id
      req.session.project.projectID = pv.project_id
      await redis.storeSessionData(req)
        .then((result) => {
          if (result.success) {
            logger.info(`[${directory}/${fileName}/createProjectVersion] Session data stored successfully in Redis.`)
          } else {
            logger.error(`[${directory}/${fileName}/createProjectVersion] Failed to store session data in Redis.`)
          }
        })
      const projectCreatedMsg = versionName + messenger(filePath, 'projectVersionCreated')
      logger.info(`[${directory}/${fileName}/createProjectVersion] ${projectCreatedMsg}`)
      const version = {
        projectID: pv.project_id,
        projectVersionID: pv.id,
        name: pv.name

      }
      return send(res, true, projectCreatedMsg, 200, version)
    } catch (error) {
      const errorMessage = error.message || 'internalError'
      logger.error(`[${directory}/${fileName}/createProjectVersion] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  editProjectVersion: async (req, res) => {
    const { projectVersionID, versionName, projectID, versionDescription, isActive } = req.body
    if (!projectVersionID || !projectID) {
      logger.error(`[${directory}/${fileName}/editProjectVersion] ${messenger(filePath, 'logIncompleteForm')}`)
      return send(res, false, messenger(filePath, 'incompleteForm'), 401)
    }
    try {
      const checkIfExists = await projectSvc.doesProjectVersionExists(projectVersionID)
      if (checkIfExists) {
        const checkName = await projectSvc.doesVersionNameExistOPV(versionName, projectID, projectVersionID)
        if (checkName) {
          const duplicateNameMsg = versionName + messenger(filePath, 'projectVersionNameExists')
          logger.error(`[${directory}/${fileName}/editProjectVersion] ${duplicateNameMsg}`)
          return send(res, false, duplicateNameMsg, 400)
        }
        const getUserSession = await redis.getSessionData(req)
        const projectVersionProfile = {
          projectVersionID,
          projectID,
          versionName,
          versionDescription,
          isActive,
          updatedBy: getUserSession.userID
        }
        const updateProject = await projectSvc.updateProjectVersion(projectVersionProfile)
        if (updateProject) {
          const projectEditedMsg = versionName + messenger(filePath, 'projectVersionEdited')
          logger.info(`[${directory}/${fileName}/editProjectVersion] ${projectEditedMsg}`)
          return send(res, true, projectEditedMsg, 200)
        } else {
          const editFailedMsg = versionName + messenger(filePath, 'projectVersionEditedError')
          logger.info(`[${directory}/${fileName}/editProjectVersion] ${editFailedMsg}`)
          return send(res, false, editFailedMsg, 400)
        }
      } else {
        const unknownProjectMsg = versionName + messenger(filePath, 'unknownVersionMsg')
        logger.error(`[${directory}/${fileName}/editProjectVersion] ${unknownProjectMsg}`)
        return send(res, false, unknownProjectMsg, 404)
      }
    } catch (error) {
      const errorMessage = error.message || 'internalError'
      logger.error(`[${directory}/${fileName}/editProjectVersion] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  addPreprocessDetails: async (req, res) => {
    const { preprocessDetails } = req.body
    const getUserSession = await redis.getSessionData(req)
    if (!getUserSession.project) {
      logger.info(`[${directory}/${fileName}/addPreprocessDetails] ${messenger(filePath, 'logNoProjectSessions')}. Attempt made by ${req.session.user}`)
      return send(res, false, messenger(filePath, 'noProjectInSession'), 404)
    }
    const { projectID, projectVersionID } = req.session.project
    if (!projectID || !projectVersionID || !preprocessDetails[0].colorModeID) {
      logger.error(`[${directory}/${fileName}/addPreprocessDetails] ${messenger(filePath, 'logIncompleteForm')}`)
      return send(res, false, messenger(filePath, 'incompleteForm'), 401)
    }
    try {
      const isProjectValid = await projectSvc.isProjectValid(projectID, projectVersionID)
      if (!isProjectValid) {
        const invalidProject = `Project ID ${projectID} version ${projectVersionID} ${messenger(filePath, 'projectInvalid')}`
        logger.error(`[${directory}/${fileName}/addPreprocessDetails] ${invalidProject}`)
        return send(res, false, invalidProject, 401)
      }
      try {
        const preprocessStructureJSON = await process.mapProjectDataToJSON(projectID, projectVersionID, preprocessDetails)
        const downloadFromObs = await self.downloadLocal(req)
        console.log("🚀 ~ file: userCtrl.js:275 ~ addPreprocessDetails: ~ downloadFromObs:", downloadFromObs)
        if (!downloadFromObs) {
          return send(res, true, 'Error in downloading images from Obs', 400)
        }
        const postWorker = await worker.preprocessData(projectID, projectVersionID, preprocessStructureJSON)
        if (!postWorker.success) {
          const preprocessFailMsg = `Project ${projectID} v${projectVersionID}: ${messenger(filePath, 'preprocessFail')} ${postWorker.data}`
          logger.info(`[${directory}/${fileName}/addPreprocessDetails] ${preprocessFailMsg}`)
          return send(res, true, preprocessFailMsg, 400)
        } else {
          // await process.sleep(10000)
          const checkPPD = await worker.preprocessProgress(postWorker.data)
          console.log("🚀 ~ file: userCtrl.js:287 ~ addPreprocessDetails: ~ checkPPD:", checkPPD)
          if (checkPPD.success && checkPPD.data.detail !== undefined) {
            const preprocessSendingFail = `${messenger(filePath, 'preprocessFail')} : ${checkPPD.data.detail}`
            logger.info(`[${directory}/${fileName}/addPreprocessDetails] ${preprocessSendingFail}`)
            return send(res, false, preprocessSendingFail, 400)
          } else {
            //update progress here
            const pushPreprocess = await projectSvc.addVersionPreprocess(projectID, projectVersionID, preprocessDetails, postWorker.data)
            await projectSvc.updatePPDProgress(projectVersionID, postWorker.data, postWorker.data.progress)
            if (!pushPreprocess.success) {
              const preprocessSendingFail = messenger(filePath, 'preprocessFail')
              logger.info(`[${directory}/${fileName}/addPreprocessDetails] ${preprocessSendingFail} ${pushPreprocess.message}`)
              return send(res, false, pushPreprocess.message, 200)
            }
            req.session.project.preprocessing = preprocessDetails
            const preprocessSent = messenger(filePath, 'preprocessPush')
            logger.info(`[${directory}/${fileName}/addPreprocessDetails] ${preprocessSent}`)
            return send(res, true, preprocessSent, 200, postWorker.data)
          }
        }
      } catch (error) {
        logger.error(`[${directory}/${fileName}/addPreprocessDetails] ${error}`)
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/addPreprocessDetails] Internal Server Error: ${error}`)
      return send(res, false, messenger(filePath, 'internalError'), 500)
    }
  },
  checkPreprocessStatus: async (versionId) => {
    try {
      const projectVersionID = versionId
      const getTaskID = await projectSvc.getPPDTaskID(projectVersionID)
      if (!getTaskID) {
        return
      }
      const postWorker = await worker.preprocessProgress(getTaskID)
      const progress = postWorker.data.progress
      await Promise.all([
        projectSvc.updatePPDProgress(projectVersionID, getTaskID, progress),
        worker.preprocessProgress(getTaskID)
      ])
      const pushPreprocess = await projectSvc.updatePPDProgress(projectVersionID, getTaskID, progress)
      if (postWorker.success && postWorker.data.detail !== undefined) {
        logger.info(`[${directory}/${fileName}/checkPreprocessStatus] Project v${projectVersionID} task ${getTaskID}: ${messenger(filePath, 'preprocessFail')} ${postWorker.data}`)
      } else if (!pushPreprocess) {
        logger.info(`[${directory}/${fileName}/checkPreprocessStatus] ${messenger(filePath, 'preprocessFail')}`)
      } else {
        logger.info(`[${directory}/${fileName}/checkPreprocessStatus] ${messenger(filePath, 'preprocessPush')}`)
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/checkPreprocessStatus] ${messenger(filePath, 'internalError')} ${error}`)
    }
  },
  checkTrainStatus: async (versionId) => {
    const projectVersionID = versionId
    try {
      const getTaskID = await projectSvc.getTrainingTaskID(projectVersionID)
      if (getTaskID !== false) {
        const postWorker = await train.trainingProgress(getTaskID)
        if (!postWorker.success) {
          if (postWorker.data === 'Internal Server Error') {
            await projectSvc.updateTrainingProgress(projectVersionID, null)
          }
          logger.info(`[${directory}/${fileName}/checkTrainStatus] Project v${projectVersionID} task ${getTaskID.value}: ${messenger(filePath, 'trainingProgressRetrieved')} ${postWorker.data}`)
        } else {
          const progress = JSON.parse(postWorker.data).progress
          const pushTrain = await projectSvc.updateTrainingProgress(projectVersionID, progress)
          if (!pushTrain) {
            logger.info(`[${directory}/${fileName}/checkTrainStatus] Update training progress record failed.`)
          }
          logger.info(`[${directory}/${fileName}/checkTrainStatus] ${messenger(filePath, 'preprocessPush')}`)
        }
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/checkTrainStatus] ${messenger(filePath, 'internalError')} ${error}`)
    }
  },
  upload: async (req, res) => {
    try {
      const uploadedFiles = req.files
      if (!uploadedFiles || uploadedFiles.length === 0) {
        return send(res, false, messenger(filePath, 'msgNoFiles'), 401)
      }
      const getUserSession = await redis.getSessionData(req)
      if (!getUserSession.project) {
        logger.info(`[${directory}/${fileName}/upload] ${messenger(filePath, 'logNoProjectSessions')}. Attempt made by ${req.session.user}`)
        return send(res, false, messenger(filePath, 'noProjectInSession'), 404)
      }
      const { projectID, projectVersionID } = getUserSession.project
      const filesByTargetClassName = uploadedFiles.reduce((acc, file) => {
        const oriName = file.originalname
        const parts = oriName.split('_')
        const targetClassName = parts[0]
        if (!acc[targetClassName]) {
          acc[targetClassName] = {
            files: [],
            folderName: `${projectID}_${projectVersionID}_${targetClassName}`
          }
        }
        acc[targetClassName].files.push(file)
        return acc
      }, {})
      req.session.project.numClasses = Object.keys(filesByTargetClassName).length
      if (!req.session.project.targetClass) {
        req.session.project.targetClass = {}
      } 
      if (req.session.project.targetClass){
        for (const targetClassName in req.session.project.targetClass) {
          const deleteTarget = await projectSvc.destroyDataItems(projectID, projectVersionID, targetClassName)
          if (deleteTarget){
            delete req.session.project.targetClass[targetClassName];
          }
        }
      }
      await process.sleep(5000)

      // check if folder for the pv already exists then delete it
      const toGoThru = `${appRoot}/tmp/upload/`;
      const prefixToDelete = `${projectID}_${projectVersionID}_`; 
      const directories = fs.readdirSync(toGoThru, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      // Filter directories with the specified prefix and delete them
      directories
        .filter(directory => directory.startsWith(prefixToDelete))
        .forEach(directory => {
          const directoryPath = path.join(toGoThru, directory);
          process.deleteFolderRecursive(directoryPath);
          console.log(`Deleted directory: ${directoryPath}`);
        });

      const targetClassCreationPromises = Object.entries(filesByTargetClassName).map(
        async ([targetClassName, { folderName, files }]) => {
          const targetClassDetails = {
            projectID,
            projectVersionID,
            targetClassName,
            folderName
          }
          const findTargetClass = await projectSvc.findProjectVersionTargetClass(targetClassDetails)
          let targetID
          if (!findTargetClass) {
            const addTarget = await projectSvc.addTargetClass(targetClassDetails)
            targetID = addTarget.id
          } else {
            targetID = findTargetClass
          }
          const tmpDir = `tmp/upload/${folderName}`
          const uploadDirectory = path.join(`${appRoot}`, tmpDir)
          if (!fs.existsSync(uploadDirectory)) {
            fs.mkdirSync(uploadDirectory, { recursive: true })
          }
          req.session.project.targetClass[targetClassName] = {
            targetClassID: targetID,
            uploadDirectory
          }
          const uploadResults = await Promise.all(uploadedFiles.map(async (uploadedFile) => {
            if (uploadedFile.originalname.includes(targetClassName)) {
              const filename = `${projectID}_${projectVersionID}_${targetID}_${uploadedFile.originalname}`
              const filePath = path.join(uploadDirectory, filename)
              const imgKey = `${folderName}/${filename}`
              const wasImgUploaded = await projectSvc.findProjectVersionImg(imgKey, targetID)
              if (!wasImgUploaded) {
                await fs.promises.writeFile(filePath, uploadedFile.buffer)
                const uploadResult = await obs.upload(uploadedFile.buffer, filePath, imgKey, uploadedFile.mimetype)
                const uploadDetails = {
                  targetClassID: targetID,
                  imgKey
                }
                await projectSvc.addProjectVersionImg(uploadDetails)
                return uploadResult
              } else {
                return { success: true }
              }
            } else {
              return null
            }
          }))
          const allUploadsSuccessful = uploadResults.every(result => result === null || result.success)
          return allUploadsSuccessful
        }
      )
      const results = await Promise.all(targetClassCreationPromises)
      if (results.includes(false)) {
        return send(res, false, 'Unable to complete uploading images.', 400)
      }
      await redis.storeSessionData(req).then((result) => {
        if (result.success) {
          logger.info(`[${directory}/${fileName}/upload] ${messenger(filePath, 'sessionStoredRedis')} ${req.session.user}`)
        } else {
          logger.error(`[${directory}/${fileName}/upload] ${messenger(filePath, 'noProjectInSession')} ${req.session.user}`)
        }
      })
      const allUploadsSuccessful = targetClassCreationPromises.every(result => result)
      if (allUploadsSuccessful) {
        const targetClasses = req.session.project.targetClass
        const uploadDetails = {
          targetClasses
        }
        return send(res, true, `Project ${projectID} v${projectVersionID}: ${messenger(filePath, 'uploadSuccess')}`, 200, uploadDetails)
      } else {
        return send(res, false, messenger(filePath, 'obsFailed'), 500)
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/upload] ${error}`)
      return send(res, false, error, 500)
    }
  },
  streamImages: async (req, res) => {
    try {
      const { projectVersionID, projectID } = req.body
      if (!projectID || !projectVersionID) {
        logger.error(`[${directory}/${fileName}/streamImages] ${messenger(filePath, 'logIncompleteForm')}`)
        return send(res, false, messenger(filePath, 'incompleteForm'), 401)
      }
      const findTargetClass = await projectSvc.findProjectVersionTargetClassNameID(projectVersionID)
      if (!findTargetClass) {
        return send(res, false, 'No images ever uploaded under this version', 401)
      }
      const imageData = []
      try {
        const folderNameToCheck = `${req.session.project.projectID}_${req.session.project.projectVersionID}`
        const downloadDirectoryCheck = path.join(`${appRoot}/tmp/download/`, folderNameToCheck)
        if (!fs.existsSync(downloadDirectoryCheck)) {
          fs.mkdirSync(downloadDirectoryCheck, { recursive: true })
        }
        if (fs.existsSync(downloadDirectoryCheck)) {
          fs.readdirSync(downloadDirectoryCheck).forEach((file, index) => {
            const curPath = path.join(downloadDirectoryCheck, file)
            if (fs.lstatSync(curPath).isDirectory()) {
              process.deleteFolderRecursive(curPath)
            } else {
              fs.unlinkSync(curPath)
            }
          })
          fs.rmdirSync(downloadDirectoryCheck)
        }
        for (const detail of findTargetClass) {
          const targetClassID = detail.dataValues.id
          const targetClassName = detail.dataValues.name
          const projectData = {
            requestedPID: projectID,
            requestedPVID: projectVersionID,
            sessionPID: req.session.project.projectID,
            sessionPVID: req.session.project.projectVersionID,
            targetClassID,
            targetClassName
          }
          await self.downloadToStreamOthers(projectData)
          const folderName = `${projectID}_${projectVersionID}/${targetClassName}`
          const downloadDirectory = path.join(`${appRoot}/tmp/download/`, folderName)
          try {
            const files = await fs.promises.readdir(downloadDirectory)
            const imageFileExtensions = ['.jpg', '.png', '.jpeg']
            const imageFiles = files.filter((file) =>
              imageFileExtensions.includes(path.extname(file).toLowerCase())
            )
            const base64ImagePromises = imageFiles.map(async (file) => {
              const contentType = process.getContentType(file)
              const imagePath = path.join(downloadDirectory, file)
              try {
                const data = await fs.promises.readFile(imagePath)
                const base64Image = Buffer.from(data).toString('base64')
                imageData.push({ id: targetClassID, name: targetClassName, contentType, base64: base64Image })
                return base64Image
              } catch (error) {
                logger.error(`[${directory}/${fileName}/streamImages] Error processing file ${file}: ${error}`)
                throw error
              }
            })
            try {
              await Promise.all(base64ImagePromises)
            } catch (error) {
              logger.error(`[${directory}/${fileName}/streamImages] Error converting images to base64: ${error}`)
            }
            logger.info(`[${directory}/${fileName}/streamImages] Images under the target class retrieved.`)
          } catch (error) {
            logger.error(`[${directory}/${fileName}/streamImages] ${error}`)
            return send(res, false, messenger(filePath, 'internalError'), 500)
          }
        }
        if (req.io) {
          req.io.emit('image-stream', imageData)
        }
        return send(res, true, 'Images retrieved', 200, imageData)
      } catch (error) {
        logger.error(`[${directory}/${fileName}/streamImages] ${error}`)
        return send(res, false, messenger(filePath, 'internalError'), 500)
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/streamImages] ${error}`)
      return send(res, false, messenger(filePath, 'internalError'), 500)
    }
  },
  // downloadLocal: async (req, res) => {
  //   try {
  //     const data = req.session.project
  //     const { projectVersionID, projectID } = data
  //     let allDownloadsSuccessful = true
  //     for (const targetClassName in data.targetClass) {
  //       /* eslint-disable */
  //       if (data.targetClass.hasOwnProperty(targetClassName)) {
  //         /* eslint-enable */
  //         const targetClassID = data.targetClass[targetClassName].targetClassID
  //         const downloadDetails = {
  //           projectID,
  //           projectVersionID,
  //           targetClassID
  //         }
  //         const keyLists = await projectSvc.getProjectVersionImg(downloadDetails)
  //         if (!keyLists || keyLists.length === 0) {
  //           logger.info(`[${directory}/${fileName}/downloadLocal] No files to download. Project ${projectVersionID}v${projectID}`)
  //           allDownloadsSuccessful = false
  //         } else {
  //           const folderName = `${projectID}_${projectVersionID}/${targetClassName}`
  //           const downloadDirectory = path.join(`${appRoot}/tmp/download/`, folderName)
  //           if (!fs.existsSync(downloadDirectory)) {
  //             fs.mkdirSync(downloadDirectory, { recursive: true })
  //           }
  //           for (const keyList of keyLists) {
  //             try {
  //               const obsDL = await obs.downloadAsImage(keyList.key, downloadDirectory)
  //               console.log("🚀 ~ file: userCtrl.js:609 ~ downloadLocal: ~ obsDL:", obsDL)
  //             } catch (error) {
  //               logger.error(`[${directory}/${fileName}/downloadLocal] ${messenger(filePath, 'obsFailed')} Project ID ${projectID} v${projectVersionID}: ${error}`)
  //               allDownloadsSuccessful = false
  //             }
  //           }
  //           logger.info(`[${directory}/${fileName}/downloadLocal] ${messenger(filePath, 'imageDownloadSuccess')} for Project ${projectID} v${projectVersionID}`)
  //         }
  //       }
  //     }
  //     if (allDownloadsSuccessful) {
  //       return true
  //     } else {
  //       return false
  //     }
  //   } catch (error) {
  //     logger.error(`[${directory}/${fileName}/downloadLocal] ${error}`)
  //     return false
  //   }
  // },
  downloadLocal: async (req, res) => {
    try {
      const data = req.session.project;
      const { projectVersionID, projectID } = data;
      let allDownloadsSuccessful = true;
  
      for (const targetClassName in data.targetClass) {
        if (data.targetClass.hasOwnProperty(targetClassName)) {
          const targetClassID = data.targetClass[targetClassName].targetClassID;
          const downloadDetails = {
            projectID,
            projectVersionID,
            targetClassID
          };
  
          try {
            const keyLists = await projectSvc.getProjectVersionImg(downloadDetails);
  
            if (!keyLists || keyLists.length === 0) {
              logger.info(`[${directory}/${fileName}/downloadLocal] No files to download. Project ${projectVersionID}v${projectID}`);
            } else {
              const folderName = `${projectID}_${projectVersionID}/${targetClassName}`;
              const downloadDirectory = path.join(`${appRoot}/tmp/download/`, folderName);
  
              if (!fs.existsSync(downloadDirectory)) {
                fs.mkdirSync(downloadDirectory, { recursive: true });
              }
  
              for (const keyList of keyLists) {
                try {
                  const obsDL = await obs.downloadAsImage(keyList.key, downloadDirectory);
                  console.log("🚀 ~ file: userCtrl.js:609 ~ downloadLocal: ~ obsDL:", obsDL);
                } catch (error) {
                  logger.error(`[${directory}/${fileName}/downloadLocal] ${messenger(filePath, 'obsFailed')} Project ID ${projectID} v${projectVersionID}: ${error}`);
                  allDownloadsSuccessful = false;
                }
              }
  
              logger.info(`[${directory}/${fileName}/downloadLocal] ${messenger(filePath, 'imageDownloadSuccess')} for Project ${projectID} v${projectVersionID}`);
            }
          } catch (error) {
            logger.error(`[${directory}/${fileName}/downloadLocal] Error fetching key lists: ${error}`);
            allDownloadsSuccessful = false;
          }
        }
      }
  
      return allDownloadsSuccessful;
    } catch (error) {
      logger.error(`[${directory}/${fileName}/downloadLocal] ${error}`);
      return false;
    }
  },
  downloadToStreamOthers: async (data) => {
    try {
      let allDownloadsSuccessful = true
      const downloadDetails = {
        projectID: data.requestedPID,
        projectVersionID: data.requestedPVID,
        targetClassID: data.targetClassID
      }
      const keyLists = await projectSvc.getProjectVersionImg(downloadDetails)
      if (!keyLists || keyLists.length === 0) {
        logger.info(`[${directory}/${fileName}/downloadToStreamOthers] No files to download for requested P${data.requestedPID}v${data.requestedPVID}, for P${data.sessionPID}v${data.sessionPVID}`)
        allDownloadsSuccessful = false
      } else {
        const folderName = `${data.sessionPID}_${data.sessionPVID}/${data.targetClassName}`
        const downloadDirectory = path.join(`${appRoot}/tmp/download/`, folderName)
        for (const keyList of keyLists) {
          try {
            await obs.downloadAsImage(keyList.key, downloadDirectory)
          } catch (error) {
            logger.error(`[${directory}/${fileName}/downloadToStreamOthers] ${messenger(filePath, 'obsFailed')} P${data.requestedPID}v${data.requestedPVID}, for P${data.sessionPID}v${data.sessionPVID}: ${error}`)
            allDownloadsSuccessful = false
          }
        }
        logger.info(`[${directory}/${fileName}/downloadToStreamOthers] ${messenger(filePath, 'imageDownloadSuccess')} P${data.requestedPID}v${data.requestedPVID}, for P${data.sessionPID}v${data.sessionPVID}`)
      }
      if (allDownloadsSuccessful) {
        const projectIdentifier = `${data.sessionPID}_${data.sessionPVID}`
        return { success: true, data: projectIdentifier }
      } else {
        return false
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/downloadToStreamOthers] ${error}`)
      return false
    }
  },
  download: async (req, res) => {
    try {
      const { projectVersionID, projectID, targetClassID } = req.body // if u ask for targetClassID, u need to make api to give them that
      if (!targetClassID) {
        logger.error(`[${directory}/${fileName}/download] ${messenger(filePath, 'logIncompleteForm')}`)
        return send(res, false, messenger(filePath, 'incompleteForm'), 401)
      }
      const downloadDetails = {
        projectID,
        projectVersionID,
        targetClassID
      }
      const keyLists = await projectSvc.getProjectVersionImg(downloadDetails)
      if (!keyLists || keyLists.length === 0) {
        return send(res, false, 'No files to download', 404)
      }
      const folderName = `${projectID}_${projectVersionID}/${targetClassID}`
      const downloadDirectory = path.join(`${appRoot}/tmp/download/`, folderName)
      if (!fs.existsSync(downloadDirectory)) {
        fs.mkdirSync(downloadDirectory, { recursive: true })
      }
      for (const keyList of keyLists) {
        try {
          await obs.downloadAsImage(keyList.key, downloadDirectory)
        } catch (error) {
          logger.error(`[${directory}/${fileName}/download] ${messenger(filePath, 'obsFailed')} Project ID ${projectID} v${projectVersionID}: ${error}`)
          return send(res, false, messenger(filePath, 'obsFailed'), 500)
        }
      }
      logger.info(`[${directory}/${fileName}/download] ${messenger(filePath, 'imageDownloadSuccess')} for Project ${projectID} v${projectVersionID}`)
      return send(res, true, messenger(filePath, 'imageDownloadSuccess'), 200)
    } catch (error) {
      logger.error(`[${directory}/${fileName}/download] ${error}`)
      return send(res, false, messenger(filePath, error), 500)
    }
  },
  projectSessionData: async (req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    try {
      const getUserSession = await redis.getSessionData(req)
      if (getUserSession.success) {
        logger.info(`[${directory}/${fileName}/projectSessionData] Session for ${getUserSession.user} retrieved`)
        if (!getUserSession.project) {
          logger.info(`[${directory}/${fileName}/projectSessionData] ${messenger(filePath, 'logNoProjectSessions')}`)
          return send(res, false, messenger(filePath, 'noProjectInSession'), 404)
        }
        const userProjectSession = {
          project: getUserSession.project
        }
        return send(res, true, messenger(filePath, 'msgUserSessionValid'), 200, userProjectSession)
      } else {
        logger.error(`[${directory}/${fileName}/projectSessionData] ${messenger(filePath, 'noProjectInSession')}`)
        return send(res, false, messenger(filePath, 'msgUserSessionInvalid'), 404)
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/projectSessionData] ${error}`)
      return send(res, false, messenger(filePath, 'internalError'), 500)
    }
  },
  deleteProjectSession: async (req, res) => {
    try {
      const getUserSession = await redis.getSessionData(req)
      if (getUserSession.project) {
        // deleting in db
        const delPV = await projectSvc.deleteProjectVersion(getUserSession.project.projectVersionID)
        if (delPV) {
          await redis.deleteProjectData(req)
            .then((result) => {
              if (result.success) {
                delete req.session.project
                logger.info(`[${directory}/${fileName}/deleteProjectSession] ${messenger(filePath, 'logSessionDeleteRedis')}`)
                return send(res, true, messenger(filePath, 'msgSessionDelete'), 200)
              } else {
                logger.error(`[${directory}/${fileName}/deleteProjectSession] ${messenger(filePath, 'logSessionDeleteFailedRedis')}`)
                return send(res, false, messenger(filePath, 'msgSessionDeleteFailed'), 400)
              }
            })
        } else {
          logger.error(`[${directory}/${fileName}/deleteProjectSession] ${messenger(filePath, 'logSessionDeleteFailedDB')}`)
          return send(res, false, messenger(filePath, 'msgSessionPVDBDeleteFailed'), 400)
        }
      } else {
        return send(res, true, messenger(filePath, 'noProjectInSession'), 200)
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/deleteProjectSession] ${error}`)
      return send(res, false, messenger(filePath, 'internalError'), 500)
    }
  },
  trainingSubmit: async (req, res) => {
    const { modelParams, trainingParams } = req.body
    const getUserSession = await redis.getSessionData(req)
    if (!getUserSession.project) {
      logger.info(`[${directory}/${fileName}/trainingSubmit] ${messenger(filePath, 'logNoProjectSessions')}. Attempt made by ${req.session.user}`)
      return send(res, false, messenger(filePath, 'noProjectInSession'), 404)
    }
    modelParams.inputShape = [224, 224, 3] // NOTE: hardcoded
    const { projectID, projectVersionID } = getUserSession.project
    const folderName = `${projectID}_${projectVersionID}`
    const downloadDirectory = path.join(`${appRoot}/tmp/download/`, folderName)
    const folderCount = process.countFolders(downloadDirectory)
    if (folderCount !== -1) {
      console.log(`Number of folders in ${downloadDirectory}: ${folderCount}`)
    } else {
      console.error(`Failed to count folders in ${downloadDirectory}`)
    }
    modelParams.numClasses = folderCount
    modelParams.denseNeurons = parseInt(modelParams.denseNeurons, 10)
    trainingParams.epoch = parseInt(trainingParams.epoch, 10)
    trainingParams.batchSize = parseInt(trainingParams.batchSize, 10)

    if (!projectID || !projectVersionID || !modelParams || !trainingParams) {
      logger.error(`[${directory}/${fileName}/trainingSubmit] ${messenger(filePath, 'logIncompleteForm')}`)
      return send(res, false, messenger(filePath, 'incompleteForm'), 401)
    }
    try {
      const isProjectValid = await projectSvc.isProjectValid(projectID, projectVersionID)
      if (!isProjectValid) {
        const invalidProject = `Project ID ${projectID} version ${projectVersionID} ${messenger(filePath, 'projectInvalid')}`
        logger.error(`[${directory}/${fileName}/trainingSubmit] ${invalidProject}`)
        return send(res, false, invalidProject, 401)
      }
      try {
        const trainingDataJSON = await trainer.transformTrainingJson(projectID, projectVersionID, req.body)
        const postWorker = await train.trainingData(projectID, projectVersionID, trainingDataJSON)
        if (!postWorker.success) {
          const trainingFailMsg = `Project ${projectID}v${projectVersionID}: ${messenger(filePath, 'trainingFail')} ${postWorker.data}`
          logger.info(`[${directory}/${fileName}/trainingSubmit] ${trainingFailMsg}`)
          return send(res, true, trainingFailMsg, 400)
        } else {
          const recordTrainDetails = await projectSvc.addModelTraining(projectID, projectVersionID, req.body, postWorker.data)
          if (!recordTrainDetails) {
            const trainingSendingFail = messenger(filePath, 'trainingRecordExists')
            logger.info(`[${directory}/${fileName}/trainingSubmit] ${trainingSendingFail}`)
            return send(res, false, trainingSendingFail, 400)
          }
          req.session.project.training = req.body
          const trainingSent = messenger(filePath, 'trainingPush')
          logger.info(`[${directory}/${fileName}/trainingSubmit] ${trainingSent}`)
          return send(res, true, trainingSent, 200, postWorker.data)
        }
      } catch (error) {
        logger.error(`[${directory}/${fileName}/trainingSubmit] ${error}`)
      }
    } catch (error) {
      const errorMessage = messenger(filePath, 'internalError')
      logger.error(`[${directory}/${fileName}/trainingSubmit] ${error}`)
      return send(res, false, messenger(filePath, errorMessage), 500)
    }
  },
  checkTrainingStatus: async (req, res) => {
    const { projectVersionID } = req.body
    if (!projectVersionID) {
      logger.error(`[${directory}/${fileName}/checkTrainingStatus] ${messenger(filePath, 'logIncompleteForm')}`)
      return send(res, false, messenger(filePath, 'incompleteForm'), 401)
    }
    try {
      const isProjectVersionValid = await projectSvc.doesProjectVersionExists(projectVersionID)
      if (!isProjectVersionValid) {
        const invalidProject = `Project version ${projectVersionID} ${messenger(filePath, 'projectInvalid')}`
        logger.error(`[${directory}/${fileName}/checkTrainingStatus] ${invalidProject}`)
        return send(res, false, invalidProject, 401)
      }
      try {
        const getTaskID = await projectSvc.getTrainingTaskID(projectVersionID)
        const postWorker = await train.trainingProgress(getTaskID)
        if (!postWorker.success) {
          const pushTrainingProgress = await projectSvc.updateTrainingProgress(projectVersionID, null)
          console.log('🚀 ~ file: userCtrl.js:796 ~ checkTrainingStatus: ~ pushTrainingProgress:', pushTrainingProgress)
          const fetchProgressFailMsg = `[TaskID: ${getTaskID}] ${messenger(filePath, 'fetchTrainingProgressFail')} ${JSON.parse(postWorker.data).detail}`
          logger.info(`[${directory}/${fileName}/checkTrainingStatus] ${fetchProgressFailMsg}`)
          return send(res, false, fetchProgressFailMsg, 400, {})
        } else {
          const pushTrainingProgress = await projectSvc.updateTrainingProgress(projectVersionID, JSON.parse(postWorker.data).progress)
          if (JSON.parse(postWorker.data).result) {
            /* eslint-disable */
            const trainPlot = JSON.parse(postWorker.data).result.train_plot
            const uploadtrainPlot = await obs.uploadPlot(trainPlot, `tp-curve-${getTaskID}`)
            const rocPlot = JSON.parse(postWorker.data).result.validation_plot.roc_plot
            const uploadrocPlot = await obs.uploadPlot(rocPlot, `vp-rocp-${getTaskID}`)
            const cmPlot = JSON.parse(postWorker.data).result.validation_plot.cm_plot
            const uploadcmPlot = await obs.uploadPlot(cmPlot, `vp-cmp-${getTaskID}`)
            const keys = {
              trainPlot: `tp-curve-${getTaskID}`,
              rocPlot: `vp-rocp-${getTaskID}`,
              cmPlot: `vp-cmp-${getTaskID}`
            }
            const pushTrainingResult = await projectSvc.updateTrainingResult(projectVersionID, JSON.parse(postWorker.data), keys)
            /* eslint-enable */
            const trainDataRecorded = messenger(filePath, 'addTrainResSuccess')
            logger.info(`[${directory}/${fileName}/checkTrainingStatus] ${trainDataRecorded}`)
            return send(res, true, trainDataRecorded, 200, JSON.parse(postWorker.data).result)
          }
          if (!pushTrainingProgress) {
            const addRecordFailed = messenger(filePath, 'addTrainingDataFailed')
            logger.info(`[${directory}/${fileName}/checkTrainingStatus] ${addRecordFailed}`)
            return send(res, false, addRecordFailed, 500)
          }
          if (JSON.parse(postWorker.data).result === undefined) {
            const trainDataRecorded = messenger(filePath, 'addTrainResSuccess')
            logger.info(`[${directory}/${fileName}/checkTrainingStatus] ${trainDataRecorded}`)
            return send(res, true, trainDataRecorded, 200, postWorker.data + '%')
          }
        }
      } catch (error) {
        logger.error(`[${directory}/${fileName}/checkTrainingStatus] Uncaught error during progress retrieval - ${error}`)
        return send(res, false, `Uncaught error during progress retrieval from worker - ${error}`, 500)
      }
    } catch (error) {
      const errorMessage = `messenger(filePath, 'internalError') - ${error}`
      logger.error(`[${directory}/${fileName}/checkTrainingStatus] ${errorMessage}`)
      return send(res, false, errorMessage, 500)
    }
  },
  getTargetConfig: async (req, res) => {
    try {
      const { projectVersionID, projectID } = req.body
      if (!projectVersionID || !projectID) {
        logger.error(`[${directory}/${fileName}/getTargetConfig] ${messenger(filePath, 'logIncompleteForm')}`)
        return send(res, false, messenger(filePath, 'incompleteForm'), 401)
      }
      const folderName = `${projectID}_${projectVersionID}`
      const assetDirectory = path.join(`${appRoot}/tmp/models/`, folderName)
      if (!fs.existsSync(assetDirectory)) {
        fs.mkdirSync(assetDirectory, { recursive: true })
      }
      const getClasses = await projectSvc.getPVTargetClass(projectVersionID)
      const names = []
      for (const obj of getClasses) {
        const targetArray = obj.target
        for (const element of targetArray) {
          names.push(element.name)
        }
      }
      const outputData = {
        classes_name: names
      }
      const configPath = `${appRoot}/assets/config.json`
      await fs.promises.writeFile(configPath, JSON.stringify(outputData, null, 2), 'utf-8');
      logger.info(`[${directory}/${fileName}/getTargetConfig] ${messenger(filePath, 'modelDownloadSuccess')} for Project ${projectID} v${projectVersionID}`)
    } catch (error) {
      logger.error(`[${directory}/${fileName}/getTargetConfig] ${messenger(filePath, 'internalError')} ${error}`)
    }
  },
  generateManual: async (req, res) => {
    const { projectID, projectVersionID } = req.body;
    const filePath = `${appRoot}/assets/README.md`;
    const zipPath = `${appRoot}/assets/ManualProject_${projectID}v${projectVersionID}.zip`;
    const tmpFolder = `${appRoot}/tmp/models/${projectID}_${projectVersionID}`;
  
    try {
      logger.info(`[${directory}/${fileName}/generateManual] Sending parameters to retrieve related config files and models for project=${projectID} & version=${projectVersionID}`);
      await self.getTargetConfig(req);
  
      const data = await fs.promises.readFile(filePath, 'utf8');
      const updatedDockerfile = data.replace('project=<projectId>&version=<version>', `project=${projectID}&version=${projectVersionID}`);
      
      const archive = archiver('zip', { zlib: { level: 9 } });
      const output = fs.createWriteStream(zipPath);
  
      logger.info(`[${directory}/${fileName}/generateManual] Archiving retrieved items for project=${projectID} & version=${projectVersionID}`);
      
      archive.pipe(output);
      archive.append(updatedDockerfile, { name: 'readme.md' });
      archive.file(`${appRoot}/assets/docker-compose.yml`, { name: 'docker-compose.yml' });
      archive.file(`${appRoot}/assets/Dockerfile`, { name: 'Dockerfile' });
      archive.file(`${appRoot}/assets/config.json`, { name: 'config.json' });
  
      logger.info(`[${directory}/${fileName}/generateManual] Archived the main files. Continue to archive model.`);
  
      const files = await fs.promises.readdir(tmpFolder);
      console.log(`Number of files in ${tmpFolder}: ${files.length}`);
  
      await Promise.all(files.map(async (file) => {
        if (path.extname(file) === '.h5') {
          const model = await fs.promises.readFile(path.join(tmpFolder, file));
          logger.info(`[${directory}/${fileName}/generateManual] Uploading model to obs`);
  
          const uploadModel = await obs.upload(model, path.join(tmpFolder, file), `model_${projectID}_${projectVersionID}`, 'application/x-hdf5');
          
          if (uploadModel.success) {
            logger.info(`[${directory}/${fileName}/generateManual] Model upload to OBS success.`);
            await obs.downloadModel(`model_${projectID}_${projectVersionID}`);
            await projectSvc.updateModelKey(projectVersionID, `model_${projectID}_${projectVersionID}`);
          }
  
          archive.file(path.join(tmpFolder, file), { name: path.join('models', file) });
        }
      }));
  
      archive.finalize();
  
      output.on('close', () => {
        if (!res.writableEnded) {
          res.download(zipPath, (downloadError) => {
            if (downloadError) {
              logger.error(`[${directory}/${fileName}/generateManual] Download error for Manual Project ${projectID}v${projectVersionID}: ${downloadError}`);
            } else {
              logger.info(`[${directory}/${fileName}/generateManual] Manual Project ${projectID}v${projectVersionID} sent for download (${zipPath})`);
            }
  
            res.end();
  
            fs.unlink(zipPath, (unlinkError) => {
              if (unlinkError) {
                logger.error(`[${directory}/${fileName}/generateManual] Error deleting generated zip file: ${unlinkError}`);
              }
            });
          });
        } else {
          logger.error(`[${directory}/${fileName}/generateManual] Response is no longer writable.`);
        }
      });
    } catch (error) {
      const errorMessage = `(Project ${projectID}v${projectVersionID}) ${messenger(filePath, 'internalError')} - ${error}`;
      logger.error(`[${directory}/${fileName}/generateManual] Error: ${errorMessage}`);
      return send(res, false, errorMessage, 500);
    }
  }
  
})
