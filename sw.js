// sw.js
const WORKER_URL = 'https://car.qyfy.kdns.fr'; // ① 替换成你的 Worker 地址

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 只代理你的 GitHub Pages 同源请求
  if (url.origin === self.location.origin) {
    const init = {
      method: event.request.method,
      headers: event.request.headers,
      redirect: 'follow'
    };

    // GET / HEAD 不能带 body
    if (event.request.method !== 'GET' && event.request.method !== 'HEAD') {
      init.body = event.request.body;
    }

    event.respondWith(
      fetch(WORKER_URL + url.pathname + url.search, init)
        .catch(() => fetch(event.request)) // 失败时回退到 GitHub Pages 原内容
    );
  }
});
