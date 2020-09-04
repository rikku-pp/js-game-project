const {
  avatars,
  avatarCategories,
  themes,
  themeCategories,
  themeCategoryIconData,
  themeIconData
} = require('./avatars.json')

const randomChoice = (avatarCategoryName) => {
  const avatarCategory = avatarCategories[avatarCategoryName]
  const randomAvatarIndex = Math.floor(
    Math.random() * Math.floor(avatarCategory.length)
  )
  const avatarName = avatarCategory[randomAvatarIndex]

  const randomThemeIndex = Math.floor(
    Math.random() * Math.floor(Object.keys(themes).length)
  )
  const themeName = Object.keys(themes)[randomThemeIndex]

  return {
    name: avatarName,
    dataUrl: avatars[avatarName] || '',
    bgTheme: { name: themeName, colors: themes[themeName] } || ''
  }
}

module.exports = {
  suggest4Avatars: () => {
    return [
      randomChoice('cute'),
      randomChoice('cool'),
      randomChoice('goofy'),
      randomChoice('dorky')
    ]
  },
  getAvatar: (name) => avatars[name] || '',
  getThemes: () => ({
    themes,
    themeCategories,
    themeCategoryIconData,
    themeIconData
  })
}
