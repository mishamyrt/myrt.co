const { join } = require('path')
const fs = require('fs')
const cheerio = require('cheerio')
const { promisify } = require('util')
const Bundler = require('parcel-bundler')
const Typograf = require('typograf')

const rimram = promisify(require('rimraf'))
const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const unlink = promisify(fs.unlink)

const tp = new Typograf({
  locale: ['ru', 'en-US'],
  htmlEntity: {
      type: 'name',
      onlyInvisible: true,
  },
})

const outDir = join(__dirname, 'dist')
const indexPath = join(outDir, 'index.html')

const bundler = new Bundler(join(__dirname, 'src', 'index.pug'), {
    sourceMaps: false,
    watch: false,
    hmr: false,
    outDir
})

function improveTypography (filePath) {
  return readFile(filePath)
    .then((html) => {
      const $ = cheerio.load(html, { decodeEntities: false })
      $('p').each((i, item) => {
        let paragraphHtml = $(item).html()
        paragraphHtml = tp.execute(paragraphHtml)
        $(item).html(paragraphHtml)
      })
      return $.html()
    })
    .then((html) => writeFile(filePath, html))
}

bundler.on('bundled', () => {
  let files
  readFile(indexPath)
    .then((html) => writeFile(join(outDir, 'ru', 'index.html'), html))
    .then(() => unlink(indexPath))
    .then(() => readDir(join(outDir, 'ru')))
    .then((result) => (files = result))
    .then(() => files.forEach((fileName) => {
      if (fileName.includes('.html')) {
        improveTypography(join(outDir, 'ru', fileName))
      }
    }))
})

rimram(outDir)
  .then(() => bundler.bundle())
  .then(() => process.exit(0))

