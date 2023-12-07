function updateActivityTimestamp (req, res, next) {
  req.session.lastActivity = new Date()
  next()
}

module.exports = updateActivityTimestamp
