const {
  outDir
} = require('./paths')

const parcelOptions = {
  sourceMaps: false,
  watch: false,
  hmr: false,
  minify: true,
  contentHash: false,
  scopeHoist: true,
  detailedReport: true,
  outDir
}

const typografOptions = {
  locale: ['ru', 'en-US'],
  htmlEntity: {
    type: 'name',
    onlyInvisible: true
  }
}

const minifyOptions = {
  collapseWhitespace: true,
  removeComments: true
}

module.exports = {
  parcelOptions,
  typografOptions,
  minifyOptions
}
