const { join } = require('path')
const Bundler = require('parcel-bundler')
const rimram = require('rimraf')

const serve = process.argv.length > 2 && process.argv[2] === '--serve'

const outDir = join(__dirname, 'dist')

const bundler = new Bundler(join(__dirname, 'src', 'index.pug'), {
    sourceMaps: serve,
    watch: !serve,
    hmr: serve,
    outDir
})

async function build () {
  rimram(outDir, async () => {
    const action = serve ? bundler.serve() : bundler.bundle()
    await action
    if (!serve) process.exit(0)
  })
}

build()
