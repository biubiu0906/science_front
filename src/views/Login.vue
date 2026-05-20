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
          <el-input :prefix-icon="User" v-model="data.form.username" placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input show-password :prefix-icon="Lock" v-model="data.form.password"
            placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item prop="captchaCode">
          <div class="captcha-row">
            <div class="captcha-input-box">
              <el-input
                v-model="data.form.captchaCode"
                ref="captchaInputRef"
                maxlength="4"
                placeholder="请输入验证码"
                @input="onCaptchaInput"
              ></el-input>
            </div>
            <div class="captcha-image-box">
              <img
                v-if="captcha.imageBase64"
                class="captcha-image"
                :src="captcha.imageBase64"
                alt="验证码"
                @click="loadCaptcha"
              />
              <div v-else class="captcha-image-skeleton" @click="loadCaptcha">加载中</div>
              <div class="captcha-actions">
                <el-button link type="primary" @click="loadCaptcha">看不清，换一张</el-button>
                <span v-if="captcha.expireSeconds > 0" class="captcha-expire">({{ captcha.expireSeconds }}s)</span>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item prop="role">
          <div style="font-size: 15px; margin-right: 10px; margin-left: 10px;">身份：</div>
          <el-radio-group v-model="data.form.role">
            <el-radio value="TEACHER">教师</el-radio>
            <el-radio value="LAB">组织</el-radio>
            <el-radio value="ADMIN">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button size="large" type="primary" style="width: 100%;" :loading="data.loading" @click="login">登 录</el-button>
        </el-form-item>
        <!-- <div style="text-align: right">
          还没有账号？请 <a href="/register">注册</a>
        </div> -->
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from "vue";
import { User, Lock } from "@element-plus/icons-vue";
import request from "@/utils/request.js";
import { ElMessage } from "@/utils/element-plus";
import router from "@/router/index.js";
import { encrypt, getSecurityParams, getPublicKey, removePublicKey } from '@/utils/rsa.js'
import { clearLaboratoryLevelCache } from "@/utils/laboratoryLevel.js";

const data = reactive({
  form: {
    role: 'TEACHER',
    captchaCode: ''
  },
  dialogVisible: true,
  loading: false,
  rules: {
    username: [
      { required: true, message: '请输入账号', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' }
    ],
    captchaCode: [
      { required: true, message: '请输入验证码', trigger: 'blur' }
    ]
  }
})

const formRef = ref()
const captchaInputRef = ref()
const captcha = reactive({
  captchaId: '',
  imageBase64: '',
  expireSeconds: 0
})
let captchaTimer = null
let publicKeyReady = null

onMounted(() => {
  // 登录页每次进入都刷新公钥，避免服务端重启后复用旧公钥导致首次登录失败。
  publicKeyReady = getPublicKey(true).catch(() => null)
  loadCaptcha()
})

onUnmounted(() => {
  if (captchaTimer) {
    clearInterval(captchaTimer)
    captchaTimer = null
  }
})

const onCaptchaInput = (val) => {
  const v = String(val || '')
    .replace(/\s+/g, '')
    .slice(0, 4)
  if (v !== data.form.captchaCode) data.form.captchaCode = v
}

const CAPTCHA_AUTO_REFRESH_THRESHOLD = 10 // 剩余秒数 <= 该值时自动刷新

const startCaptchaCountdown = (seconds) => {
  if (captchaTimer) {
    clearInterval(captchaTimer)
    captchaTimer = null
  }
  captcha.expireSeconds = Number(seconds) || 0
  if (!captcha.expireSeconds) return
  captchaTimer = setInterval(() => {
    if (captcha.expireSeconds <= 1) {
      captcha.expireSeconds = 0
      clearInterval(captchaTimer)
      captchaTimer = null
      captcha.captchaId = ''
      return
    }
    captcha.expireSeconds -= 1
    if (captcha.expireSeconds <= CAPTCHA_AUTO_REFRESH_THRESHOLD) {
      clearInterval(captchaTimer)
      captchaTimer = null
      loadCaptcha()
    }
  }, 1000)
}

const loadCaptcha = async () => {
  try {
    const res = await request.get('/captcha/image')
    if (String(res?.code) === '200' && res?.data) {
      captcha.captchaId = res.data.captchaId || ''
      captcha.imageBase64 = res.data.imageBase64 || ''
      startCaptchaCountdown(res.data.expireSeconds)
      return
    }
    captcha.captchaId = ''
    captcha.imageBase64 = ''
    captcha.expireSeconds = 0
  } catch (e) {
    captcha.captchaId = ''
    captcha.imageBase64 = ''
    captcha.expireSeconds = 0
  }
}

const refreshCaptchaAndClearInput = async () => {
  data.form.captchaCode = ''
  await loadCaptcha()
  if (captchaInputRef.value?.focus) captchaInputRef.value.focus()
}

const login = (retryOnSecurityError = true) => {
  retryOnSecurityError = retryOnSecurityError !== false
  if (data.loading) return
  formRef.value.validate(async valid => {
    if (valid) {
      try {
        data.loading = true
        // 1. 构造基础数据
        const loginData = { ...data.form }

        loginData.captchaId = captcha.captchaId
        loginData.captchaCode = String(loginData.captchaCode || '').trim()
        if (!loginData.captchaCode) {
          ElMessage.warning('请先输入验证码')
          if (captchaInputRef.value?.focus) captchaInputRef.value.focus()
          data.loading = false
          return
        }
        if (!loginData.captchaId) {
          await refreshCaptchaAndClearInput()
          ElMessage.warning('验证码已过期，请重试')
          data.loading = false
          return
        }

        // 等待进入登录页时的强制公钥刷新完成，避免提交时仍使用旧缓存。
        if (publicKeyReady) {
          await publicKeyReady
          publicKeyReady = null
        }

        // 2. 尝试加密（可能会自动获取公钥）
        loginData.password = await encrypt(loginData.password)
        
        // 3. 获取安全参数 (ts, nonce, keyId)
        const securityParams = await getSecurityParams()
        Object.assign(loginData, securityParams)
        
        const res = await request.post('/login', loginData)
        if (String(res.code) === '200') {
          ElMessage.success('登录成功')
          clearLaboratoryLevelCache()
          localStorage.setItem('xm-user', JSON.stringify(res.data))
          try { localStorage.removeItem('xm-will-logout') } catch (_) { /* 忽略 */ }
          const userInfo = JSON.parse(localStorage.getItem('xm-user') || '{}')
          setTimeout(() => {
            if(userInfo.role === 'SUPER_ADMIN' || userInfo.role === 'SCHOOL_ADMIN' || userInfo.role === 'KEY_LABORATORY') {
              location.href = '/manager/dashboard'
            } else if(userInfo.role === 'TEACHER' || userInfo.role === 'NORMAL_LABORATORY') {
              location.href = '/manager/myNotification'
            } else {
              location.href = '/manager/home'
            }
          }, 500)
          data.loading = false
          return
        }

        const code = String(res.code || '')
        const msg = String(res.msg || '')
        if (code === '5008') {
          ElMessage.warning('请先输入验证码')
          if (captchaInputRef.value?.focus) captchaInputRef.value.focus()
          await refreshCaptchaAndClearInput()
          data.loading = false
          return
        }
        if (code === '5007') {
          ElMessage.error('验证码错误，请重试')
          await refreshCaptchaAndClearInput()
          data.loading = false
          return
        }

        // RSA 失败发生在后端验证码校验之前，保留当前验证码并用新公钥自动重试一次。
        if (code === '400' && (msg.includes('公钥') || msg.includes('解密'))) {
          removePublicKey()
          publicKeyReady = getPublicKey(true).catch(() => null)

          if (retryOnSecurityError) {
            await publicKeyReady
            publicKeyReady = null
            data.loading = false
            login(false)
            return
          }

          ElMessage.error(msg || '登录安全校验失败，请重试')
          data.loading = false
          return
        }

        ElMessage.error(msg || '登录失败')
        await refreshCaptchaAndClearInput()
        data.loading = false
      } catch (e) {
        ElMessage.error(e.message || '登录处理失败')
        data.loading = false
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
  height: 500px;
}

.login-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px 0 0 5px;
}

.login-box {
  width: 450px;
  height: 500px;
  padding: 35px;
  border-radius: 0 5px 5px 0;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-color: rgb(255, 255, 255);
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

.captcha-row {
  width: 100%;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.captcha-input-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.captcha-tip {
  color: #909399;
  font-size: 12px;
  line-height: 16px;
}

.captcha-image-box {
  width: 120px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.captcha-image {
  width: 120px;
  height: 50px;
  object-fit: contain;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
}

.captcha-image-skeleton {
  width: 120px;
  height: 50px;
  border-radius: 6px;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  color: #909399;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.captcha-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  line-height: 16px;
}

.captcha-expire {
  color: #909399;
  font-size: 12px;
}
</style>
