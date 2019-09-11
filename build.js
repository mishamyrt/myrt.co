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

const tp = new Typograf({
  locale: ['ru', 'en-US'],
  htmlEntity: {
      type: 'name',
      onlyInvisible: true,
  },
})

const serve = process.argv.length > 2 && process.argv[2] === '--serve'

const outDir = join(__dirname, 'dist')

const bundler = new Bundler(join(__dirname, 'src', 'index.pug'), {
    sourceMaps: serve,
    watch: serve,
    hmr: serve,
    outDir
})

function build () {
  return (serve ? bundler.serve() : bundler.bundle())
}

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

bundler.on('bundled', (bundle) => {
  let files
  const indexPath = join(outDir, 'index.html')
  readDir(join(outDir, 'ru'))
    .then((result) => (files = result))
    .then(() => files.forEach((fileName) => fileName.includes('.html') ?
      improveTypography(join(outDir, 'ru', fileName)) : null))
  !serve && readFile(indexPath)
    .then((html) => writeFile(indexPath, html.toString().replace(/index.html/g, '')))
})

rimram(outDir)
  .then(() => build())
  .then(() => !serve ? process.exit(0) : null)

