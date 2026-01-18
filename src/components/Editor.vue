<template>
  <div style="border: 1px solid #ccc">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      style="height: 300px; overflow-y: hidden;"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
      @onChange="handleChange"
    />
  </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css'

import { onBeforeUnmount, ref, shallowRef, onMounted, watch } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

// props 定义
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入内容...'
  },
  mode: {
    type: String,
    default: 'default'
  },
  readOnly: {
    type: Boolean,
    default: false
  }
})

// emit 定义
const emit = defineEmits(['update:modelValue'])

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref('')

// 监听 props.modelValue 变化
watch(() => props.modelValue, (val) => {
  if (val !== valueHtml.value) {
    valueHtml.value = val
  }
}, { immediate: true })

// 监听 readOnly 变化
watch(() => props.readOnly, (val) => {
  const editor = editorRef.value
  if (editor == null) return
  if (val) {
    editor.disable()
  } else {
    editor.enable()
  }
})

const toolbarConfig = {}
const editorConfig = { 
  placeholder: props.placeholder,
  readOnly: props.readOnly,
  MENU_CONF: {
    uploadImage: {
      server: import.meta.env.VITE_BASE_URL + '/files/upload',
      fieldName: 'file',
      headers: {
        token: JSON.parse(localStorage.getItem('xm-user') || '{}').token
      },
      customInsert(res, insertFn) {
        if (res.code === '200') {
          insertFn(res.data)
        } else {
          console.error('图片上传失败', res)
        }
      }
    }
  }
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor
  if (props.readOnly) {
    editor.disable()
  }
}

const handleChange = (editor) => {
  emit('update:modelValue', editor.getHtml())
}
</script>