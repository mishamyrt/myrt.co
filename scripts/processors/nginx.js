const { readFile, writeFile, readdir } = require('fs').promises
const { outDir, nginxTemplate, nginxConfig } = require('../paths')

const monoRegexp = /IBMPlexMono.*\.woff2/
const sansRegexp = /IBMPlexSans.*\.woff2/

const findFonts = files => {
  let mono, sans
  files.forEach((file) => {
    if (monoRegexp.test(file)) mono = file
    else if (sansRegexp.test(file)) sans = file
  })
  return [mono, sans]
}

const includeFonts = (template, [mono, sans]) => template
  .replace(/{{IBMPlexMono}}/, mono)
  .replace(/{{IBMPlexSans}}/, sans)

async function processNginx () {
  const files = await readdir(outDir)
  const fonts = findFonts(files)
  const configTemplate = await readFile(nginxTemplate)
  return writeFile(nginxConfig, includeFonts(configTemplate.toString(), fonts))
}

module.exports = {
  processNginx
}
