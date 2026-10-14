// sw.js
const WORKER_URL = 'https://car.qyfy.kdns.fr'; // 你的 Worker 地址，末尾不要带 /

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    if (url.origin === self.location.origin) {
        const init = {
            method: event.request.method,
            headers: event.request.headers,
            redirect: 'follow'
        };

        if (event.request.method !== 'GET' && event.request.method !== 'HEAD') {
            init.body = event.request.body;
        }

        // 核心：去掉 /cf-car 前缀，因为 Worker 路由是 /api/xxx
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
