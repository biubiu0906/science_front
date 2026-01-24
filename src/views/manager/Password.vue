<template>
  <el-dialog
    v-model="dialogVisible"
    title="修改密码"
    width="400px"
    :before-close="handleClose"
  >
    <el-form ref="formRef" :rules="data.rules" :model="data.user" label-width="80px">
      <el-form-item label="原密码" prop="password">
        <el-input v-model="data.user.password" placeholder="请输入原密码" show-password></el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="data.user.newPassword" placeholder="请输入新密码" show-password></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="data.user.confirmPassword" placeholder="请确认新密码" show-password></el-input>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="updatePassword">保 存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import {reactive, ref, watch} from "vue";
import request from "@/utils/request.js";
import {ElMessage} from "@/utils/element-plus";
import router from "@/router/index.js";
import { encrypt, getSecurityParams } from '@/utils/rsa.js'

// 定义props和emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

// 对话框显示状态
const dialogVisible = ref(false)

// 监听props变化
watch(() => props.modelValue, (newVal) => {
  dialogVisible.value = newVal
  if (newVal) {
    // 每次打开对话框时重置表单数据
    resetForm()
  }
})

// 监听对话框状态变化
watch(dialogVisible, (newVal) => {
  emit('update:modelValue', newVal)
})

const formRef = ref()

// 重置表单数据
const resetForm = () => {
  const userInfo = JSON.parse(localStorage.getItem('xm-user') || '{}')
  // 保持完整的用户对象，只重置密码相关字段
  data.user = {
    ...userInfo, // 保留所有原有字段
    password: '',
    newPassword: '',
    confirmPassword: ''
  }
  // 清除表单验证
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
}

const validatePass = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请确认密码'))
  } else {
    if (value !== data.user.newPassword) {
      callback(new Error("确认密码跟原密码不一致!"))
    }
    callback()
  }
}

const data = reactive({
  user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
  rules: {
    password: [
      { required: true, message: '请输入原密码', trigger: 'blur' },
    ],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
    ],
    confirmPassword: [
      { required: true, message: '请确认新密码', trigger: 'blur' },
      { validator: validatePass, trigger: 'blur' }
    ]
  }
})

const updatePassword = () => {
  formRef.value.validate(async valid => {
    if (valid) {
      try {
        const updateData = { ...data.user }
        // 加密原密码和新密码
        updateData.password = await encrypt(updateData.password)
        updateData.newPassword = await encrypt(updateData.newPassword)
        // confirmPassword 不需要传，或者加密
        if (updateData.confirmPassword) {
           updateData.confirmPassword = await encrypt(updateData.confirmPassword)
        }
        
        // 获取安全参数
        const securityParams = await getSecurityParams()
        Object.assign(updateData, securityParams)

        request.put('/updatePassword', updateData).then(res => {
          if (res.code === '200') {
            ElMessage.success('密码修改成功，请重新登录')
            handleClose() // 关闭对话框
            logout()
          } else {
            ElMessage.error(res.msg)
          }
        })
      } catch (e) {
        ElMessage.error(e.message || '操作失败')
      }
    }
  })
}

const logout = () => {
  localStorage.removeItem('xm-user')
  router.push('/login')
}
</script>

<style scoped>

</style>