const { join } = require('path')

const fromRoot = path => join(__dirname, '..', ...path.split('/'))

const outDir = fromRoot('dist/static')
const src = fromRoot('src')
const contentDir = fromRoot('content')

module.exports = {
  outIndexFile: join(outDir, 'index.html'),
  indexFile: join(src, 'index.pug'),
  nginxTemplate: fromRoot('docker/nginx.conf.dist'),
  nginxConfig: fromRoot('dist/nginx.conf'),
  serviceWorkerFile: join(outDir, 'worker.js'),
  jobsDir: join(contentDir, 'jobs'),
  contentFile: join(contentDir, 'content.json'),
  contentDir,
  outDir,
  src
}
