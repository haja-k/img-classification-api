function send (res, success, message, status, data = null) {
  const response = {
    success,
    message
  }
  if (data !== null) {
    response.data = data
  }
  return res.status(status).json(response)
}

module.exports = {
  send
}
