const { basename, extname, join } = require('path')
const Bundler = require('parcel-bundler')

const bundler = new Bundler(join(__dirname, 'src', 'index.pug'), {
    sourceMaps: false
})

async function build () {
    await bundler.serve()
}

build()