<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input v-model="data.name" :prefix-icon="Search" style="width: 240px; margin-right: 10px" placeholder="请输入操作名称查询"></el-input>
      <el-input v-model="data.username" :prefix-icon="Search" style="width: 180px; margin-right: 10px" placeholder="请输入操作人查询"></el-input>
      <el-input v-model="data.ip" :prefix-icon="Search" style="width: 160px; margin-right: 10px" placeholder="请输入IP查询"></el-input>
      <el-input v-model="data.location" :prefix-icon="Search" style="width: 180px; margin-right: 10px" placeholder="请输入地址查询"></el-input>
      <el-button type="info" plain @click="search" size="small">查询</el-button>
      <el-button type="warning" plain style="margin: 0 10px" @click="reset" size="small">重置</el-button>
    </div>
    <div class="card" style="margin-bottom: 5px">
      <el-button type="danger" plain @click="delBatch" size="small">批量删除</el-button>
    </div>

    <div class="card" style="margin-bottom: 5px">
      <el-table stripe :data="data.tableData" @selection-change="handleSelectionChange" :header-cell-style="{ backgroundColor: '#e9edf2' }" class="table-center" empty-text="暂无数据">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="操作名称" />
        <el-table-column prop="ip" label="IP" />
        <el-table-column prop="location" label="地址" />
        <el-table-column prop="username" label="操作人" />
        <el-table-column prop="time" label="操作时间" />
      </el-table>
    </div>
    <div class="card" v-if="data.total">
      <el-pagination
        @current-change="load"
        @size-change="(size) => (paginationQuery.setPageSize(size), load())"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[5, 10, 20, 50, 100]"
        v-model:page-size="data.pageSize"
        v-model:current-page="data.pageNum"
        :total="data.total"
      />
    </div>
  </div>
</template>

<script setup>

import {reactive} from "vue";
import request from "@/utils/request.js";
import { usePaginationQuery } from '@/utils/paginationQuery.js';
import { clearTableQuery, tableQueryParams } from '@/utils/tableQuery.js';
import {ElMessage, ElMessageBox} from "@/utils/element-plus";
import { Search } from "@element-plus/icons-vue";

const queryFields = ['name', 'ip', 'location', 'username', 'time']

const data = reactive({
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  name: null,
  ip: null,
  location: null,
  username: null,
  time: null,
  ids: []
})

const paginationQuery = usePaginationQuery(data)

const load = () => {
  paginationQuery.sync()
  request.get('/log/selectPage', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      ...tableQueryParams(data, queryFields)
    }
  }).then(res => {
    if (res.code === '200') {
      data.tableData = res.data?.list || []
      data.total = res.data?.total
    }
  })
}

const del = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(res => {
    request.delete('/log/delete/' + id).then(res => {
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
const delBatch = () => {
  if (!data.ids.length) {
    ElMessage.warning("请选择数据")
    return
  }
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(res => {
    request.delete("/log/delete/batch", {data: data.ids}).then(res => {
      if (res.code === '200') {
        ElMessage.success('操作成功')
        load()
      } else {
        ElMessage.error(res.msg)
      }
    })
  }).catch(err => {
    console.error(err)
  })
}
const handleSelectionChange = (rows) => {
  data.ids = rows.map(v => v.id)
}

const search = () => {
  paginationQuery.reset()
  load()
}

const reset = () => {
  clearTableQuery(data, queryFields)
  paginationQuery.reset()
  load()
}

load()
</script>
