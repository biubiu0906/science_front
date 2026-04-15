<template>
  <div class="file-preview-component">
    <!-- 文件预览对话框 -->
    <el-dialog
      v-model="visible"
      :title="dialogTitle"
      width="50%"
      height="80%"
      :before-close="handleClose"
      destroy-on-close
      :modal="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
      class="file-preview-dialog fixed-dialog"
    >
      <div class="preview-container" v-loading="loading" element-loading-text="加载中，请稍候...">
        <!-- 图片预览 -->
        <div v-if="fileType === 'image'" class="image-preview">
          <img
            :src="fileUrl"
            :alt="fileName"
            class="preview-image"
            @load="loading = false"
            @error="handleError"
          />
        </div>

        <!-- PDF预览 - 使用vue3-pdf-app -->
        <div v-else-if="fileType === 'pdf'" class="pdf-preview">
          <VuePDF
            :pdf="fileUrl"
            :page="currentPage"
            :scale="scale"
            :config="pdfConfig"
            @loaded="onPdfLoaded"
            @loading-failed="onPdfLoadingFailed"
            @rendered="onPdfRendered"
            class="pdf-viewer"
          />
        </div>

        <!-- DOCX文件预览 - 使用vue-office -->
        <div v-else-if="fileType === 'docx'" class="docx-preview">
          <VueOfficeDocx
            :src="fileUrl"
            @rendered="onDocxRendered"
            @error="onDocxError"
            style="height: 100%; width: 100%;"
          />
        </div>

        <!-- 文本文件预览 -->
        <div v-else-if="fileType === 'text'" class="text-preview">
          <pre class="text-content">{{ textContent }}</pre>
        </div>

        <!-- 不支持的文件类型 -->
        <div v-else class="unsupported-preview">
          <el-result
            icon="warning"
            title="不支持预览"
            sub-title="抱歉，当前文件类型不支持在线预览"
          >
          </el-result>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue'
import VuePDF from 'vue3-pdf-app'
import 'vue3-pdf-app/dist/icons/main.css'
import VueOfficeDocx from '@vue-office/docx'
import '@vue-office/docx/lib/index.css'
import { 
  ArrowLeft, 
  ArrowRight, 
  ZoomIn, 
  ZoomOut, 
  Download,
  Search
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// Props定义
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  fileUrl: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  fileType: {
    type: String,
    default: ''
  },
})

// Emits定义
const emit = defineEmits(['update:modelValue', 'download'])

// 响应式数据
const visible = ref(false)
const loading = ref(false)
const dialogTitle = ref('')

// PDF相关状态
const currentPage = ref(1)
const totalPages = ref(0)
const scale = ref(1.0)

// 文本内容
const textContent = ref('')

// PDF配置 - 完全隐藏工具栏
const pdfConfig = ref({
  // 完全隐藏工具栏
  toolbar: false,
  // 隐藏侧边栏
  sidebar: false,
  // 隐藏所有工具栏按钮
  toolbarViewerLeft: false,
  toolbarViewerRight: false,
  toolbarViewerMiddle: false,
  // 隐藏次要工具栏
  secondaryToolbar: false,
  // 通过ID配置隐藏特定按钮
  idConfig: {
    toolbarViewer: 'hidden-toolbar',
    secondaryToolbar: 'hidden-secondary-toolbar',
    sidebarContainer: 'hidden-sidebar'
  }
})

// 监听modelValue变化
watch(() => props.modelValue, (newVal) => {
  console.log('FilePreviewCom modelValue 变化:', newVal)
  console.log('接收到的props:', {
    fileUrl: props.fileUrl,
    fileName: props.fileName,
    fileType: props.fileType
  })
  
  visible.value = newVal
  if (newVal) {
    initPreview()
  }
})

// 监听visible变化
watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 计算属性：对话框标题
watch([() => props.fileName, () => props.fileType], () => {
  dialogTitle.value = props.fileName || '文件预览'
})

const initPreview = async () => {
  if (!props.fileUrl) {
    ElMessage.error('文件URL不能为空')
    return
  }

  loading.value = true
  
  try {
    switch (props.fileType) {
      case 'image':
        // 图片预览不需要特殊处理，直接显示
        loading.value = false
        break
      case 'pdf':
        // PDF预览由vue3-pdf-app组件处理，这里只需要重置状态
        currentPage.value = 1
        scale.value = 1.0
        loading.value = false
        break
      case 'docx':
        // DOCX预览由vue-office组件处理，这里只需要重置状态
        loading.value = false
        break
      case 'text':
        await loadText()
        break
      default:
        loading.value = false
        break
    }
  } catch (error) {
    console.error('预览加载失败:', error)
    ElMessage.error('文件预览加载失败')
    loading.value = false
  }
}

const onPdfLoaded = (pdf) => {
  console.log('PDF加载成功:', pdf)
  totalPages.value = pdf.numPages
  currentPage.value = 1
  loading.value = false
  ElMessage.success('PDF文件加载成功')
}

const onPdfLoadingFailed = (error) => {
  console.error('PDF加载失败:', error)
  loading.value = false
  
  // 根据错误类型提供不同的提示
  let errorMessage = 'PDF文件加载失败'
  if (error.message && error.message.includes('fetch')) {
    errorMessage = 'PDF文件下载失败，请检查网络连接或文件是否存在'
  } else if (error.message && error.message.includes('Invalid PDF')) {
    errorMessage = 'PDF文件格式错误或已损坏'
  }
  
  ElMessage.error(errorMessage)
}

const onPdfRendered = () => {
  console.log('PDF页面渲染完成')
}

const loadText = async () => {
  try {
    const response = await fetch(props.fileUrl)
    const text = await response.text()
    textContent.value = text
    loading.value = false
  } catch (error) {
    console.error('文本文件加载失败:', error)
    ElMessage.error('文本文件加载失败')
    loading.value = false
  }
}

const handleError = () => {
  loading.value = false
  ElMessage.error('文件加载失败')
}


const onDocxError = (error) => {
  console.error('DOCX文件加载失败:', error)
  loading.value = false
  ElMessage.error('DOCX文件加载失败，请检查文件格式或网络连接')
}

const adjustDocxScale = () => {
  if (props.fileType === 'docx') {
    nextTick(() => {
      setTimeout(() => {
        const docxWrapper = document.querySelector('.docx-preview .docx-wrapper .docx')
        const container = document.querySelector('.docx-preview')
        
        if (docxWrapper && container) {
          const containerWidth = container.offsetWidth
          const contentWidth = docxWrapper.scrollWidth
          
          // 如果内容宽度超过容器宽度，进行缩放
          if (contentWidth > containerWidth) {
            const scale = (containerWidth - 40) / contentWidth // 留出40px边距
            const finalScale = Math.min(Math.max(scale, 0.5), 1) // 限制缩放范围在0.5-1之间
            docxWrapper.style.transform = `scale(${finalScale})`
            docxWrapper.style.transformOrigin = 'top left'
            console.log(`DOCX自动缩放: ${finalScale.toFixed(2)}`)
          }
        }
      }, 500) // 延迟500ms确保DOCX内容完全渲染
    })
  }
}

const handleResize = () => {
  adjustDocxScale()
}

const onDocxRendered = () => {
  loading.value = false
  // 渲染完成后自动调整缩放
  adjustDocxScale()
}

const handleClose = () => {
  visible.value = false
  // 重置状态
  loading.value = false
  currentPage.value = 1
  totalPages.value = 0
  scale.value = 1.0
  textContent.value = ''
  
  // 移除事件监听器
  window.removeEventListener('resize', handleResize)
}

// 监听对话框显示状态变化
watch(visible, (newVal) => {
  if (newVal) {
    // 对话框打开时添加事件监听
    window.addEventListener('resize', handleResize)
    
    // 延迟调整缩放，确保内容已加载
    setTimeout(() => {
      adjustDocxScale()
    }, 1000)
  } else {
    // 对话框关闭时移除事件监听
    window.removeEventListener('resize', handleResize)
  }
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.file-preview-component {
  width: 100%;
}

/* 固定对话框样式 */
.file-preview-dialog.fixed-dialog {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
  max-height: 90vh !important;
  max-width: 90vw !important;
  overflow: hidden !important;
}

/* 禁止页面滚动 */
.file-preview-dialog.fixed-dialog :deep(.el-dialog) {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
  overflow: hidden !important;
}

/* 对话框内容区域 */
.file-preview-dialog.fixed-dialog :deep(.el-dialog__body) {
  padding: 10px !important;
  overflow: hidden !important;
  max-height: calc(80vh - 120px) !important;
}

/* 对话框头部 */
.file-preview-dialog.fixed-dialog :deep(.el-dialog__header) {
  padding: 15px 20px !important;
  border-bottom: 1px solid #ebeef5;
}

/* 对话框底部 */
.file-preview-dialog.fixed-dialog :deep(.el-dialog__footer) {
  padding: 15px 20px !important;
  border-top: 1px solid #ebeef5;
}

.preview-container {
  width: 100%;
  height: calc(80vh - 120px);
  max-height: calc(80vh - 120px);
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* 图片预览样式 */
.image-preview {
  text-align: center;
  padding: 20px;
  height: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

/* PDF预览样式 */
.pdf-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  overflow: hidden;
  align-items: center;
}

.pdf-viewer {
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 10px;
  width: 100%;
  max-width: 100%;
}

/* DOCX预览样式 */
.docx-preview {
  height: 100%;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: #ffffff;
  border-radius: 4px;
  position: relative;
}

.docx-preview :deep(.vue-office-docx) {
  height: 100% !important;
  width: 100% !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
}

.docx-preview :deep(.docx-container) {
  padding: 20px !important;
  background-color: #ffffff !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}

.docx-preview :deep(.docx-wrapper) {
  padding: 20px !important;
  padding-bottom: 0px !important;
  display: flex !important;
  align-items: center !important;
  background: none !important;
  flex-flow: row nowrap !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  justify-content: center !important;
}

:deep(.docx) {
  padding: 20px !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  transform-origin: top left !important;
  overflow: hidden !important;
}

/* DOCX内容自适应缩放 */
.docx-preview :deep(.docx-wrapper .docx) {
  transform: scale(1) !important;
  width: 100% !important;
  max-width: 100% !important;
}

/* 确保DOCX内容不会超出容器 */
.docx-preview :deep(.docx-wrapper .docx *) {
  max-width: 100% !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
}

/* 针对小屏幕的特殊优化 */
@media (max-width: 768px) {
  .docx-preview :deep(.docx-container) {
    padding: 10px !important;
  }
  
  .docx-preview :deep(.docx-wrapper) {
    padding: 10px !important;
    padding-bottom: 0px !important;
  }
  
  :deep(.docx) {
    padding: 10px !important;
  }
  
  /* 小屏幕下自动缩放内容 */
  .docx-preview :deep(.docx-wrapper .docx) {
    transform: scale(0.85) !important;
    transform-origin: top left !important;
  }
}

@media (max-width: 480px) {
  .docx-preview :deep(.docx-container) {
    padding: 5px !important;
  }
  
  .docx-preview :deep(.docx-wrapper) {
    padding: 5px !important;
    padding-bottom: 0px !important;
  }
  
  :deep(.docx) {
    padding: 5px !important;
  }
  
  /* 超小屏幕下进一步缩放 */
  .docx-preview :deep(.docx-wrapper .docx) {
    transform: scale(0.7) !important;
    transform-origin: top left !important;
  }
}


.page-info, .zoom-info {
  font-size: 14px;
  color: #606266;
  margin: 0 10px;
}

/* 文本预览样式 */
.text-preview {
  height: 100%;
  flex: 1;
  overflow: auto;
  padding: 20px;
  background-color: #f2f7fc;
}

.text-content {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 不支持预览样式 */
.unsupported-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  flex: 1;
}

/* 对话框底部样式 */
.dialog-footer {
  text-align: right;
}

/* 完全隐藏PDF工具栏和侧边栏 */
#toolbarViewer,
#hidden-toolbar,
#secondaryToolbar,
#hidden-secondary-toolbar,
#sidebarContainer,
#hidden-sidebar,
#secondaryToolbarToggle,
#hidden-secondary-toolbar-toggle,
.toolbar,
.secondaryToolbar,
.findbar,
.doorHanger,
.doorHangerRight,
.splitToolbarButton,
.toolbarButton,
.secondaryToolbarButton {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  height: 0 !important;
  width: 0 !important;
  overflow: hidden !important;
}

/* 确保PDF查看器占满整个容器 */
.pdf-viewer {
  height: 100% !important;
}

/* 隐藏PDF.js的默认工具栏 */
:deep(.toolbar),
:deep(.secondaryToolbar),
:deep(.findbar),
:deep(.doorHanger),
:deep(.doorHangerRight) {
  display: none !important;
}

/* 完全移除侧边栏空间占用 */
:deep(#outerContainer) {
  transform: none !important;
}

:deep(#sidebarContainer) {
  display: none !important;
  width: 0 !important;
  min-width: 0 !important;
  max-width: 0 !important;
}

:deep(#viewerContainer) {
  left: 0 !important;
  width: 100% !important;
  margin-left: 0 !important;
  padding-left: 0 !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
}

:deep(#mainContainer) {
  left: 0 !important;
  width: 100% !important;
}

:deep(.pdfViewer) {
  left: 0 !important;
  width: 100% !important;
  overflow: visible !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
}

/* 确保PDF页面不超出容器宽度 */
:deep(.page) {
  margin: 20px auto !important;
  transform: scale(1.0) !important;
  transform-origin: center !important;
}

/* 确保PDF画布不超出容器宽度 */
:deep(.canvasWrapper) {
  max-width: 100% !important;
  width: 100% !important;
  overflow: hidden !important;
}

:deep(.canvasWrapper canvas) {
  max-width: 100% !important;
  height: auto !important;
  transform-origin: center !important;
}

:deep(.textLayer) {
  max-width: 100% !important;
  width: 100% !important;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5) !important;
  opacity: 1 !important;
}

/* 移除所有可能的水平滚动 */
:deep(#outerContainer),
:deep(#mainContainer),
:deep(#viewerContainer),
:deep(.pdfViewer) {
  box-sizing: border-box !important;
}

/* 移除工具栏高度占用 */
:deep(#toolbarContainer) {
  display: none !important;
  height: 0 !important;
}

:deep(#viewer) {
  top: 0 !important;
  padding-top: 0 !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 小屏幕下调整对话框尺寸 */
  .file-preview-dialog.fixed-dialog {
    max-width: 95vw !important;
    max-height: 95vh !important;
  }
  
  .file-preview-dialog.fixed-dialog :deep(.el-dialog__body) {
    padding: 5px !important;
    max-height: calc(95vh - 120px) !important;
  }
  
  .preview-container {
    height: calc(95vh - 120px);
    max-height: calc(95vh - 120px);
  }
  
  .page-info, .zoom-info {
    margin: 5px 0;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  /* 超小屏幕下进一步优化 */
  .file-preview-dialog.fixed-dialog {
    max-width: 98vw !important;
    max-height: 98vh !important;
  }
  
  .file-preview-dialog.fixed-dialog :deep(.el-dialog__header) {
    padding: 10px 15px !important;
  }
  
  .file-preview-dialog.fixed-dialog :deep(.el-dialog__footer) {
    padding: 10px 15px !important;
  }
  
  .file-preview-dialog.fixed-dialog :deep(.el-dialog__body) {
    padding: 2px !important;
    max-height: calc(98vh - 100px) !important;
  }
  
  .preview-container {
    height: calc(98vh - 100px);
    max-height: calc(98vh - 100px);
  }
  
  .page-info, .zoom-info {
    font-size: 11px;
    margin: 2px 0;
  }
}

:deep(.pdf-app .pdfViewer .page) {
  border: none !important;
}

:deep(.pdf-app.light) {
  --pdf-app-background-color: none !important;
}
</style>