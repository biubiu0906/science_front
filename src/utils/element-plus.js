/**
 * Element Plus 按需引入配置
 * 根据项目中实际使用的组件进行按需引入，减少打包体积
 */

// 引入需要的 Element Plus 组件
import {
  // 配置组件
  ElConfigProvider,
  
  // 基础组件
  ElButton,
  ElInput,
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElRadio,
  ElRadioGroup,
  ElUpload,
  ElImage,
  ElIcon,
  ElTag,
  ElLink,
  ElTooltip,
  ElPopover,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElDatePicker,
  ElTimeline,
  
  // 布局组件
  ElRow,
  ElCol,
  
  // 导航组件
  ElMenu,
  ElMenuItem,
  ElSubMenu,
  ElTabs,
  ElTabPane,
  
  // 数据展示组件
  ElTable,
  ElTableColumn,
  ElPagination,
  
  // 反馈组件
  ElDialog,
  ElDrawer,
  ElMessage,
  ElMessageBox,
  ElNotification,
  ElLoading
} from 'element-plus'

// 组件列表，用于批量注册
const components = [
  ElConfigProvider,
  ElButton,
  ElInput,
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElRadio,
  ElRadioGroup,
  ElUpload,
  ElImage,
  ElIcon,
  ElTag,
  ElLink,
  ElTooltip,
  ElPopover,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElDatePicker,
  ElTimeline,
  ElRow,
  ElCol,
  ElMenu,
  ElMenuItem,
  ElSubMenu,
  ElTabs,
  ElTabPane,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElDialog,
  ElDrawer
]

/**
 * 设置 Element Plus 按需引入
 * @param {Object} app - Vue 应用实例
 */
export function setupElementPlus(app) {
  // 注册组件
  components.forEach(component => {
    app.component(component.name, component)
  })
  
  // 全局挂载消息组件（语言包通过 ElConfigProvider 在 App.vue 中设置）
  app.config.globalProperties.$message = ElMessage
  app.config.globalProperties.$msgbox = ElMessageBox
  app.config.globalProperties.$alert = ElMessageBox.alert
  app.config.globalProperties.$confirm = ElMessageBox.confirm
  app.config.globalProperties.$prompt = ElMessageBox.prompt
  app.config.globalProperties.$notify = ElNotification
  app.config.globalProperties.$loading = ElLoading.service
}

// 导出常用的服务方法，供组件中直接使用
export {
  ElMessage,
  ElMessageBox,
  ElNotification,
  ElLoading
}