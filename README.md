[官网]([https://qiankun.umijs.org/zh/guide/tutorial](https://qiankun.umijs.org/zh/guide/tutorial)
)祭天保佑~

微前端特性：
* 子应用可自主选择技术栈
* 各应用单独部署、互不依赖


### 主应用

1. 创建微应用容器
```js
<!-- app.vue -->
<template>
  <div id="appBase">
    <el-menu :router="true" mode="horizontal">
      <!--主应用内容-->
      <el-menu-item index="/">Home</el-menu-item>
      <el-menu-item index="/about">About</el-menu-item>
      <!--子应用内容-->
      <el-menu-item index="/vue">vue应用</el-menu-item>
      <el-menu-item index="/react">react应用</el-menu-item>
    </el-menu>
    <router-view></router-view>
    <!-- 与 main.js 里面配置的 container 对应-->
    <div id="vue"></div>
    <div id="react"></div>
  </div>
</template>

<script>

export default {
  name: 'appBase',
  components: {
  }
}
</script>
```
2. 注册微应用

3. 启动 `qiankun`；
```js
import { registerMicroApps, start } from 'qiankun';

const apps = [
  {
    name: 'vueApp', // 应用的名字
    entry: '//localhost:8081', // 默认会加载这个html 解析里面的js 动态的执行 （子应用必须支持跨域）fetch
    container: '#vue', // 容器名（主应用页面中定义的容器id，用于把对应的子应用放到此容器中）
    activeRule: '/vue', // 激活的路径
    props: { name: 'vueApp' }	// 传递的值（可选）
  },
  {
    name: 'reactApp',
    entry: '//localhost:3000',
    container: '#react',
    activeRule: '/react',
  }
]
registerMicroApps(apps); // 注册应用
start({
  prefetch: false // 取消预加载
});
```

*当微应用信息注册完之后，一旦浏览器的 `ur`l 发生变化，便会自动触发` qiankun` 的匹配逻辑，所有 `activeRule` 规则匹配上的微应用就会被插入到指定的 `container` 中，同时依次调用微应用暴露出的生命周期钩子* 

### 子应用

1.  建议使用 `history` 模式的路由，需要设置路由 `base`，值和它的 `activeRule` 一样，当然也可以选择`hash`，详细区别见[入门教程 - 路由模式如何选择]([https://qiankun.umijs.org/zh/cookbook](https://qiankun.umijs.org/zh/cookbook)
)
2.  在入口文件 `main.js`中动态添加运行时的 [`publicPath`](https://webpack.docschina.org/guides/public-path/#on-the-fly)，修改并导出三个生命周期函数。
*注：运行时的 ` publicPath`  和构建时的 ` publicPath`  不同*。
3.  修改 `webpack` 打包，允许开发环境跨域和 `umd` 打包。

####  vueApp
```js
// main.js
import Vue from 'vue'
import VueRouter from "vue-router";
import App from './App.vue'
import routes from './routes'

Vue.use(VueRouter);
Vue.config.productionTip = false;

let instance = null;
let router = null;

/**
 * 渲染函数
 * 两种情况：主应用生命周期钩子中运行 / 微应用单独启动时运行
 */
function render(props) {
  // 在 render 中创建 VueRouter，可以保证在卸载微应用时，移除 location 事件监听，防止事件污染
  router = new VueRouter({
    // 运行在主应用中时，添加路由命名空间 /vue
    base: window.__POWERED_BY_QIANKUN__ ? "/vue" : "/",
    mode: "history",
    routes,
  });

  const el = props?.containter || '#appVue'
  // 挂载应用
  instance = new Vue({
    router,
    render: (h) => h(App),
  }).$mount(el);
}

if (window.__POWERED_BY_QIANKUN__) { // 动态添加publicPath
  // eslint-disable-next-line no-undef
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
if (!window.__POWERED_BY_QIANKUN__) { // 默认独立运行
  render();
}
// 父应用加载子应用，子应用必须暴露三个接口：bootstrap、mount、unmount
// 子组件的协议就ok了
export async function bootstrap(props) {
  console.log('bootstrap', props)
}

export async function mount(props) {
  render(props)
}

export async function unmount(props) {
  console.log('unmount', props)
  instance.$destroy();
  instance.$el.innerHTML = '';
  instance = null;
  router = null;
}
```
此处踩了好几个坑，最大坑是这行代码：
```js
 const el = props?.containter || '#appVue'
// 然后挂载
```
原因是子应用加载不出页面，并且 `qiankun` 抛出微应用加载后容器 DOM 节点不存在了，然后检查元素发现该子应用的 `id`是另一串：`<div id="__qiankun_microapp_wrapper_for_vue_app__" data-name="vueApp" data-version="2.6.3">`，由此可推出是挂载时发生的报错。最坑的是当自己傻傻花了好久解决的报错，在我事后查看官网时发现了[常见问题]([https://qiankun.umijs.org/zh/faq#application-died-in-status-not_mounted-target-container-with-container-not-existed-after-xxx-mounted](https://qiankun.umijs.org/zh/faq#application-died-in-status-not_mounted-target-container-with-container-not-existed-after-xxx-mounted)
)中已经给出了答案...
*ps: 常常都是解决了问题才发现官网上有写，只有我这样的铁憨憨才有这样的苦恼吗...*

```js
// vue.config.js
module.exports = {
  devServer: {
      port: 8081, //这里的端口是必须和主应用配置的子应用端口一致
      headers: {
          //因为qiankun内部请求都是fetch来请求资源，所以子应用必须允许跨域
          'Access-Control-Allow-Origin': '*'
      }
  },
  configureWebpack: {
      output: {
          //资源打包路径
          library: 'vueApp',
          libraryTarget: 'umd'
      }
  }
}
```

####  reactApp

* `index.js`文件
```js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

function render(props) {
  console.log('render', props)
  const container = props?.container;
  ReactDOM.render(<App />, container ? container.querySelector('#root') : document.querySelector('#root'));
}

if (window.__POWERED_BY_QIANKUN__) {
  console.log('QIANKUN', window['reactApp'])
  // eslint-disable-next-line no-undef
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}

if(!window.__POWERED_BY_QIANKUN__){
  console.log('N_QIANKUN')
  render();
}

export async function bootstrap(){
 
}
export async function mount(props) {
  console.log('mount', props)
  render(props)
}
export async function unmount(props) {
  const container = props?.container;
  ReactDOM.unmountComponentAtNode(container ? container.querySelector('#root') : document.querySelector('#root'));
}
```
* 修改 `webpack` 配置
官网例子中安装插件 `@rescripts/cli`，还可以选择其他的插件，于是这里安装的是`react-app-rewired`
```js
npm install react-app-rewired
```
```js
// 修改package.json
-   "start": "react-scripts start",
+   "start": "react-app-rewired start",
-   "build": "react-scripts build",
+   "build": "react-app-rewired build",
-   "test": "react-scripts test",
+   "test": "react-app-rewired test",
-   "eject": "react-scripts eject"
+   "eject": "react-app-rewired eject",
```
* 创建打包配置`config-overrides.js`
```js
module.exports = {
  webpack: (config) => {
      config.output.library = 'reactApp';
      config.output.libraryTarget = 'umd';
      config.output.publicPath = 'http://localhost:3000/';	// 此应用自己的端口号
      return config;
  },
  devServer: (configFunction) => {
      return function (proxy, allowedHost) {
          const config = configFunction(proxy, allowedHost);
          config.headers = {
              "Access-Control-Allow-Origin": '*'
          }
          return config
      }
  }
}
```
`react` 的相关配置还算顺利