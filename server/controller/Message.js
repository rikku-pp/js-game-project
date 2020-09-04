const Message = require('../model/Message')
const Player = require('../model/Player')
const { notifyAll } = require('../events')

const { ChatMessageMaxLength } = require('../../app/constants.json')

module.exports = {}

const postMessage = (ctx) => {
  if (typeof ctx.request.body.text !== 'string') return (ctx.status = 400) // Bad request
  if (ctx.request.body.text.length > ChatMessageMaxLength) return (ctx.status = 413) // Payload too large

  const playerUuid = ctx.request.body.playerUuid
  const counterpartUuid = Player.resolvePlayerUuid({ name: ctx.request.body.counterpartName })
  let roundIndex = Number(ctx.request.body.roundIndex)
  roundIndex = Number.isNaN(roundIndex) ? Player.getCurrentRound(playerUuid) : roundIndex
  const text = ctx.request.body.text

  const posted = Message.postMessage(playerUuid, counterpartUuid, roundIndex, text)
  if (posted) {
    ctx.status = 201 // Created
    Player.pingChat(playerUuid, posted.timestamp)
    Player.pingChat(counterpartUuid, posted.timestamp)
    notifyAll()
    return
  }
  ctx.status = 500 // Internal server error
  return
}

const getMessages = (ctx) => {
  const playerUuid = ctx.request.query.playerUuid
  const counterpartUuid = Player.resolvePlayerUuid({ name: ctx.request.query.counterpartName })
  const roundIndex = Number(ctx.request.query.roundIndex)
  let messages = Message.getAllDialogue(playerUuid, counterpartUuid)

  if (!isNaN(roundIndex)) {
    messages = messages.filter((message) => message.roundIndex === roundIndex)
  }

  if (!messages || messages.length === 0) {
    ctx.status = 204 // No content
  }

  messages = messages.map(({ text, timestamp, to, from }) => ({
    text,
    timestamp,
    to: Player.getName(to),
    from: Player.getName(from)
  }))

  ctx.response.body = messages
  return
}

module.exports = {
  postMessage,
  getMessages
}
