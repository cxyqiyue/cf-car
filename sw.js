// sw.js
const WORKER_URL = 'https://绑定的自定义域名'; // 末尾不要带 /

console.log('[SW] sw.js 已加载');

self.addEventListener('install', () => {
  console.log('[SW] install 事件');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] activate 事件');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 只处理同源请求
  if (url.origin !== self.location.origin) return;

  // 跳过 Cloudflare 注入的监控请求
  if (url.pathname.startsWith('/cdn-cgi/')) {
    event.respondWith(new Response(null, { status: 204 }));
    return;
  }

  console.log('[SW] 拦截请求:', event.request.method, url.pathname + url.search);

  // 去掉子目录前缀 /cf-car
  const cleanPathname = url.pathname.replace(/^\/cf-car/, '') || '/';
  const targetUrl = WORKER_URL + cleanPathname + url.search;
  console.log('[SW] 转发到:', targetUrl);

  // 只保留 Content-Type
  const newHeaders = new Headers();
  const contentType = event.request.headers.get('Content-Type');
  if (contentType) newHeaders.set('Content-Type', contentType);

  const init = {
    method: event.request.method,
    headers: newHeaders,
    redirect: 'manual', // 改为 manual，避免自动跟随重定向导致循环
    mode: 'cors',
    credentials: 'omit'
  };

  if (event.request.method !== 'GET' && event.request.method !== 'HEAD') {
    init.body = event.request.body;
    init.duplex = 'half';
  }

  event.respondWith(
    fetch(targetUrl, init)
      .then(async (res) => {
        console.log('[SW] Worker 返回:', res.status);
        // 如果是重定向响应，直接返回，让浏览器处理
        if (res.status >= 300 && res.status < 400) {
          console.log('[SW] 检测到重定向:', res.headers.get('Location'));
          return res;
        }
        const body = await res.arrayBuffer();
        return new Response(body, {
          status: res.status,
          statusText: res.statusText,
          headers: res.headers
        });
      })
      .catch((err) => {
        console.warn('[SW] Worker 请求失败，回退到 GitHub Pages:', err);
        return fetch(event.request);
      })
  );
});
