// sw.js
const WORKER_URL = 'https://car.qyfy.kdns.fr'; // 你的 Worker 地址，末尾不要带 /

// ========== 关键：让 SW 立即激活并接管页面 ==========
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ========== 代理逻辑 ==========
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 只代理你的 GitHub Pages 同源请求
  if (url.origin === self.location.origin) {

    // 构建请求配置
    const init = {
      method: event.request.method,
      headers: event.request.headers,
      redirect: 'follow'
    };

    // GET / HEAD 请求不能带 body
    if (event.request.method !== 'GET' && event.request.method !== 'HEAD') {
      init.body = event.request.body;
    }

    // 去掉 GitHub Pages 的子目录前缀（/cf-car），让 Worker 收到干净的路径
    const cleanPathname = url.pathname.replace(/^\/cf-car/, '') || '/';
    const targetUrl = new URL(WORKER_URL + cleanPathname + url.search);

    event.respondWith(
      fetch(targetUrl.toString(), init)
        .catch((error) => {
          console.warn('Worker fetch failed, falling back to GitHub Pages:', error);
          return fetch(event.request);
        })
    );
  }
});
