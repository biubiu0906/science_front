<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input v-model="data.name" :prefix-icon="Search" style="width: 240px; margin-right: 10px" placeholder="请输入类型名称查询" :disabled="data.loading"></el-input>
      <el-button type="info" plain @click="search" size="small" :loading="data.loading">查询</el-button>
      <el-button type="warning" plain style="margin: 0 10px" @click="reset" size="small" :disabled="data.loading">重置</el-button>
    </div>

    <div 
      class="card type-table-card" 
      style="margin-bottom: 5px"
      v-loading="data.loading"
      element-loading-text="数据加载中..."
      element-loading-background="rgba(255, 255, 255, 0.78)"
    >
      <div style="margin-bottom: 10px; margin-left: 10px;">
        <el-button type="primary" plain @click="handleAdd" size="small" :disabled="data.loading">新增</el-button>
        <el-button type="danger" plain @click="delBatch" size="small" :disabled="data.loading">批量删除</el-button>
      </div>
      <el-table
        stripe
        :data="data.tableData"
        row-key="id"
        :indent="0"
        default-expand-all
        :row-class-name="getRowClassName"
        @selection-change="handleSelectionChange"
        :header-cell-style="{ backgroundColor: '#eef3f8' }"
        class="type-tree-table"
        empty-text="暂无数据"
      >
        <el-table-column type="selection" width="48" align="center" />
        <el-table-column prop="name" label="类型名称" min-width="520" sortable align="left" header-align="left">
          <template v-slot="scope">
            <div
              class="type-name-cell"
              :class="{ 'is-root': !scope.row.parentId }"
              :style="{ marginLeft: `${Math.max((scope.row._level || 1) - 1, 0) * 34}px` }"
            >
              <span class="type-name-text">{{ scope.row.name }}</span>
              <span v-if="scope.row.children?.length" class="type-child-count">{{ scope.row.children.length }} 项</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="96" fixed="right" align="center">
          <template v-slot="scope">
            <el-tooltip content="编辑类型" placement="bottom" effect="light">
              <el-button type="primary" circle :icon="Edit" @click="handleEdit(scope.row)" size="small" class="type-action-btn"></el-button>
            </el-tooltip>
            <el-tooltip content="删除类型" placement="bottom" effect="light">
              <el-button type="danger" circle :icon="Delete" @click="del(scope.row.id)" size="small" class="type-action-btn"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog title="成果类型" v-model="data.formVisible" width="40%" destroy-on-close>
      <el-form ref="form" :model="data.form" label-width="70px" style="padding: 20px">
        <el-form-item prop="parentId" label="上级类型">
          <el-cascader
            v-model="data.form.parentId"
            :options="data.parentOptions"
            :props="typeCascaderProps"
            placeholder="不选择则为顶级类型"
            clearable
            filterable
          />
        </el-form-item>
        <el-form-item prop="value" label="类型编码">
          <el-input-number
            v-model="data.form.value"
            :controls="false"
            :min="0"
            placeholder="请输入类型编码"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item prop="name" label="类型名称">
          <el-input v-model="data.form.name" placeholder="请输入类型名称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.formVisible = false" size="small">取 消</el-button>
          <el-button type="primary" @click="save" size="small">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>

import {reactive} from "vue";
import request from "@/utils/request.js";
import { usePaginationQuery } from '@/utils/paginationQuery.js';
import { clearTableQuery, tableQueryParams } from '@/utils/tableQuery.js';
import {ElMessage, ElMessageBox} from "@/utils/element-plus";
import {Delete, Edit, Search} from "@element-plus/icons-vue";

const queryFields = ['name']
const typeCascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  emitPath: false,
  checkStrictly: true
}

const data = reactive({
  formVisible: false,
  form: {},
  tableData: [],
  total: 0,
  name: null,
  ids: [],
  parentOptions: [],
  loading: false
})

const paginationQuery = usePaginationQuery(data)

const load = () => {
  paginationQuery.sync()
  data.loading = true
  request.get('/type/selectTree', {
    params: tableQueryParams(data, queryFields)
  }).then(res => {
    if (res.code === '200') {
      data.tableData = markTypeLevels(res.data || [])
      data.total = countTree(data.tableData)
      data.parentOptions = data.tableData
    }
  }).catch(error => {
    console.error(error)
  }).finally(() => {
    data.loading = false
  })
}
const handleAdd = () => {
  data.form = { parentId: null, value: null }
  data.parentOptions = data.tableData
  data.formVisible = true
}
const handleEdit = (row) => {
  data.form = JSON.parse(JSON.stringify(row))
  data.parentOptions = removeSelfAndChildren(data.tableData, row.id)
  data.formVisible = true
}
const add = () => {
  request.post('/type/add', data.form).then(res => {
    if (res.code === '200') {
      ElMessage.success('操作成功')
      data.formVisible = false
      load()
    } else {
      ElMessage.error(res.msg)
    }
  })
}

const update = () => {
  request.put('/type/update', data.form).then(res => {
    if (res.code === '200') {
      ElMessage.success('操作成功')
      data.formVisible = false
      load()
    }
  })
}

const save = () => {
  data.form.id ? update() : add()
}

const del = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(res => {
    request.delete('/type/delete/' + id).then(res => {
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
    request.delete("/type/delete/batch", {data: data.ids}).then(res => {
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

const getRowClassName = ({ row }) => {
  return `type-row type-level-row-${row._level || 1}`
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

const countTree = (nodes = []) => {
  return nodes.reduce((total, item) => total + 1 + countTree(item.children || []), 0)
}

const markTypeLevels = (nodes = [], level = 1) => {
  return nodes.map(item => ({
    ...item,
    _level: level,
    children: item.children?.length ? markTypeLevels(item.children, level + 1) : undefined
  }))
}

const removeSelfAndChildren = (nodes = [], id) => {
  return nodes
    .filter(item => item.id !== id)
    .map(item => ({
      ...item,
      children: removeSelfAndChildren(item.children || [], id)
    }))
    .map(item => {
      if (!item.children.length) {
        const { children, ...rest } = item
        return rest
      }
      return item
    })
}

load()
</script>

<style scoped>
.type-table-card {
  position: relative;
  min-height: 260px;
}

:deep(.type-table-card .el-loading-spinner .circular) {
  width: 42px;
  height: 42px;
}

:deep(.type-table-card .el-loading-text) {
  margin-top: 10px;
  color: #409eff;
  font-size: 14px;
}

:deep(.type-tree-table) {
  --el-table-row-hover-bg-color: #f4f8ff;
  color: #445066;
}

:deep(.type-tree-table .el-table__cell) {
  padding: 6px 0;
}

:deep(.type-tree-table .cell) {
  line-height: 24px;
}

:deep(.type-tree-table .el-table__header th) {
  height: 40px;
  color: #5f6f83;
  font-weight: 600;
}

:deep(.type-tree-table .el-table__row) {
  height: 42px;
}

:deep(.type-tree-table .type-level-row-1) {
  background-color: #f7fbff;
}

:deep(.type-tree-table .type-level-row-1 td:first-child) {
  border-left: 3px solid #409eff;
}

:deep(.type-tree-table .type-level-row-1 .type-name-text) {
  color: #26364a;
  font-weight: 600;
}

:deep(.type-tree-table .type-level-row-2 .type-name-text) {
  color: #46576c;
  font-weight: 500;
}

:deep(.type-tree-table .type-level-row-3 .type-name-text),
:deep(.type-tree-table .type-level-row-4 .type-name-text) {
  color: #617083;
}

:deep(.type-tree-table .el-table__expand-icon) {
  width: 18px;
  height: 18px;
  margin-right: 6px;
  border-radius: 4px;
  color: #7a8da3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.18s ease, color 0.18s ease;
}

:deep(.type-tree-table .el-table__expand-icon:hover) {
  background: #eef6ff;
  color: #2f8cff;
}

:deep(.type-tree-table .el-table__expand-icon--expanded) {
  background: #eaf4ff;
  color: #2f8cff;
}

:deep(.type-tree-table .el-table__placeholder) {
  width: 18px;
  margin-right: 6px;
}

.type-name-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  vertical-align: middle;
}

.type-name-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.type-child-count {
  height: 18px;
  padding: 0 6px;
  border-radius: 4px;
  background: #edf3fa;
  color: #6d7f94;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  flex: 0 0 auto;
}

.type-action-btn {
  width: 26px;
  height: 26px;
}
</style>
