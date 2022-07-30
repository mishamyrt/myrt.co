// @ts-check
import * as cheerio from 'cheerio'
import { readFile, writeFile } from 'fs/promises'
import Typograf from 'typograf'

const defaultOptions = {
  locale: ['ru', 'en-US']
}

/**
 * Applies typography transformation
 * @param {string} path - HTML file location
 * @param {typograf.Typograf} tp - Typograf instance
 */
async function fixHtmlTypography(path, tp) {
  const content = await readFile(path)
  const $ = cheerio.load(content)
  $('p, h1, h2, h3').each((i, node) => {
    const el = $(node)
    const html = el.html()
    if (!html) {
      return
    }
    el.html(
      tp.execute(html)
    )
  })
  await writeFile(path, $.html())
}

/**
 * Typograf Astro integration constructor
 * @param {typograf.Options} options - Typograf options
 * @returns {import("astro").AstroIntegration}
 */
export default function (options = defaultOptions) {
  const tp = new Typograf(options)
  return {
    name: 'typograf',
    hooks: {
      'astro:build:done': async ({ routes }) => {
        await Promise.all(routes
          .map(r => r.distURL?.pathname || '')
          .filter(i => i.endsWith('.html'))
          .map(path => fixHtmlTypography(path, tp))
        )
      }
    }
  }
}
