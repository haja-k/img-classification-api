const appRoot = require('app-root-path')
const { path, logger } = require(`${appRoot}/src/utils/util`)
const fileName = __filename.split(path.sep).pop()
const directory = __dirname.split(path.sep).pop()
const cors = require('cors')

/* eslint-disable */
const whitelist = new Set(['http://127.0.0.1', 'http://localhost:4000', 'http://127.0.0.1:8080', 'http://127.0.0.1:4000', 'http://172.26.93.12', 'http://172.26.93.12:8080'])
/* eslint-enable */
const corsOptions = {
  optionsSuccessStatus: 200,
  origin: function (origin, callback) {
    logger.info(`[${directory}/${fileName}/corsOptions] Request Origin: ${origin}`)
    if (!origin || whitelist.has(origin)) {
      callback(null, true)
    } else {
      logger.error(`[${directory}/${fileName}/corsOptions] CORS Error: Not allowed by CORS`)
      callback(null, false)
    }
  },
  // origin: '*',
  credentials: true,
  exposedHeaders: ['set-cookie']
}

module.exports = cors(corsOptions)
