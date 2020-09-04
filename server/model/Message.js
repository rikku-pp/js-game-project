module.exports = {}

let messages = []

const getDialogue = (playerUuid, counterpartUuid, roundIndex) => {
  messages.filter(
    (message) =>
      message.roundIndex === roundIndex &&
      ((message.to === playerUuid && message.from === counterpartUuid) ||
        (message.from === playerUuid && message.to === counterpartUuid))
  )
}

const getAllDialogue = (playerUuid, counterpartUuid) => {
  return messages.filter(
    (message) =>
      (message.to === playerUuid && message.from === counterpartUuid) ||
      (message.from === playerUuid && message.to === counterpartUuid)
  )
}

const postMessage = (playerUuid, counterpartUuid, roundIndex, text) => {
  const timestamp = Date.now()
  messages.push({ timestamp, from: playerUuid, to: counterpartUuid, roundIndex, text })
  return messages.find((message) => message.timestamp === timestamp)
}

const deleteAllMessages = () => (messages = [])

module.exports = {
  getDialogue,
  getAllDialogue,
  postMessage,
  deleteAllMessages
}
