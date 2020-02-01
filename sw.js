var cacheStorageKey = 'minimal-pwa-8';
// 这个方法的参数是一个由一组相对于 origin 的 URL 组成的数组，这些 URL 就是你想缓存的资源的列表。
var cacheList=[ // 相对于 origin 的 URL 组成的数组,需要缓存的文件列表
  'index.html',
  'main.css',
  'test.jpg',
  'mainifest.json',
  'https://unpkg.com/vue',
  'https://huidoo.com.cn:8899/news', // 请求
];

// 监听 service worker 的 install 事件
self.addEventListener('install',e => {  // install 事件，它发生在浏览器安装并注册 Service Worker 时
  // e.waitUtil 用于在安装成功之前执行一些预装逻辑
  console.log('installed');
  // 如果监听到了 service worker 已经安装成功的话，就会调用 event.waitUntil 回调函数 
  // 确保 Service Worker 不会在 waitUntil() 里面的代码执行完毕之前安装完成。
  e.waitUntil(
    // 安装成功后操作 CacheStorage 缓存，使用之前需要先通过 caches.open() 打开对应缓存空间。
    caches.open(cacheStorageKey)
    .then(cache => {
      // 通过 cache 缓存对象的 addAll 方法添加 precache 缓存 静态资源缓存
      cache.addAll(cacheList);
    })
    .then(() => self.skipWaiting())
  );
  // 直接跳过等待 进入activated
  // e.waitUntil(self.skipWaiting());
});
/**********  至此安装完成  *************/


// on install 的优点是第二次访问即可离线，缺点是需要将需要缓存的 URL 在编译时插入到脚本中，增加代码量和降低可维护性；
// on fetch 的优点是无需更改编译过程，也不会产生额外的流量，缺点是需要多一次访问才能离线可用。
// 第一次并不会走这里,不会fetch ，只有安装成功后才能拦截fetch
self.addEventListener('fetch',function(event){ // 动态资源缓存
  console.log('请求的资源', event.request);
  // if(e.request.url.endsWith('news')) { // 专门拦截接口
  //   console.log('拦截到请求的接口');
  //   e.respondWith(
  //     new Promise(() => {
  //       return {
  //         title: 'pwa api cache',
  //         list: [
  //           { title: '黑恶化' },
  //           { title: '呵呵' },
  //           { title: '呼呼' },
  //           { title: '哼哼' }
  //         ]
  //       };
  //     })
  //   )
  // } else {
    // e.respondWith(
    //   caches.match(e.request).then(function(response){
    //     if(response != null){
    //       return response
    //     }
    //     return fetch(e.request.url)
    //   })
    // )
    // 匹配请求如果匹配到就处理
    caches.match(event.request).then(function (response) {
      // 来来来，代理可以搞一些代理的事情

      // 如果 Service Worker 有自己的返回，就直接返回，减少一次 http 请求
      if (response) {
          return response;
      }

      // 如果 service worker 没有返回，那就得直接请求真实远程服务
      var request = event.request.clone(); // 把原始请求拷过来
      return fetch(request).then(function (httpRes) {

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
  // }
})
// pwa 激活
self.addEventListener('activated',function(e){
  console.log('activated');
  console.log(caches.keys());
  // e.waitUntil(
  //   //获取所有cache名称
  //   caches.keys().then(cacheNames => {
  //     return Promise.all(
  //       // 获取所有不同于当前版本名称cache下的内容
  //       cacheNames.filter(cacheNames => {
  //         return cacheNames !== cacheStorageKey
  //       }).map(cacheNames => {
  //         return caches.delete(cacheNames)
  //       })
  //     )
  //   }).then(() => {
  //     return self.clients.claim()
  //   })
  // )
})
