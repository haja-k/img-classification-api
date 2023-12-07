function restrictAccess (allowedRoleIDs) {
  return (req, res, next) => {
    if (!allowedRoleIDs.includes(req.session.roleID)) {
      const errorResponse = {
        success: false,
        message: 'Access denied: Unauthorized user.'
      }

      res.status(403).json(errorResponse)
    } else {
      next()
    }
  }
}

module.exports = restrictAccess
