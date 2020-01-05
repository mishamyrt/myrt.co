const content = require('../content/content.json')

const keyToUrl = key => `/pages/${key}/${key}.pug`

module.exports = {
  locals: {
    menuContext: {
      isActive: (key, url) => url.includes(key),
      isChild: url => url.split('/').length > 2,
      items: [
        { title: 'Blog', key: 'blog' },
        { title: 'Resume', key: 'resume' }
      ].map(item => {
        item.url = keyToUrl(item.key)
        return item
      })
    },
    ...content
  }
}
