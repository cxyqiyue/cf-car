// sw.js
const WORKER_URL = 'https://car.qyfy.kdns.fr'; // 你的 Worker 地址，末尾不要带 /

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

        // 拼接目标 URL
        // 注意：如果你的 Worker 期望收到根路径（比如 /index.html），需要去掉仓库名 '/cf-car' 前缀
        // 如果你的 Worker 本来就需要收到 '/cf-car/index.html'，请把下面那行注释掉。
        const cleanPathname = url.pathname.replace(/^\/cf-car/, '') || '/';
        
        const targetUrl = new URL(WORKER_URL + cleanPathname + url.search);

        event.respondWith(
            fetch(targetUrl.toString(), init)
                .catch((error) => {
                    console.warn('Worker fetch failed, falling back to GitHub Pages:', error);
                    // 失败时回退到 GitHub Pages 原内容
                    return fetch(event.request);
                })
        );
    }
});
