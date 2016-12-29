importScripts('/libs/serviceworker-cache-polyfill.js');

var ONLINE_CACHE_NAME = 'OOXX 2016-12-29 16:13';
var onlineCacheUrl = [
  '/',

  '/libs/angular.min.js',
  '/libs/ngStorage.min.js',
  '/libs/angular-animate.min.js',
  '/libs/angular-aria.min.js',
  '/libs/angular-messages.min.js',
  '/libs/angular-material.min.js',
  '/libs/angular-ui-router.min.js',
  '/libs/hammer.min.js',
  '/libs/gestures.min.js',
  '/libs/bundle.js',

  '/libs/angular-material.min.css',
  '/libs/style.css',
  '/libs/MaterialIcons-Regular.woff2',
  '/libs/MaterialIcons-Regular.woff',
  '/libs/MaterialIcons-Regular.ttf',

  '/libs/favicon.png',

  '/public/views/index.html',
  '/public/views/help.html',
  '/public/views/history.html',
  '/public/views/image.html',
  '/public/views/password.html',
  '/public/views/week.html',
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(ONLINE_CACHE_NAME)
    .then(function(cache) {
      console.log('Opened cache');
      return cache.addAll(onlineCacheUrl);
    })
  );
});

self.addEventListener('fetch', function(event) {
  // console.log(event.request.url);
  if (event.request.url.match(/\/api\/image\/[0-9]+$/)) {
    var id = event.request.url.match(/\/api\/image\/([0-9]+)$/)[1];
    event.respondWith(
      fetch(event.request)
      .then(function(response) {
        return response;
      }).catch(function() {
        return new Response(JSON.stringify({
          id: +id,
          url: '/libs/favicon.png'
        }));
      })
    );
  } else if (event.request.url.match(/^https:\/\/ooxx.gyteng.com\/[0-9]+$/)) {
    event.respondWith(
      fetch(event.request)
      .then(function(response) {
        return response;
      }).catch(function() {
        return fetch('/').then(function(response) {
          return response;
        });
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request)
      .then(function(response) {
          if (response) {
              return response;
          }
          return fetch(event.request);
      })
    );
  }
});
