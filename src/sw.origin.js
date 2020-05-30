let ASSETS_ARRAY

let HTML = 'index.html'
// ASSETS_ARRAY.forEach(item => {
//   if( item.url.search(/\.html/) > -1 ){
//     HTML = item.url
//   }
// });
//
let ASSETS_URLS = []
// ASSETS_ARRAY.forEach( item => {
//   ASSETS_URLS.push(item.url)
// })

self.addEventListener('install', event => {

  // caching assets before installing
  console.log('SW: installed');
  event.waitUntil(
    caches.open('sw-test').then( cache => {
      return cache.keys().then( keys => {
        return fetch('http://localhost:3000/manifest.json').then( response => {
          return response.json().then( manifest => {
            ASSETS_ARRAY = manifest
          })
        })
      })
    })
  )

  self.skipWaiting()

})

self.addEventListener('activate', event => {
  console.log('SW: activated');
  console.log(ASSETS_ARRAY);
  // delete unneeded caches
  event.waitUntil(
    caches.open('sw-test').then( cache => {
      return cache.keys().then( keys => {
        return inCacheButManifest(ASSETS_URLS, keys).then( oldCaches => {
          return oldCaches.forEach( oldCache => {
            return cache.delete(oldCache).then( () => {
              console.log('SW: delete ' + oldCache);
            })
          })
        })
      })
    })
  )

  self.clients.claim()
})

self.addEventListener('fetch', event => {
  let url =
    event.request.url === 'http://localhost:3000/' ?
    event.request.url + HTML : event.request

  event.respondWith(
    caches.open('sw-test').then( cache => {
      return cache.match(url).then( response => {
        console.log(
          'SW: ' + event.request.url.slice(21) , response ? '--- cache' : '--- fetched'
        )
        return response || fetch(url)
      })
    })
  )


})


function inCacheButManifest(manifestList, cacheList){
  return new Promise((resolve, reject) => {
    let arr = []

        cacheList.forEach(cacheEntry => {
          let url = cacheEntry.url.slice(22)
          if(!manifestList.includes(url)){
            arr.push(url)
          }
        });
    resolve(arr)
  })

}

function inManifestButCache(manifestList, cacheList){
  return new Promise( (resolve, reject) => {
    let arr = []
        let cacheUrlList = []
        cacheList.forEach( (item, i) => {
          cacheUrlList[i] = item.url.slice(22)
        })
        manifestList.forEach(manifestEntry => {
          if(!cacheUrlList.includes(manifestEntry)){
            arr.push(manifestEntry)
          }
    })

    resolve(arr)
  })
}
