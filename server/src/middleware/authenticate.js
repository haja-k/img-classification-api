function authenticate (req, res, next) {
  if (!req.session || !req.session.user || !req.session.roleID) {
    const errorResponse = {
      success: false,
      message: 'Access denied: User is not logged in.'
    }

    res.status(403).json(errorResponse)
  } else {
    next()
  }
}

module.exports = authenticate
