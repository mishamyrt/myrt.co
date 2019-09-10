const { join } = require('path')
const Bundler = require('parcel-bundler')

let serve = process.argv.length > 2 && process.argv[2] === '--serve'

const bundler = new Bundler(join(__dirname, 'src', 'index.pug'), {
    sourceMaps: serve,
    watch: !serve,
    hmr: serve
})

async function build () {
  const action = serve ? bundler.serve() : bundler.bundle()
  await action
  if (!serve) process.exit(0)
}

build()
