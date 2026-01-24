<template>
  <div class="login-container">
    <div class="login-img">
      <img src="@/assets/imgs/login.jpg" alt="">
    </div>
    <div class="login-box">
      <div style="font-weight: bold; font-size: 32px; text-align: center; margin-bottom: 40px; margin-top: 10px; color: #409EFF">
        欢迎登录科研管理系统</div>
      <el-form ref="formRef" :model="data.form" :rules="data.rules">
        <el-form-item prop="username">
          <el-input :prefix-icon="User" size="large" v-model="data.form.username" placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input show-password :prefix-icon="Lock" size="large" v-model="data.form.password"
            placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item prop="role">
          <div style="font-size: 15px; margin-right: 10px; margin-left: 10px;">角色：</div>
          <el-radio-group v-model="data.form.role">
            <el-radio value="TEACHER">教师</el-radio>
            <el-radio value="LAB">实验室</el-radio>
            <el-radio value="ADMIN">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button size="large" type="primary" style="width: 100%; margin-top: 20px;" @click="login">登 录</el-button>
        </el-form-item>
        <!-- <div style="text-align: right">
          还没有账号？请 <a href="/register">注册</a>
        </div> -->
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { User, Lock } from "@element-plus/icons-vue";
import request from "@/utils/request.js";
import { ElMessage } from "@/utils/element-plus";
import router from "@/router/index.js";
import { encrypt, getSecurityParams, getPublicKey, removePublicKey } from '@/utils/rsa.js'

const data = reactive({
  form: {
    role: 'TEACHER'
  },
  dialogVisible: true,
  rules: {
    username: [
      { required: true, message: '请输入账号', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' }
    ]
  }
})

const formRef = ref()

onMounted(() => {
  // 预取公钥
  getPublicKey()
})

const login = () => {
  formRef.value.validate(async valid => {
    if (valid) {
      try {
        // 1. 构造基础数据
        const loginData = { ...data.form }
        
        // 2. 尝试加密（可能会自动获取公钥）
        loginData.password = await encrypt(loginData.password)
        
        // 3. 获取安全参数 (ts, nonce, keyId)
        const securityParams = await getSecurityParams()
        Object.assign(loginData, securityParams)
        
        // 4. 发送请求
        request.post('/login', loginData).then(res => {
          if (res.code === '200') {
            ElMessage.success('登录成功')
            localStorage.setItem('xm-user', JSON.stringify(res.data))
            try { localStorage.removeItem('xm-will-logout') } catch (_) { /* 忽略 */ }
            const userInfo = JSON.parse(localStorage.getItem('xm-user') || '{}')
            setTimeout(() => {
              if(userInfo.role === 'ADMIN' || userInfo.role === 'KEY_LABORATORY') {
                location.href = '/manager/dashboard'
              } else if(userInfo.role === 'TEACHER' || userInfo.role === 'NORMAL_LABORATORY') {
                location.href = '/manager/myNotification'
              } else {
                location.href = '/manager/home'
              }
            }, 500)
          } else {
            // 处理特定的安全错误（如公钥过期/解密失败）
            if (res.code === '400' && (res.msg.includes('公钥') || res.msg.includes('解密'))) {
              removePublicKey() // 清除本地缓存
              
              // 延迟 500ms 后自动重试一次
              setTimeout(() => {
                login() // 递归调用（注意：仅当再次点击或简单的重试逻辑。若需防死循环，可加参数控制）
              }, 500)
            } else {
              ElMessage.error(res.msg)
            }
          }
        })
      } catch (e) {
        ElMessage.error(e.message || '登录处理失败')
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(45deg, #c8ddf2, #7ab3d8, #4683d4, #2154a3);
  background-size: cover;
}

.login-img {
  width: 400px;
  height: 450px;
}

.login-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px 0 0 5px;
}

.login-box {
  width: 450px;
  height: 450px;
  padding: 40px;
  border-radius: 0 5px 5px 0;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-color: rgb(255, 255, 255);
}

/* 表单项样式优化 */
.login-box :deep(.el-form-item) {
  margin-bottom: 30px; /* 增加表单项之间的间距 */
}

.login-box :deep(.el-input__wrapper) {
  height: 50px;
  padding: 0 15px;
}

.login-box :deep(.el-button--large) {
  height: 50px;
  font-size: 17px;
  margin-top: 10px;
}

.login-box :deep(.el-input__inner) {
  font-size: 15px;
}
</style>