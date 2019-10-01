const posthtml = require('posthtml')
const postcss = require('postcss')
const mqpacker = require('css-mqpacker')
const minify = require('html-minifier').minify
const Typograf = require('typograf')
const { join } = require('path')

const {
  readFile,
  writeFile,
  readDir
} = require('./helpers')
const {
  minifyOptions,
  typografOptions
} = require('./options')
const { outDir } = require('./paths')

const tp = new Typograf(typografOptions)
const classes = {}
const css = {}

const processNginx = () => {
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

function htmlPlugin (tree) {
  let fileName
  tree.match({ tag: 'link', attrs: { rel: 'stylesheet' } }, cssTag => {
    fileName = cssTag.attrs.href.substr(1)
    return { tag: 'style', content: css[fileName] }
  })
  tree.match({ tag: 'p' }, i => {
    return {
      tag: 'p',
      content: tp.execute(i.content),
      ...i.attrs
    }
  })
  tree.match({ tag: 'a', attrs: { href: /^\/\w\w\/index.html$/ } }, i => {
    return {
      tag: 'a',
      content: i.content,
      attrs: {
        ...i.attrs,
        href: i.attrs.href.replace('index.html', '')
      }
    }
  })
  tree.match({ attrs: { class: true } }, i => {
    return {
      tag: i.tag,
      content: i.content,
      attrs: {
        ...i.attrs,
        class: i.attrs.class.split(' ').map(kls => {
          if (!classes[fileName][kls]) {
            process.stderr.write(`Unused class .${kls}\n`)
            process.exit(1)
          }
          return classes[fileName][kls]
        }).join(' ')
      }
    }
  })
}

const processHtmlFile = async (fileName) => {
  let html = await readFile(fileName)
  html = posthtml()
    .use(htmlPlugin)
    .process(html, {
      sync: true,
      fileName
    }).html
  html = minify(html, minifyOptions)
  return writeFile(fileName, html)
}

const A = 'a'.charCodeAt(0)
let lastUsed = -1

function cssPlugin (root) {
  const filePath = root.source.input.file.split('/')
  const fileName = filePath[filePath.length - 1]
  if (!classes[fileName]) classes[fileName] = {}
  root.walkRules(rule => {
    rule.selector = rule.selector.replace(/\.[\w_-]+/g, str => {
      const kls = str.substr(1)
      if (!classes[fileName][kls]) {
        lastUsed += 1
        if (lastUsed === 26) lastUsed -= 26 + 7 + 25
        classes[fileName][kls] = String.fromCharCode(A + lastUsed)
      }
      return '.' + classes[fileName][kls]
    })
  })
}

const processCssFile = (fileName) => {
  return readFile(fileName).then(bytes => bytes.toString())
    .then((cssFile) => {
      cssFile = postcss([cssPlugin, mqpacker]).process(
        cssFile,
        { from: fileName }
      ).css
      const filePath = fileName.split('/')
      css[filePath[filePath.length - 1]] = cssFile
      lastUsed = -1
    })
}

const processCss = (files) => {
  const tasks = []
  for (const file of files) {
    tasks.push(processCssFile(file))
  }
  return Promise.all(tasks)
}

const processHtml = (files) => {
  const tasks = []
  for (const file of files) {
    tasks.push(processHtmlFile(file))
  }
  return Promise.all(tasks)
}

module.exports = {
  processHtml,
  processCss,
  processNginx
}
