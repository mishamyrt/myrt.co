const Bundler = require('parcel-bundler')
const {
  readDir,
  unlink
} = require('./helpers')
const { parcelOptions } = require('./options')
const {
  outDir,
  outIndexFile,
  indexFile
} = require('./paths')
const {
  processHtml,
  processCss,
  processNginx
} = require('./processors')

const langs = ['ru', 'en']

const bundler = new Bundler(indexFile, parcelOptions)

const getFiles = async () => {
  const result = {
    html: [],
    css: []
  }
  for (const lang of langs) {
    const files = await readDir(`${outDir}/${lang}/`)
    for (const file of files) {
      if (file.endsWith('.html')) {
        result.html.push(`${outDir}/${lang}/${file}`)
      }
    }
  }
  const rootFiles = await readDir(outDir)
  for (const file of rootFiles) {
    if (file.endsWith('.css')) {
      result.css.push(`${outDir}/${file}`)
    }
  }
  return result
}

bundler.on('bundled', async () => {
  const files = await getFiles(outDir)
  return unlink(outIndexFile)
    .then(() => processCss(files.css))
    .then(() => processHtml(files.html))
    .then(() => processNginx())
})

bundler.bundle()
