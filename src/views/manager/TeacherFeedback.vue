<template>
  <div style="width: 80%; margin: 20px auto">
    <div class="card">
      <div style="font-weight: bold; font-size: 20px; margin-bottom: 10px">留下您的反馈信息：</div>
      <el-input type="textarea" :rows="5" v-model="data.content" placeholder="请输入反馈内容"></el-input>
      <div style="margin-top: 10px; text-align: right">
        <el-button type="primary" size="small" @click="submit">提交</el-button>
      </div>
    </div>
    <div class="card feedback-container" style="margin-top: 20px; padding: 20px;">
      <div style="font-size: 18px; color: #ce7b37; font-weight: bold; margin-bottom: 20px; color:#409EFF">看看其他教师提出的反馈内容 ({{ data.feedBackData.length }})</div>
      <div class="feedback-list">
        <div v-for="item in data.feedBackData" style="margin-bottom: 20px">
        <div style="display: flex; align-items: flex-start">
          <div style="display: flex;">
            <img :src="item.teacherAvatar || '/avatar.png'" alt="" style="width: 30px; height: 30px; border-radius: 50%">
            <div style="margin-left: 10px; color: #409EFF; font-weight: 600;">{{ item.teacherName }} :</div>
          </div>
          <div style="flex: 1; margin-left: 10px; margin-right: 20px; text-align: justify; word-wrap: break-word; word-break: break-all; white-space: pre-wrap; overflow-wrap: break-word; min-width: 0;">{{ item.content }}</div>
          <div style="width: 200px; display: flex;">
            <div style="flex: 1">{{ item.time }}</div>
            <el-icon style="width: 50px; color: red; cursor: pointer" v-if="data.user.id === item.teacherId" @click="del(item.id)"><Delete /></el-icon>
          </div>
        </div>
        <div style="display: flex; margin-top: 5px; align-items: flex-start;" v-if="item.replyContent">
          <div style="width: 200px;"></div>
          <div style="color: #E6A23C; font-weight: 600; text-align: justify;">
            {{ item.replyName }}
          </div>
          <div style="flex: 1; margin-left: 10px; margin-right: 20px; align-items: center; color: #E6A23C; word-wrap: break-word; word-break: break-all; white-space: pre-wrap; overflow-wrap: break-word; min-width: 0;">回复：{{ item.replyContent }}</div>
          <div style="width: 200px; color: #E6A23C">回复时间 {{ item.replyTime }}</div>
        </div>
      </div>
    </div>

    </div>
  </div>
</template>

<script setup>

import {reactive, ref} from "vue";
import request from "@/utils/request.js";
import {ElMessage, ElMessageBox} from "@/utils/element-plus";
import {Delete, Edit, Search} from "@element-plus/icons-vue";
import router from "@/router/index.js";


const data = reactive({
  user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
  content: null,
  feedBackData: []
})

const load = () => {
  request.get('/feedback/selectAll').then(res => {
    if (res.code === '200') {
      data.feedBackData = res.data
    } else {
      ElMessage.error(res.msg)
    }
  })
}
const submit = () => {
  if (!data.content) {
    ElMessage.error('请输入反馈内容')
    return
  }

  let submitData = {
    content: data.content
  }
  request.post('/feedback/add', submitData).then(res => {
    if (res.code === '200') {
      ElMessage.success('反馈成功')
      data.content = null
      load()
    } else {
      ElMessage.error(res.msg)
    }
  })
}
const del = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(res => {
    request.delete('/feedback/delete/' + id).then(res => {
      if (res.code === '200') {
        ElMessage.success("删除成功")
        load()
      } else {
        ElMessage.error(res.msg)
      }
    })
  }).catch(err => {
    console.error(err)
  })
}
load()

</script>

<style scoped>

.feedback-container {
  max-height: 600px;
}

.feedback-list {
  max-height: 500px; 
  overflow-y: auto;
  padding-right: 10px; 
}

/* 美化滚动条样式 */
.feedback-list::-webkit-scrollbar {
  width: 8px;
}

.feedback-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.feedback-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.feedback-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>