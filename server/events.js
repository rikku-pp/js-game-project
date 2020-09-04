const { PassThrough } = require('stream')
const { getPlayerObjects, getPlayerConnection, connectPlayer } = require('./model/Player')

const eventStreamFormat = (event, data) => `event: ${event}\ndata: ${data}\n\n`

const notifyAll = () => {
  const players = getPlayerObjects()
  const playerConnection = getPlayerConnection()

  for (name in playerConnection) {
    playerConnection[name].res.write(eventStreamFormat('message', JSON.stringify(players)))
  }
}

const register = async (ctx) => {
  const stream = new PassThrough()

  ctx.type = 'text/event-stream'
  ctx.body = stream
  ctx.req.socket.setTimeout(2147483647) // HTTP Keep-Alive
  ctx.res.write('\n')

  if (ctx.request.headers['last-event-id']) {
    console.log('RECONNECTION ATTEMPT', ctx.request.query, ctx.request.body)
  }

  try {
    const { name, uuid } = ctx.request.query

    const connected = connectPlayer(name, uuid, ctx)
    !connected && console.log('Player could not connect')

    if (connected) {
      notifyAll()
    }
  } catch (error) {
    console.warn('/events ', error)
  }
}

const unregister = async (name, reason) => {
  const ctx = getPlayerConnection()[name]
  ctx.res.write(eventStreamFormat('message', reason))
  ctx.res.end()
  return
}

module.exports.register = register
module.exports.unregister = unregister
module.exports.notifyAll = notifyAll
