const socketIO = require('socket.io')
module.exports = (server) => {
  const io = socketIO(server)
  io.on('connection', (socket) => {
    socket.emit('message', 'Connected to the server')
  })

  return io
}
