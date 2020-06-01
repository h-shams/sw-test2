self.addEventListener('install', event => {

  console.log('SW: installed');
  event.waitUntil(cacheNewFiles())

})

self.addEventListener('activate', event => {
  console.log('SW: activated');
})

self.addEventListener('fetch', event => {
  if(event.request.url === 'http://localhost:3000/CMD/DELETE_OLD_CACHES'){
    console.log('SW: CMD / DELETE_OLD_CACHES');
    deleteOldCaches().then( (res) => {
      event.respondWith(new Response(
        JSON.stringify({deleted: res}),
        {status: 200}
      ))
    })
  }else{

    let url
    if(event.request.url === 'http://localhost:3000/'){
      console.log(' ');
      url = 'http://localhost:3000/index.html'
    }else{
      url = event.request.url
    }


    event.respondWith(
      caches.open('sw-test').then(cache => {
        return cache.match(url).then( response => {
          console.log(
            'SW: GET ' + url.slice(22) , response ? '--- cache' : '--- fetched'
          )
          return response || fetch(url)
        })
      })
    )


    if(url === 'http://localhost:3000/index.html'){
      event.waitUntil(
        setTimeout(() => {
          cacheNewFiles(true)
        }, 2000)
      )
    }
  }
})

function cacheNewFiles(cacheManifest = false){
  return caches.open('sw-test').then( cache => {
    return fetch('http://localhost:3000/assets.json').then( response => {
      return response.json().then( manifest => {
        return cache.match('assets.json').then( res => {
          return res.json().then( oldManifest => {
            return inManifestButCache(manifest, oldManifest).then( comp => {
              return cache.addAll(comp).then( () => {
                if(cacheManifest){
                  cache.add('assets.json').then( () => {
                    console.log("SW: cached assets.json");
                  })
                }
                console.log('SW: folowing items are cached');
                console.log(comp);
              })
            })
          })
        }).catch( err => {
          console.log(err)
          cache.add('assets.json').then( () => {
            console.log("SW: cached assets.json");
          })
          manifest.forEach( manifestEntry => {
            cache.add(manifestEntry.url).then( () => {
              console.log("SW: cached " + manifestEntry.url);
            })
          })
        })
      })
    })
  })
}

function deleteOldCaches(){
  return new Promise( (resolve, reject) => {
    let a = []
    caches.open('sw-test').then( cache => {
      cache.keys().then( keys => {
        cache.match('assets.json').then( res => {
          res.json().then( manifest => {
            manifest.push({url:'assets.json'})
            inCacheButManifest(manifest, keys).then( comp => {
              comp.forEach( oldCache => {
                cache.delete(oldCache)
              })
              a = comp
              console.log('SW: folowing item Deleted ' + comp);
            })
          })
        }).catch( err => {
          console.log(err)
          console.log('SW: there is no "assets.json" in cache;');
        })
      })
    })
    resolve(a)
  })
}

function inCacheButManifest(manifestList, cacheList){
 return new Promise( (resolve, reject) => {

   if(!(manifestList && cacheList)){
     reject('error: two argunment must passed')
   }

   let arr = []
   cacheList.forEach( cacheEntry => {
     let isFound = null
     manifestList.forEach( manifestEntry => {
       if(cacheEntry.url.slice(22) === manifestEntry.url){
         isFound = true
       }
     })
     if(isFound === null){
       arr.push(cacheEntry.url.split(22))
     }
   })
   resolve(arr)
 })
}

/*
caches.open('sw-test').then( cache => {
  cache.keys().then( keys => {
    console.log(keys)
    console.log(manifest)
    inCacheButManifest(manifest, keys).then(res => {
      console.log(res)
    }).catch( err => {
      console.log(err)
    })
  })
})
*/

function inManifestButCache(manifestList, cacheList){
 return new Promise( (resolve, reject) => {

   if(!(manifestList && cacheList)){
     reject('error: two argunment must passed')
   }

   let arr = []
   manifestList.forEach( manifestEntry => {
     let isFound = null
     cacheList.forEach( cacheEntry => {
       if(cacheEntry.url === manifestEntry.url){
         if(cacheEntry.revision === manifestEntry.revision){
           isFound = true
         }else{
           isFound = 'changed'
         }
       }
     });
     if(isFound === null){
       arr.push(manifestEntry.url)
     }else if(isFound === 'changed'){
       arr.push(manifestEntry.url)
     }else{
     }
   })
   resolve(arr)
 })
}
