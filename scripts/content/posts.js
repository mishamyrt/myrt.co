const marked = require('marked')
const cheerio = require('cheerio')
const { join } = require('path')
const minify = require('html-minifier').minify
const { readFile, readdir } = require('fs').promises
const { postsDir } = require('../paths.js')

const dateRegexp = /^Date: (.*)/gm
const titleRegexp = /^# (.*)/gm

const readPost = async key => {
  const content = await readFile(join(postsDir, key, 'post.md'))
  return content.toString()
}

const extractDate = markdown =>
  Date.parse(markdown.match(dateRegexp)[0].split(':')[1].trim())

const extractTitle = markdown =>
  titleRegexp.exec(markdown)[1].trim()

const relativeImage = (key, src) =>
  join('..', '..', 'content', 'posts', key, src)

const renderMarkdown = markdown =>
  minify(marked(markdown), { collapseWhitespace: true })

const relinkImages = (html, key) => {
  const $ = cheerio.load(html, { decodeEntities: false })
  $('img').each((i, item) =>
    $(item).attr('src', relativeImage(key, $(item).attr('src'))))
  return $.html()
}

const getPostKeys = async () => {
  const list = await readdir(postsDir)
  return list.filter(item => !item.startsWith('.'))
}

async function processPost (key) {
  let markdown = await readPost(key)
  markdown.match(titleRegexp)
  markdown.match(dateRegexp)
  const date = extractDate(markdown)
  const title = extractTitle(markdown)

  markdown = markdown.replace(dateRegexp, '')
  const html = relinkImages(renderMarkdown(markdown), key)
  return {
    html,
    date,
    title,
    key
  }
}

async function getPosts () {
  const keys = await getPostKeys()
  const posts = await Promise.all(keys.map(key => processPost(key)))
  const years = {}
  for (const post of posts) {
    const year = new Date(post.date).getFullYear()
    if (!years[year]) {
      years[year] = [post]
    } else {
      years[year].push(post)
    }
  }
  return Object.keys(years).map(year => ({
    posts: years[year].sort((a, b) => b.date - a.date),
    year
  })).sort((a, b) => b.year - a.year)
}

module.exports = {
  getPosts
}
