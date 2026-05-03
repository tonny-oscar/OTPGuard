const CACHE = 'otpguard-v1'
const PRECACHE = ['/', '/index.html']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ))
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  // Only handle GET requests; skip API calls and chrome-extension
  if (e.request.method !== 'GET') return
  if (e.request.url.includes('/api/')) return
  if (!e.request.url.startsWith('http')) return

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Only cache valid responses
        if (res && res.status === 200 && res.type !== 'opaque') {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => {
        return caches.match(e.request).then(cached => {
          // Return cached version or a fallback for navigation requests
          if (cached) return cached
          if (e.request.mode === 'navigate') {
            return caches.match('/index.html')
          }
          // Return a proper empty response instead of undefined
          return new Response('', { status: 408, statusText: 'Offline' })
        })
      })
  )
})
