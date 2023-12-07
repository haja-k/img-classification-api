const winston = require('winston')
const logFileName = new Date().toLocaleDateString().replace(/\D/g, '_')

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
}

const timezoned = () => {
  return new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kuala_Lumpur'
  })
}

const format = winston.format.combine(
  winston.format.timestamp({ format: timezoned }),
  winston.format.printf((info) => {
    return ` ${info.timestamp} - ${info.level}: ${info.message}`
  })
)

const logError = new winston.transports.File({
  filename: `logs/error/${logFileName}.log`,
  level: 'error'
})

const logCombined = new winston.transports.File({
  filename: `logs/all/${logFileName}.log`
})

const debugging = new winston.transports.Console()

const logger = winston.createLogger({
  levels,
  format,
  transports: [debugging, logError, logCombined]
})

module.exports = logger
