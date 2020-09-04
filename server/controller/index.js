const AvatarController = require('./Avatar')
const PlayerController = require('./Player')
const GridController = require('./Grid')
const MessageController = require('./Message')

module.exports = {
  ...AvatarController,
  ...PlayerController,
  ...GridController,
  ...MessageController
}
