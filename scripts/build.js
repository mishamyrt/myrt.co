const Bundler = require('parcel-bundler')
const { writeFile } = require('fs').promises
const { getJobs } = require('./content/jobs.js')
const {
  outDir,
  indexFile,
  contentFile
} = require('./paths')

const PRODUCTION = process.env.PRODUCTION === 'true'

const bundler = new Bundler(indexFile, {
  sourceMaps: !PRODUCTION,
  watch: !PRODUCTION,
  hmr: false,
  minify: !PRODUCTION,
  contentHash: false,
  scopeHoist: true,
  detailedReport: true,
  serve: true,
  outDir
})

bundler.on('bundled', async () => {
})

async function build () {
  const content = {
    jobs: await getJobs()
  }
  await writeFile(contentFile, JSON.stringify(content))
  console.log(content.jobs)
  bundler.serve()
}

build()
