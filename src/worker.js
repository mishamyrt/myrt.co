const CACHE_KEY = 'CACHE_KEY_VALUE'

const PRECACHE_URLS = [
  '/en/resume',
  '/ru/resume',
  '/en/',
  '/ru/'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_KEY)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .catch((err) => {
        console.log(err)
      })
  )
})

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_KEY]
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName))
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete)
      }))
    }).then(() => self.clients.claim())
  )
})

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the CACHE_KEY cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
  // Skip cross-origin requests, like those for Google Analytics.
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse
        }

        return caches.open(CACHE_KEY).then(cache => {
          return fetch(event.request).then(response => {
            // Put a copy of the response in the CACHE_KEY cache.
            return cache.put(event.request, response.clone()).then(() => {
              return response
            })
          })
        })
      })
    )
  }
})
