const { join, extname } = require('path')
const cheerio = require('cheerio')
const Bundler = require('parcel-bundler')
const Typograf = require('typograf')
const minify = require('html-minifier').minify
const {
  readDir,
  readFile,
  writeFile,
  unlink
} = require('./fs-helpers')
const {
  parcelOptions,
  typografOptions,
  minifyOptions
} = require('./options')
const { processHtml, prepareCss } = require('./html-processor')

const tp = new Typograf(typografOptions)

const outDir = join(__dirname, '..', 'dist', 'static')
const indexPath = join(outDir, 'index.html')

const bundler = new Bundler(join(__dirname, '..', 'src', 'index.pug'), parcelOptions)

function improveHtml(filePath) {
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
    .then((html) => (html = html.replace(/index\.html/g, '')))
    .then((html) => (html = html.replace(/\.html/g, '')))
    .then((html) => (html = minify(html, minifyOptions)))
    .then((html) => writeFile(filePath, html))
}

function getHtmlFiles() {
  return Promise.all([
    readDir(join(outDir, 'ru')),
    readDir(join(outDir, 'en')),
  ]).then((files) => {
    const filePaths = []
    files[0].forEach((file) => filePaths.push(join(outDir, 'ru', file)))
    files[1].forEach((file) => filePaths.push(join(outDir, 'en', file)))
    return filePaths
  })
}

const buildNginxConfig = () => {
  let plexMonoName
  let plexSansName
  return readDir(outDir)
    .then((files) => {
      files.forEach((file) => {
        if (/IBMPlexMono.*\.woff2/.test(file)) plexMonoName = file
        else if (/IBMPlexSans.*\.woff2/.test(file)) plexSansName = file
      })
    })
    .then(() => readFile(join(__dirname, '..', 'docker', 'nginx.conf.dist')))
    .then((config) => {
      let configString = config.toString()
      configString = configString.replace(/{{IBMPlexMono}}/, plexMonoName)
      configString = configString.replace(/{{IBMPlexSans}}/, plexSansName)
      return configString
    })
    .then((config) => writeFile(join(__dirname, '..', 'dist', 'nginx.conf'), config))
}

bundler.on('bundled', () => {
  let files
  return unlink(indexPath)
    .then(() => readDir(outDir))
    .then(result => (files = result))
    .then(() => files.filter(file => file.endsWith('.css')))
    .then(async cssFiles => {
      await prepareCss(cssFiles)
      cssFiles.forEach(file => unlink(`${outDir}/${file}`))
    })
    .then(() => files.filter(file => file.endsWith('.html')))
    .then(htmlFiles => htmlFiles.forEach(file => processHtml(file)))
    .then(() => buildNginxConfig())
    .then(() => process.exit(0))
})

bundler.bundle()

