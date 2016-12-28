if ('serviceWorker' in navigator) {
navigator.serviceWorker.register('/testscript.js').then(function(registration) {
// Registration was successful
console.log('ServiceWorker registration successful with scope: ',    registration.scope);

}).catch(function(err) {
// registration failed :(
console.log('ServiceWorker registration failed: ', err);
});
}

var CACHE_NAME = 'my-site-cache-v2';
var urlsToCache = [
  '/test',
  '/testscript.js',
  '/libs/angular.min.js',
  '/libs/ngStorage.min.js',
];

// Set the callback for the install step
self.addEventListener('install', function(event) {
  console.log(event);
  event.waitUntil(
  caches.open(CACHE_NAME)
    .then(function(cache) {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {
  console.log(event);
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request);
      }
    )
  );
});
