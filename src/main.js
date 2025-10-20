import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/css/global.css'
// Element Plus 样式文件仍需全局引入
import 'element-plus/dist/index.css'
// Element Plus 按需引入配置
import { setupElementPlus } from './utils/element-plus'

const app = createApp(App)

app.use(router)
// 使用按需引入的 Element Plus 配置（语言包现在通过 ElConfigProvider 在 App.vue 中设置）
setupElementPlus(app)
app.mount('#app')

// Element Plus 组件和图标已改为按需引入，在各个组件中单独引入所需的组件和图标
