const workerURL = process.env.WORKER_URL
const request = require('request')
const appRoot = require('app-root-path')
const { path, logger } = require(`${appRoot}/src/utils/util`)
const fileName = __filename.split(path.sep).pop()
const directory = __dirname.split(path.sep).pop()
const axios = require('axios');

module.exports = {
  // preprocessData: async (projectID, projectVersionID, projectData) => {
  //   const requestOptions = {
  //     url: workerURL + '/preprocess_data',
  //     method: 'POST',
  //     json: true,
  //     body: projectData
  //   }
  //   try {
  //     return new Promise((resolve, reject) => {
  //       request(requestOptions, (error, response, body) => {
  //         if (error) {
  //           logger.error(`[${directory}/${fileName}/preprocessData] Reaching out to worker failed.`)
  //           reject(error)
  //         } else {
  //           if (body.task_id === undefined) {
  //             logger.info(`[${directory}/${fileName}/preprocessData] Worker did not accept request for project-${projectID}.${projectVersionID}. ${body.detail}`)
  //             resolve({
  //               success: false,
  //               data: body.detail
  //             })
  //           } else {
  //             logger.info(`[${directory}/${fileName}/preprocessData] Worker accepted request for project-${projectID}.${projectVersionID}. ${body.task_id}`)
  //             resolve({
  //               success: true,
  //               data: body.task_id
  //             })
  //           }
  //         }
  //       })
  //     })
  //   } catch (error) {
  //     logger.error(`[${directory}/${fileName}/preprocessData] Worker preprocessing error for project-${projectID}.${projectVersionID}: ${error}`)
  //     return {
  //       success: false,
  //       message: error
  //     }
  //   }
  // },
  preprocessData: async (projectID, projectVersionID, projectData) => {
    const requestOptions = {
      url: workerURL + '/preprocess_data',
      method: 'POST',
      json: true,
      data: projectData,
    };
  
    try {
      const response = await axios(requestOptions);
  
      if (response.data.task_id === undefined) {
        logger.info(`[${directory}/${fileName}/preprocessData] Worker did not accept request for project-${projectID}.${projectVersionID}. ${response.data.detail}`);
        return {
          success: false,
          data: response.data.detail,
        };
      } else {
        logger.info(`[${directory}/${fileName}/preprocessData] Worker accepted request for project-${projectID}.${projectVersionID}. ${response.data.task_id}`);
        return {
          success: true,
          data: response.data.task_id,
        };
      }
    } catch (error) {
      logger.error(`[${directory}/${fileName}/preprocessData] Worker preprocessing error for project-${projectID}.${projectVersionID}: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  },
  preprocessProgress: async (taskID) => {
    const requestOptions = {
      url: workerURL + '/check_preprocess_progress/' + taskID,
      method: 'GET'
    }
    try {
      return new Promise((resolve, reject) => {
        request(requestOptions, (error, response, body) => {
          if (error) {
            logger.error(`[${directory}/${fileName}/preprocessProgress] Reaching out to worker failed.`)
            reject(error)
          } else {
            if (body === undefined) {
              logger.info(`[${directory}/${fileName}/preprocessProgress] Worker did not accept request for task-${taskID}`)
              resolve({
                success: false,
                data: body.detail
              })
            } else {
              logger.info(`[${directory}/${fileName}/preprocessProgress] Worker accepted request for task-${taskID}`)
              resolve({
                success: true,
                data: JSON.parse(body)
              })
            }
          }
        })
      })
    } catch (error) {
      logger.error(`[${directory}/${fileName}/preprocessProgress] Worker preprocessing progress error for task-${taskID}: ${error}`)
      return {
        success: false,
        message: error
      }
    }
  }
}
