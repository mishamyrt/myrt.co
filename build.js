const { join, extname } = require('path')
const fs = require('fs')
const cheerio = require('cheerio')
const { promisify } = require('util')
const Bundler = require('parcel-bundler')
const Typograf = require('typograf')
const minify = require('html-minifier').minify

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

const minifyOptions = {
  collapseWhitespace: true,
  removeComments: true,
}

const outDir = join(__dirname, 'dist')
const indexPath = join(outDir, 'index.html')

const bundler = new Bundler(join(__dirname, 'src', 'index.pug'), {
  sourceMaps: false,
  watch: false,
  hmr: false,
  logLevel: 3,
  detailedReport: true,
  outDir
})

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
  let cssName
  let plexMonoName
  let plexSansName
  return readDir(join(__dirname, 'dist'))
    .then((files) => {
      files.forEach((file) => {
        if (extname(file) === '.css') cssName = file
        else if (/IBMPlexMono.*\.woff2/.test(file)) plexMonoName = file
        else if (/IBMPlexSans.*\.woff2/.test(file)) plexSansName = file
      })
    })
    .then(() => readFile(join(__dirname, 'docker', 'nginx.conf.dist')))
    .then((config) => {
      let configString = config.toString()
      configString = configString.replace(/{{style}}/, cssName)
      configString = configString.replace(/{{IBMPlexMono}}/, plexMonoName)
      configString = configString.replace(/{{IBMPlexSans}}/, plexSansName)
      return configString
    })
    .then((config) => writeFile(join(__dirname, 'docker', 'nginx.conf'), config))
}

bundler.on('bundled', () => {
  let files
  return unlink(indexPath)
    .then(() => getHtmlFiles())
    .then((result) => (files = result))
    .then(() => {
      const stack = []
      for (const file of files) {
        if (file.includes('.html')) {
          stack.push(improveHtml(file))
        }
      }
      return Promise.all(stack)
    })
    .then(() => buildNginxConfig())
    .then(() => process.exit(0))
})

bundler.bundle()

