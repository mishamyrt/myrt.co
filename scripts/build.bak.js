const Bundler = require('parcel-bundler')
const { readdir, unlink } = require('fs').promises
const {
  outDir,
  outIndexFile,
  indexFile
} = require('./paths')
const { processHtml } = require('./processors/html')
const { processCss } = require('./processors/css')
const { processNginx } = require('./processors/nginx')
const { processServiceWorker } = require('./processors/service-worker')

const langs = ['ru', 'en']

const bundler = new Bundler(indexFile, {
  sourceMaps: false,
  watch: false,
  hmr: false,
  minify: true,
  contentHash: false,
  scopeHoist: true,
  detailedReport: true,
  outDir
})

const getAssets = async () => {
  const result = {
    html: [],
    css: []
  }
  for (const lang of langs) {
    const files = await readdir(`${outDir}/${lang}/`)
    for (const file of files) {
      if (file.endsWith('.html')) {
        result.html.push(`${outDir}/${lang}/${file}`)
      }
    }
  }
  const rootFiles = await readdir(outDir)
  for (const file of rootFiles) {
    if (file.endsWith('.css')) {
      result.css.push(`${outDir}/${file}`)
    }
  }
  return result
}

bundler.on('bundled', async () => {
  const files = await getAssets(outDir)
  await unlink(outIndexFile)
  const [css, classes] = await processCss(files.css)
  await processHtml(files.html, css, classes)
  await processNginx()
  await processServiceWorker()
})

bundler.bundle()
