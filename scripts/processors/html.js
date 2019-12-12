const { readFile, writeFile } = require('fs').promises
const posthtml = require('posthtml')
const minify = require('html-minifier').minify
const Typograf = require('typograf')
const cheerio = require('cheerio')

const tp = new Typograf({
  locale: ['ru', 'en-US'],
  htmlEntity: {
    type: 'name',
    onlyInvisible: true
  }
})

let css
let classes

function htmlPlugin (tree) {
  let fileName
  tree.match({ tag: 'link', attrs: { rel: 'stylesheet' } }, cssTag => {
    fileName = cssTag.attrs.href.substr(1)
    return { tag: 'style', content: css[fileName] }
  })
  tree.match({ tag: 'a', attrs: { href: /^\/(.*)/ } }, i => {
    return {
      tag: 'a',
      content: i.content,
      attrs: {
        ...i.attrs,
        href: i.attrs.href
          .replace('index.html', '')
          .replace('.html', '')
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

async function processHtmlFile (fileName) {
  let html = await readFile(fileName)
  html = posthtml()
    .use(htmlPlugin)
    .process(html, {
      sync: true,
      fileName
    }).html
  const $ = cheerio.load(html, { decodeEntities: false })
  $('p').each((i, item) => {
    let paragraphHtml = $(item).html()
    paragraphHtml = tp.execute(paragraphHtml)
    $(item).html(paragraphHtml)
  })
  html = minify($.html(), {
    collapseWhitespace: true,
    removeComments: true
  })
  return writeFile(fileName, html)
}

function processHtml (files, processedCss, classReplacement) {
  css = processedCss
  classes = classReplacement
  const tasks = []
  for (const file of files) {
    tasks.push(processHtmlFile(file))
  }
  return Promise.all(tasks)
}

module.exports = {
  processHtml
}
