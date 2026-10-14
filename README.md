# cf-car

搭配 [MoveCar - 多用户智能挪车系统 (v2.0)](https://github.com/cxyqiyue/movecar) ，用于解决未备案的域名在微信端无法打开的问题。

- 1、fork 此仓库
- 2、fork 的 **[MoveCar - 多用户智能挪车系统 (v2.0)](https://github.com/cxyqiyue/movecar)** 仓库需要用 `movecar.js` 进行部署。
- 3、修改 fork 后仓库里面的 sw.js 里面的 `const WORKER_URL` 为 **MoveCar** 在 Cloudflare workers 上面绑定的自定义域名。
- 4、fork 后的仓库开启 Pages，Settings → Pages，Branch 选择 main 分支后 Save。
- 5、**MoveCar** 的 Cloudflare workers 能够正常运行，且此仓库的 Pages 开启并显示了访问地址
- 6、地址一般为：https://<用户名>.github.io/cf-car

未备案域名被拦截
![未备案域名被拦截](https://i.ibb.co/23cpqnBF/IMG-20261014-154826.jpg)

通过 github.io 跳转默认浏览器
![通过 github.io 跳转默认浏览器](https://i.ibb.co/r2yzdf2L/IMG-20261014-155718.jpg)
