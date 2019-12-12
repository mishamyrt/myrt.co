const { readFile } = require('fs').promises
const postcss = require('postcss')
const mqpacker = require('css-mqpacker')

const varRegexp = /var\((.*)\)/
const propertyRegexp = /--[\w_-]+/g
const classRegexp = /\.[\w_-]+/g
const A = 'a'.charCodeAt(0)
const charShift = 26 + 7 + 25

const classes = {}
const properties = {}
const css = {}

let classShift = -1
let propertyShift = -1

const getLastPart = path => path.split('/').slice(-1)

const getFileName = postcssRoot =>
  getLastPart(postcssRoot.source.input.file)

const insureField = (target, property) =>
  (!target[property] ? (target[property] = {}) : true)

const safeIncrease = code =>
  ++code === 26 ? code - charShift : code

const generatePropertyName = () => {
  propertyShift = safeIncrease(propertyShift)
  return `--${String.fromCharCode(A + propertyShift)}`
}

const generateClassName = () => {
  classShift = safeIncrease(classShift)
  return String.fromCharCode(A + classShift)
}

function uglifyCustomProperties (root) {
  const fileName = getFileName(root)
  insureField(properties, fileName)
  root.walkDecls(decl => {
    if (decl.prop.startsWith('--')) {
      if (!properties[fileName][decl.prop]) {
        const propertyName = generatePropertyName()
        properties[fileName][decl.prop] = propertyName
        decl.prop = propertyName
      } else {
        decl.prop = properties[fileName][decl.prop]
      }
    }
    if (decl.value.includes('var(--')) {
      const property = decl.value.match(varRegexp, '$1')[1]
      decl.value = decl.value.replace(propertyRegexp, properties[fileName][property])
    }
  })
}

function cssPlugin (root) {
  const fileName = getFileName(root)
  insureField(classes, fileName)
  root.walkRules(rule => {
    rule.selector = rule.selector.replace(classRegexp, str => {
      const className = str.substr(1)
      if (!classes[fileName][className]) {
        classes[fileName][className] = generateClassName()
      }
      return '.' + classes[fileName][className]
    })
  })
}

const processCssFile = async fileName => {
  const cssFile = await readFile(fileName)
  const cssContent = postcss(
    [cssPlugin, uglifyCustomProperties, mqpacker]
  ).process(
    cssFile.toString(),
    { from: fileName }
  ).css
  css[getLastPart(fileName)] = cssContent
  propertyShift = -1
  classShift = -1
}

async function processCss (files) {
  const tasks = []
  for (const file of files) {
    tasks.push(processCssFile(file))
  }
  await Promise.all(tasks)
  return [css, classes]
}

module.exports = {
  processCss
}
