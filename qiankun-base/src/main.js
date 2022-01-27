import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/index.css'

// 引入qiankun
import { registerMicroApps, start } from 'qiankun';

const apps = [
  {
    name: 'vueApp', // 应用的名字
    entry: '//localhost:8083', // 默认会加载这个html 解析里面的js 动态的执行 （子应用必须支持跨域）fetch
    container: '#vue', // 容器名（主应用页面中定义的容器id，用于把对应的子应用放到此容器中）
    activeRule: '/vue', // 激活的路径
    props: { name: 'vueApp' }	// 传递的值（可选）
  },
  {
    name: 'reactApp',
    entry: '//localhost:3000', // 默认会加载这个html 解析里面的js 动态的执行 （子应用必须支持跨域）fetch
    container: '#react',
    activeRule: '/react',
  }
]
registerMicroApps(apps); // 注册应用
start({
  prefetch: false // 取消预加载
});// 开启

const app = createApp(App)
app.use(ElementPlus)

app.use(router).mount('#app')
