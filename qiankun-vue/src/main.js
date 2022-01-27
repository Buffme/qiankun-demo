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
  console.log(props)
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
}