import axios from "axios";
import {ElMessage} from "./element-plus";
import router from "@/router/index.js";

const request = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    timeout: 300000  // 后台接口超时时间
})

// request 拦截器
// 可以自请求发送前对请求做一些处理
request.interceptors.request.use(config => {
    config.headers['Content-Type'] = 'application/json;charset=utf-8';
    let user = JSON.parse(localStorage.getItem("xm-user") || '{}')
    config.headers['token'] = user.token || ''
    return config
}, error => {
    return Promise.reject(error)
});

// response 拦截器
// 可以在接口响应后统一处理结果
request.interceptors.response.use(
    response => {
        let res = response.data;
        // 如果是返回的文件
        if (response.config.responseType === 'blob') {
            // 直接返回二进制数据，避免后续字符串解析
            return res
        }
        // 当权限验证不通过的时候给出提示
        if (res.code === '401') {
            ElMessage.error(res.msg)
            router.push('/login')
        }
        // 当系统异常时给出提示
        if (res.code === '500') {
            ElMessage.error(res.msg || '系统异常，请查看后端控制台报错')
        }
        // 兼容服务端返回的字符串数据
        if (typeof res === 'string') {
            // 仅当 content-type 为 JSON 时再尝试解析，避免下载模板这类非 JSON 字符串触发异常
            const contentType = (response.headers && (response.headers['content-type'] || response.headers['Content-Type'])) || ''
            if (contentType.includes('application/json')) {
                res = res ? JSON.parse(res) : res
            }
        }
        return res;
    },
    error => {
        const status = error?.response?.status
        if (!status) {
            ElMessage.error('网络错误或跨域失败，请检查后端 CORS 或开发代理配置')
            console.error(error?.message || 'Unknown network error')
            return Promise.reject(error)
        }
        if (status === 404) {
            ElMessage.error('未找到请求接口')
        } else if (status === 500) {
            ElMessage.error('系统异常，请查看后端控制台报错')
        } else {
            console.error(error.message)
        }
        return Promise.reject(error)
    }
)

export default request
