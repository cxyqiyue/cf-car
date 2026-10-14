// sw.js
const WORKER_URL = 'https://car.qyfy.kdns.fr'; // 末尾不要带 /

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

  // ===== 跳过 Cloudflare 注入的监控请求，避免 404/405 =====
  if (url.pathname.startsWith('/cdn-cgi/')) {
    event.respondWith(new Response(null, { status: 204 }));
    return;
  }

  // 只代理页面和 /api/ 请求，其他静态资源（图片、JS 等）直接放行
  const isPage = event.request.mode === 'navigate';
  const isApi = url.pathname.startsWith('/cf-car/api/');
  if (!isPage && !isApi) return;

  console.log('[SW] 拦截请求:', event.request.method, url.pathname + url.search);

  // 去掉子目录前缀 /cf-car
  const cleanPathname = url.pathname.replace(/^\/cf-car/, '') || '/';
  const targetUrl = WORKER_URL + cleanPathname + url.search;
  console.log('[SW] 转发到:', targetUrl);

  // 只保留 Content-Type，避免预检失败
  const newHeaders = new Headers();
  const contentType = event.request.headers.get('Content-Type');
  if (contentType) newHeaders.set('Content-Type', contentType);

  const init = {
    method: event.request.method,
    headers: newHeaders,
    redirect: 'follow',
    mode: 'cors',
    credentials: 'omit'
  };

  if (event.request.method !== 'GET' && event.request.method !== 'HEAD') {
    init.body = event.request.body;
    init.duplex = 'half'; // 修复 streaming body 报错
  }

  event.respondWith(
    fetch(targetUrl, init)
      .then(async (res) => {
        console.log('[SW] Worker 返回:', res.status);
        // 关键：读出 body 后用 new Response() 重建，让 type 变成 'basic'
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
