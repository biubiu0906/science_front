<template>
  <div class="digital-content-inner">
    <div class="toolbar">
      <el-button type="primary" @click="$emit('add')">新增</el-button>
      <el-button :icon="Delete" @click="$emit('delete-batch')" title="批量删除" />
      <el-input
        v-model="keywordModel"
        placeholder="搜索关键词..."
        :prefix-icon="Search"
        clearable
        style="width: 200px; margin-left: auto"
        @keyup.enter="$emit('search')"
        @clear="$emit('search')"
      />
      <el-button :icon="Refresh" @click="$emit('load')" circle title="刷新" />
    </div>

    <el-table
      v-if="activeMenu === 'PLATFORM'"
      :data="tableData"
      stripe
      @selection-change="$emit('selection-change', $event)"
      :header-cell-style="headerStyle"
      class="data-table"
      empty-text="暂无数据"
      v-loading="loading"
      element-loading-text="数据加载中..."
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="序号" width="120" sortable />
      <el-table-column prop="name" label="平台名称" min-width="200" sortable show-overflow-tooltip />
      <el-table-column prop="url" label="入口地址" min-width="280" show-overflow-tooltip />
      <el-table-column prop="category" label="平台类别" width="130" sortable />
      <el-table-column prop="installDate" label="开通时间" width="130" sortable />
      <el-table-column prop="attachmentCount" label="附件数" width="80" align="center">
        <template #default="{ row }">{{ row.attachmentCount ?? '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="$emit('edit', row)">编辑</el-button>
          <el-button link type="danger" @click="$emit('delete', row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-table
      v-if="activeMenu === 'HARDWARE'"
      :data="tableData"
      stripe
      @selection-change="$emit('selection-change', $event)"
      :header-cell-style="headerStyle"
      class="data-table"
      empty-text="暂无数据"
      v-loading="loading"
      element-loading-text="数据加载中..."
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="序号" width="120" sortable />
      <el-table-column prop="name" label="设备名称" min-width="200" sortable show-overflow-tooltip />
      <el-table-column prop="category" label="设备类型" min-width="150" sortable show-overflow-tooltip />
      <el-table-column prop="quantity" label="数量" width="80" sortable />
      <el-table-column prop="unitPrice" label="单台价格" width="110" sortable />
      <el-table-column prop="installDate" label="安装时间" width="130" sortable />
      <el-table-column prop="attachmentCount" label="附件数" width="80" align="center">
        <template #default="{ row }">{{ row.attachmentCount ?? '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="$emit('edit', row)">编辑</el-button>
          <el-button link type="danger" @click="$emit('delete', row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-table
      v-if="activeMenu === 'SOFTWARE'"
      :data="tableData"
      stripe
      @selection-change="$emit('selection-change', $event)"
      :header-cell-style="headerStyle"
      class="data-table"
      empty-text="暂无数据"
      v-loading="loading"
      element-loading-text="数据加载中..."
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="序号" width="120" sortable />
      <el-table-column prop="name" label="软件名称" min-width="250" sortable show-overflow-tooltip />
      <el-table-column prop="category" label="软件类型" width="130" sortable />
      <el-table-column prop="quantity" label="安装数量" width="100" sortable />
      <el-table-column prop="unitPrice" label="单价" width="80" sortable>
        <template #default="{ row }">{{ row.unitPrice ?? '-' }}</template>
      </el-table-column>
      <el-table-column prop="installDate" label="安装时间" width="130" sortable />
      <el-table-column prop="attachmentCount" label="附件数" width="80" align="center">
        <template #default="{ row }">{{ row.attachmentCount ?? '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="$emit('edit', row)">编辑</el-button>
          <el-button link type="danger" @click="$emit('delete', row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-table
      v-if="activeMenu === 'DATA'"
      :data="tableData"
      stripe
      @selection-change="$emit('selection-change', $event)"
      :header-cell-style="headerStyle"
      class="data-table"
      empty-text="暂无数据"
      v-loading="loading"
      element-loading-text="数据加载中..."
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="序号" width="120" sortable />
      <el-table-column prop="name" label="数据资源名称" min-width="280" sortable show-overflow-tooltip />
      <el-table-column prop="category" label="资源类别" width="140" sortable />
      <el-table-column prop="unitPrice" label="采购价格(万元)" width="140" sortable>
        <template #default="{ row }">{{ row.unitPrice ?? '-' }}</template>
      </el-table-column>
      <el-table-column prop="attachmentCount" label="附件数" width="80" align="center">
        <template #default="{ row }">{{ row.attachmentCount ?? '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="$emit('edit', row)">编辑</el-button>
          <el-button link type="danger" @click="$emit('delete', row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="table-footer">
      <div class="selected-info">已选择 {{ selectedIds.length }} 项</div>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pageNumModel"
          v-model:page-size="pageSizeModel"
          :page-sizes="[15, 30, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="$emit('load')"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Delete, Refresh, Search } from '@element-plus/icons-vue'

const props = defineProps({
  activeMenu: {
    type: String,
    required: true
  },
  currentModule: {
    type: Object,
    required: true
  },
  tableData: {
    type: Array,
    default: () => []
  },
  pageNum: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  total: {
    type: Number,
    default: 0
  },
  searchKeyword: {
    type: String,
    default: ''
  },
  selectedIds: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:pageNum',
  'update:pageSize',
  'update:searchKeyword',
  'load',
  'search',
  'add',
  'delete-batch',
  'selection-change',
  'edit',
  'delete'
])

const headerStyle = { backgroundColor: '#f5f7fa', color: '#606266', fontWeight: '600' }

const keywordModel = computed({
  get: () => props.searchKeyword,
  set: value => emit('update:searchKeyword', value)
})

const pageNumModel = computed({
  get: () => props.pageNum,
  set: value => emit('update:pageNum', value)
})

const pageSizeModel = computed({
  get: () => props.pageSize,
  set: value => emit('update:pageSize', value)
})

const handleSizeChange = (size) => {
  emit('update:pageSize', size)
  emit('update:pageNum', 1)
  emit('load')
}
</script>

<style scoped>
.digital-content-inner {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  background: #fff;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.data-table {
  width: 100%;
}

.data-table :deep(.el-table__header th) {
  background-color: #f5f7fa !important;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 2px;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-info {
  font-size: 13px;
  color: #1677ff;
}

.pagination-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
