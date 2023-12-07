const appRoot = require('app-root-path')
const winston = require('winston')
const { format, transports } = winston

const timezoned = () => {
  return new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kuala_Lumpur'
  })
}

require('winston-daily-rotate-file')

const transport = new winston.transports.DailyRotateFile({
  filename: `${appRoot}/logs/requests/%DATE%.log`,
  datePattern: 'YYYY-MM-DD-HH',
  handleExceptions: true,
  zippedArchive: false,
  maxSize: '1g',
  level: 'info',
  format: format.combine(
    format.colorize(),
    format.timestamp({ format: timezoned }),
    format.printf((info) => {
      return `${info.level}: ${info.timestamp} - message: ${info.message}`
    })
  )
})

const options = {
  console: {
    level: 'debug',
    handleExceptions: true,
    format: format.combine(
      format.colorize(),
      format.timestamp({ format: timezoned }),
      format.printf((info) => {
        return `${info.level}: ${info.timestamp} - message: ${info.message}`
      })
    )
  }
}

const logger = winston.createLogger({
  transports: [transport, new transports.Console(options.console)],
  exitOnError: false
})

logger.stream = {
  write: function (message, encoding) {
    logger.info(message)
  }
}

module.exports = logger
