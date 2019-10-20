/* global self, caches, fetch */
const cacheKey = 'CACHE_KEY_VALUE'

const precacheUrls = [
  '/en/resume',
  '/ru/resume',
  '/en/',
  '/ru/'
]

const preCache = () => caches.open(cacheKey)
  .then(cache => cache.addAll(precacheUrls))
  .catch(err => console.log(err))

const clearCache = () => caches.keys()
  .then(keys => keys.filter(key => key !== cacheKey))
  .then(keys => keys.forEach(key => caches.delete(key)))
  .then(() => self.clients.claim())

const saveCache = event => caches.open(cacheKey)
  .then(cache => fetch(event.request)
    .then(response => cache.put(event.request, response.clone())
      .then(() => response)))

const getCache = event => caches.match(event.request)
  .then(cachedResponse => {
    if (cachedResponse) {
      return cachedResponse
    }
    return saveCache(event)
  })

self.addEventListener('install', (event) => {
  event.waitUntil(preCache())
})

self.addEventListener('activate', event => {
  event.waitUntil(clearCache())
})

if (process.env.NODE_ENV === 'production') {
  self.addEventListener('fetch', event => {
    event.respondWith(getCache(event))
  })
}
