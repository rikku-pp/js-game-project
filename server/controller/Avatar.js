const { suggest4Avatars, getAvatar, getThemes } = require('../avatar-utils')

const getAvatars = async (ctx) => {
  try {
    if (ctx.request.query.names) {
      const names = ctx.request.query.names.split(',')
      const avatars = names.map((name) => ({
        name,
        dataUrl: getAvatar(name)
      }))

      ctx.response.body = avatars
      ctx.response.status = 200
      return
    }
  } catch (e) {
    console.log(e)
  }
  ctx.response.status = 400
  ctx.response.body = { name: '', dataUrl: '' }
  return
}

const getAvatarThemes = async (ctx) => {
  try {
    ctx.body = getThemes()
  } catch (e) {
    console.warn(e)
    ctx.status = 500
    ctx.response.message = 'Bug in avatar background themes'
  }
}

const getSuggestions = async (ctx) =>
  (ctx.body = { suggestions: suggest4Avatars() })

module.exports = {
  getAvatarThemes,
  getAvatars,
  getSuggestions
}
