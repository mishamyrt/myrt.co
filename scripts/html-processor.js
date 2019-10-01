const posthtml = require('posthtml')
const postcss = require('postcss')
const mqpacker = require('css-mqpacker')
const {
  readFile,
  writeFile
} = require('./fs-helpers')
const {
  outDir
} = require('./paths')

const classes = {}
const css = {}

function htmlPlugin (tree) {
  let fileName
  tree.match({ tag: 'link', attrs: { rel: 'stylesheet' } }, (test) => {
    fileName = test.attrs.href.substr(1)
    return { tag: 'style', content: css[fileName] }
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
            process.stderr.write(`Unused class .${ kls }\n`)
            process.exit(1)
          }
          return classes[fileName][kls]
        }).join(' ')
      }
    }
  })
}

const A = 'a'.charCodeAt(0)
let lastUsed = -1

function cssPlugin (root) {
  const filePath = root.source.input.file.split('/')
  const fileName = filePath[filePath.length - 1]
  if (!classes[fileName]) classes[fileName] = {}
  root.walkRules(rule => {
    rule.selector = rule.selector.replace(/\.[\w_-]+/g, str => {
      let kls = str.substr(1)
      if (!classes[fileName][kls]) {
        lastUsed += 1
        if (lastUsed === 26) lastUsed -= 26 + 7 + 25
        classes[fileName][kls] = String.fromCharCode(A + lastUsed)
      }
      return '.' + classes[fileName][kls]
    })
  })
}

const prepareCss = async (cssFiles) => {
  for (file of cssFiles) {
    const filePath = `${outDir}/${file}`
    let cssFile = await readFile(filePath).then(bytes => bytes.toString())
    cssFile = postcss([cssPlugin, mqpacker]).process(
      cssFile,
      { from: filePath}
    ).css
    css[file] = cssFile
    lastUsed = -1
  }
}

const processHtml = async (fileName) => {
  console.log(fileName)
  let html = await readFile(fileName)
  console.log('noerr')
  return await writeFile(fileName, posthtml()
    .use(htmlPlugin)
    .process(html, {
      sync: true,
      fileName
    }).html)
}

module.exports = {
  processHtml,
  prepareCss
}
