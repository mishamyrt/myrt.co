const Bundler = require('parcel-bundler')
const { writeFile } = require('fs').promises
const { getPosts } = require('./content/posts.js')
const { getJobs } = require('./content/jobs.js')
const {
  outDir,
  indexFile,
  contentFile
} = require('./paths')

const PRODUCTION = process.env.PRODUCTION === 'true'

const wrapToPost = html =>
`extends ../blog-post.pug

block content
  ${html}
`

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

async function processPosts (posts) {
  for (let i = 0; i < posts.length; i++) {
    for (let j = 0; j < posts[i].posts.length; j++) {
      await writeFile(
        `src/articles/${posts[i].posts[j].key}.pug`,
        wrapToPost(posts[i].posts[j].html)
      )
      posts[i].posts[j].month = new Date(posts[i].posts[j].date)
        .toLocaleString('default', { month: 'long' })
      delete posts[i].posts[j].html
    }
  }
  return posts
}

bundler.on('bundled', async () => {})

async function build () {
  const content = {
    jobs: await getJobs(),
    posts: await processPosts(await getPosts())
  }
  await writeFile(contentFile, JSON.stringify(content))
  bundler.serve()
}

build()
