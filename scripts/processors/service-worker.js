const { readFile, writeFile } = require('fs').promises
const { serviceWorkerFile } = require('../paths')

const generateKey = () => Math.random().toString(36).substring(2)

const insertCacheKey = (content) =>
  content.replace('CACHE_KEY_VALUE', generateKey())

async function processServiceWorker () {
  const serviceWorker = await readFile(serviceWorkerFile)
  return writeFile(serviceWorkerFile, insertCacheKey(serviceWorker.toString()))
}

module.exports = {
  processServiceWorker
}
