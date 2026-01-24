<template>
  <div class="login-container">
    <div class="login-box">
      <div style="font-weight: bold; font-size: 24px; text-align: center; margin-bottom: 30px; color: #1450aa">欢 迎 注 册</div>
      <el-form ref="formRef" :model="data.form" :rules="data.rules">
        <el-form-item prop="username">
          <el-input :prefix-icon="User" size="large" v-model="data.form.username" placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input show-password :prefix-icon="Lock" size="large" v-model="data.form.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input show-password :prefix-icon="Lock" size="large" v-model="data.form.confirmPassword" placeholder="请确认密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button size="large" type="primary" style="width: 100%" @click="login">注 册</el-button>
        </el-form-item>
        <div style="text-align: right">
          已有账号？请 <a href="/login">登录</a>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { User, Lock } from "@element-plus/icons-vue";
import request from "@/utils/request.js";
import {ElMessage} from "@/utils/element-plus";
import router from "@/router/index.js";
import { encrypt, getSecurityParams } from '@/utils/rsa.js'

const validatePass = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请确认密码'))
  } else {
    if (value !== data.form.password) {
      callback(new Error("确认密码跟原密码不一致!"))
    }
    callback()
  }
}
const data = reactive({
  form: { role: 'TEACHER'},
  rules: {
    username: [
      { required: true, message: '请输入账号', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' }
    ],
    confirmPassword: [
        { validator: validatePass, trigger: 'blur' }
    ]
  }
})

const formRef = ref()

const login = () => {
  formRef.value.validate(async valid => {
    if (valid) { // 表示表单校验通过
      try {
        const registerData = { ...data.form }
        // 加密密码
        registerData.password = await encrypt(registerData.password)
        // confirmPassword 不需要传给后端，或者后端不解密它，但如果后端校验一致性，这里也加密比较好。
        // 不过通常后端只校验 password。前端已经校验了一致性。
        // 这里假设后端不需要 confirmPassword，或者只需要 password。
        // 但为了保险，如果 confirmPassword 也传，也加密一下。
        if (registerData.confirmPassword) {
           // 注意：通常不需要加密 confirmPassword 发送，因为前端已经验证了。
           // 但为了避免明文传输，还是加密吧。
           registerData.confirmPassword = await encrypt(registerData.confirmPassword)
        }
        
        // 获取安全参数
        const securityParams = await getSecurityParams()
        Object.assign(registerData, securityParams)

        request.post('/register', registerData).then(res => {
          if (res.code === '200') {
            ElMessage.success('注册成功')
            setTimeout(() => {
              location.href = '/login'
            }, 500)
          } else {
            ElMessage.error(res.msg)
          }
        })
      } catch (e) {
        ElMessage.error(e.message || '注册处理失败')
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
  background: linear-gradient(to top, #00467f, #a5cc82);
}
.login-box {
  width: 350px;
  padding: 30px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 0.5);
}
</style>