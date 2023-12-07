const fancyConsoleLog = (message) => {
  const length = message.length
  const topBorder = '\x1b[36m╔' + '═'.repeat(length + 2) + '╗\x1b[0m'
  const middleBorder = '\x1b[36m║\x1b[0m \x1b[33m' + message + '\x1b[0m \x1b[36m║\x1b[0m'
  const bottomBorder = '\x1b[36m╚' + '═'.repeat(length + 2) + '╝\x1b[0m'

  console.log(topBorder)
  console.log(middleBorder)
  console.log(bottomBorder)
}

module.exports = fancyConsoleLog
