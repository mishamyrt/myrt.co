const { join } = require('path')

const outDir = join(__dirname, '..', 'dist', 'static')
const src = join(__dirname, '..', 'src')

module.exports = {
  outIndexFile: join(outDir, 'index.html'),
  indexFile: join(src, 'index.pug'),
  outDir,
  src
}
