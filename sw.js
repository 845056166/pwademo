// importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.1.0/workbox-sw.js");

// 第一次就会缓存静态资源
// 还有一个请求需要等到刷新页面之后才能缓存
// fetch事件需要等到安装完成之后，激活的时候才会触发
var cacheStorageKey = 'static-cache-v1';
var apiCache = 'apiCache-v1';
// 这个方法的参数是一个由一组相对于 origin 的 URL 组成的数组，这些 URL 就是你想缓存的资源的列表。
var cacheList=[ // 相对于 origin 的 URL 组成的数组,需要缓存的文件列表
  '/',
  'index.html',
  'main.css',
  'css/ui.css',
  'test.jpg',
  'mainifest.json',
  '/js/vue.js',
  '/js/ui.js',
  // '/images/iu.jpeg'
];
/**
 * CacheStorage 和 cache
 * 既然CacheStorage管理着所有的Cache，那主要功能无非就是增删改查：
 * caches.delete()，删除某个Cache
        .open()，打开某个Cache（打开后才能修改Cache），若没有则新建一个
        .keys()，得到所有Cache的名称
        .has()，判断某个Cache是否存在
   cache.match(requestUrl, options)，返回Promise，能得到requestUrl对应的response
        .put(requestUrl, response)，将requestUrl及其response保存在Cache里
        .delete(requestUrl)，从Cache里删除requestUrl及其response
        keys()，返回所有存在Cache的requestUrl
 **/ 
// 监听 service worker 的 install 事件
self.addEventListener('install',e => {  // install 事件，它发生在浏览器安装并注册 Service Worker 时
  // e.waitUtil 用于在安装成功之前执行一些预装逻辑
  console.log('installing');
  // 如果监听到了 service worker 已经安装成功的话，就会调用 event.waitUntil 回调函数 
  // 确保 Service Worker 不会在 waitUntil() 里面的代码执行完毕之前安装完成。

  // 因为oninstall和onactivate完成前需要一些时间，
  // service worker标准提供一个waitUntil方法，当oninstall或者onactivate触发时被调用，接受一个promise，
  // 在这个 promise被成功resolve以前，功能性事件不会分发到service worker。
  e.waitUntil(
    // 安装成功后操作 CacheStorage 缓存，使用之前需要先通过 caches.open() 打开对应缓存空间。
    caches.open(cacheStorageKey)
    .then(cache => {
      // 通过 cache 缓存对象的 addAll 方法添加 precache 缓存 静态资源缓存
      cache.addAll(cacheList);
    })
    .then(() => {
      // 不等待之前的serviceWorker失效，直接跳过执行新的，让新安装的serviceWorker立即激活
      // 当SW文件修改时，浏览器会重新安装service Worker，此时旧的serveWorker还在激活状态，需要claim来让新的serviceWorker获得控制权
      self.skipWaiting();
    })
  );
  // 直接跳过等待 进入activated
  // e.waitUntil(self.skipWaiting());
});

/**********  至此安装完成  *************/

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request).then(function(response) {
//       // 缓存里的请求，如果匹配到了
//       if (response) {
//         return response;
//       }
//       var request = event.request.clone();
//       // e.request.url 一定要带url
//       return fetch(request.url).then(function(httpRes) {
//         // 请求失败了直接返回失败的结果
//         if (!httpRes && httpRes.status !== 200) {
//           return httpRes;
//         }
//         // 请求成功了就缓存
//         var responseClone = httpRes.clone();
//         caches.open(cacheStorageKey).then(function (cache) {
//           cache.put(event.request, responseClone);
//         });
//         return httpRes;
//       })
//     })
//   )
// });
function fetchAndCache(req) {
  return fetch(req.url).then((res) => { // 请求到了，就返回请求的接口，并且更新缓存
    caches.open(apiCache).then(cache => {
      cache.put(req, res);
      console.log('接口已缓存');
    })
    console.log('在线就请求最新的接口');
    return res.clone();
    // 需要这么做是因为request和response是一个流，它只能消耗一次。因为我们已经通过缓存消耗了一次，然后发起 HTTP 请求还要再消耗一次，所以我们需要在此时克隆请求
    // Clone the request—a request is a stream and can only be consumed once.
  }).catch(() => { // 请求不到的时候就用本地的缓存返回
    return caches.match(req).then((response) => {
      console.log('离线就查找缓存');
      return response;
    })
  })
}

// on install 的优点是第二次访问即可离线，缺点是需要将需要缓存的 URL 在编译时插入到脚本中，增加代码量和降低可维护性；
// on fetch 的优点是无需更改编译过程，也不会产生额外的流量，缺点是需要多一次访问才能离线可用。
// 第一次并不会走这里,不会fetch ，只有安装成功后才能拦截fetch
self.addEventListener('fetch',function(event){ // 动态资源缓存
  if(event.request.url.endsWith('news')) { // 专门拦截接口
    console.log('拦截到请求的接口', event.request.url);
    // 接口数据应该保持最新，先请求，如果请求不到就用缓存里边的
    event.respondWith(
      fetchAndCache(event.request)
    );
    // event.respondWith(
    //   caches.match(event.request).then((response) => {
    //     if (response) {
    //       return response;
    //     }
    //     // 如果 service worker 没有返回，那就得直接请求真实远程服务
    //     var request = event.request.clone(); // 把原始请求拷过来
    //     return fetch(request.url).then(function (httpRes) {
    //         // http请求的返回已被抓到，可以处置了。
    //         // 请求失败了，直接返回失败的结果就好了。。
    //         if (!httpRes || httpRes.status !== 200) {
    //           return httpRes;
    //         }
    //         // 请求成功的话，将请求缓存起来。
    //         var responseClone = httpRes.clone();
    //         caches.open(apiCache).then(function (cache) {
    //           // 当请求的是http，这个方法会报错
    //           cache.put(event.request, responseClone);
    //         });

    //         return httpRes;
    //     });
    //   })
    // )
  } else {
    // if (event.request.url.endsWith('test.jpg')) {
    //   console.log('拦截到test文件,替换成我想要的文件');
    //   event.respondWith(
    //     caches.match('test.jpeg')
    //   )
    //   return;
    // }
    console.log('静态文件请求', event.request.url);
    if(!(event.request.url.indexOf('http') === 0)) return;
    event.respondWith(
    // 匹配请求如果匹配到就处理
      caches.match(event.request).then(function (response) {
        // 来来来，代理可以搞一些代理的事情

        // 如果 Service Worker 有自己的返回，就直接返回，减少一次 http 请求
        if (response) {
            return response;
        }
        // 如果 service worker 没有返回，那就得直接请求真实远程服务
        var request = event.request.clone(); // 把原始请求拷过来
        return fetch(request.url).then(function (httpRes) {
            // http请求的返回已被抓到，可以处置了。
            
            // 请求失败了，直接返回失败的结果就好了。。
            if (!httpRes || httpRes.status !== 200) {
              return httpRes;
            }

            // 请求成功的话，将请求缓存起来。
            var responseClone = httpRes.clone();
            caches.open(cacheStorageKey).then(function (cache) {
              cache.put(event.request, responseClone);
            });

            return httpRes;
        });
      })
    );
  }
})
// pwa 激活
// 激活事件的处理函数中，主要操作是清理旧版本的 Service Worker 脚本中使用资源。
// 激活成功后 Service Worker 可以控制页面了，但是只针对在成功注册了 Service Worker 后打开的页面。
// 也就是说，页面打开时有没有 Service Worker，决定了接下来页面的生命周期内受不受 Service Worker 控制。
self.addEventListener('activate',function(e){
  console.log('activate yess');
  // console.log(caches.keys());
  e.waitUntil(
    //获取所有cache名称
    caches.keys().then(cacheNames => {
      return Promise.all(
        // 获取所有不同于当前版本名称cache下的内容
        cacheNames.filter(cacheNames => {
          return cacheNames !== 'static-cache-v1'
        }).map(cacheNames => {
          return caches.delete(cacheNames)
        })
      )
    },
    // self.clients.claim()
    ).then(() => {
      console.log('to claim');
      console.log('service Worker now is ready to handle fetch events');
      // 允许一个激活的 service worker 将自己设置为其scope 内所有 clients 的 controller . 
      return self.clients.claim();
    })
  )
})

