<template>
  <el-dialog
    v-model="dialogVisible"
    title="个人资料"
    width="500px"
    :before-close="handleClose"
  >
    <el-form ref="user" :model="data.user" label-width="70px">
      <el-form-item prop="avatar" label="头像">
        <el-upload
            :action="baseUrl + '/files/upload'"
            :on-success="handleFileUpload"
            :before-upload="beforeAvatarUpload"
            :show-file-list="false"
            accept="image/jpeg,image/jpg,image/png"
            class="avatar-uploader"
        >
          <img v-if="data.user.avatar" :src="data.user.avatar" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item prop="username" label="用户名">
        <el-input disabled v-model="data.user.username" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item prop="name" label="姓名">
        <el-input v-model="data.user.name" placeholder="请输入姓名"></el-input>
      </el-form-item>
      <el-form-item prop="phone" label="电话">
        <el-input v-model="data.user.phone" placeholder="请输入电话"></el-input>
      </el-form-item>
      <el-form-item prop="email" label="邮箱">
        <el-input v-model="data.user.email" placeholder="请输入邮箱"></el-input>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="update">保 存</el-button>
      </div>
    </template>

    <!-- 安全提醒组件 -->
    <SecurityAlert v-model="data.showSecurityAlert" @confirm="handleSecurityConfirm" />
  </el-dialog>
</template>

<script setup>
import { reactive, ref, watch } from "vue";
import request from "@/utils/request.js";
import {ElMessage} from "@/utils/element-plus";
// 按需引入 Element Plus 图标
import { Plus, Delete, Search } from "@element-plus/icons-vue";
import SecurityAlert from "@/components/SecurityAlert.vue";

const baseUrl = import.meta.env.VITE_BASE_URL

// 定义props和emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'updateUser'])

// 对话框显示状态
const dialogVisible = ref(false)

// 监听props变化
watch(() => props.modelValue, (newVal) => {
  dialogVisible.value = newVal
  if (newVal) {
    // 每次打开对话框时重新获取用户信息
    data.user = JSON.parse(localStorage.getItem('xm-user') || '{}')
  }
})

// 监听对话框状态变化
watch(dialogVisible, (newVal) => {
  emit('update:modelValue', newVal)
})

const data = reactive({
  user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
  showSecurityAlert: true // 控制安全提醒弹窗的显示
})

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
}

// 头像上传前的验证函数
const beforeAvatarUpload = (file) => {
  // 检查文件类型
  const isImage = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
  if (!isImage) {
    ElMessage.error('头像只能是JPG、PNG格式的图片!')
    return false
  }
  
  // 检查文件大小（限制为5MB）
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('头像图片大小不能超过5MB!')
    return false
  }
  
  return true
}

const handleFileUpload = (res) => {
  data.user.avatar = res.data
}

// 处理安全提醒确认
const handleSecurityConfirm = () => {
  data.showSecurityAlert = false
}

const update = () => {
  let url = data.user.role === 'SUPER_ADMIN' ? '/admin/update' : '/teacher/update'
  request.put(url, data.user).then(res => {
    if (res.code === '200') {
      ElMessage.success('保存成功')
      localStorage.setItem('xm-user', JSON.stringify(data.user))
      emit('updateUser')
      handleClose() // 保存成功后关闭对话框
    } else {
      ElMessage.error(res.msg)
    }
  })
}
</script>

<style>
.avatar-uploader {
  height: 120px;
}
.avatar-uploader .avatar {
  width: 120px;
  height: 120px;
  display: block;
}
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  text-align: center;
}
</style>