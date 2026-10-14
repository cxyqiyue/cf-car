// sw.js
const WORKER_URL = 'https://car.qyfy.kdns.fr'; // 末尾不要带 /

console.log('[SW] sw.js 已加载');

// ===== 立即激活并接管 =====
self.addEventListener('install', () => {
  console.log('[SW] install 事件');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] activate 事件');
  event.waitUntil(self.clients.claim());
});

// ===== 代理逻辑 =====
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 只处理同源请求
  if (url.origin !== self.location.origin) return;

  console.log('[SW] 拦截请求:', event.request.method, url.pathname + url.search);

  const init = {
    method: event.request.method,
    headers: event.request.headers,
    redirect: 'follow'
  };

  if (event.request.method !== 'GET' && event.request.method !== 'HEAD') {
    init.body = event.request.body;
  }

  // 去掉 GitHub Pages 子目录前缀 /cf-car
  const cleanPathname = url.pathname.replace(/^\/cf-car/, '') || '/';
  const targetUrl = WORKER_URL + cleanPathname + url.search;
  console.log('[SW] 转发到:', targetUrl);

  event.respondWith(
    fetch(targetUrl, init)
      .then((res) => {
        console.log('[SW] Worker 返回:', res.status);
        return res;
      })
      .catch((err) => {
        console.warn('[SW] Worker 请求失败，回退到 GitHub Pages:', err);
        return fetch(event.request);
      })
  );
});
