if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/serviceworker.js').then(function(registration) {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope);

    }).catch(function(err) {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
    });
}

var CACHE_NAME = 'OOXX 2016-12-28 19:51';
var urlsToCache = [
    '/',
    '/serviceworker.js',

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
        })
    );
});
