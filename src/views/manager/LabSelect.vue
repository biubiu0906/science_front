<template>
    <el-card class="main-card">
        <h3 style="margin-left: 20px;">重点实验室审核</h3>
        <div class="card" style="margin-top: 15px">
            <el-table stripe :data="labApplyList" :header-cell-style="{ backgroundColor: '#e9edf2' }" class="table-center">
                <el-table-column type="index" label="序号" :index="indexMethod" width="80" />
                <el-table-column prop="id" label="申请编号" width="150" sortable />
                <el-table-column prop="institutionName" label="实验室名称" width="150" sortable />
                <el-table-column prop="establishmentDate" label="成立日期" width="110" sortable />
                <el-table-column prop="totalStaff" label="人数" width="80" sortable />
                <el-table-column label="附件" sortable>
                    <template v-slot="scope">
                        <div v-if="scope.row.attachments?.files?.length">
                            <div v-for="(fileUrl, index) in scope.row.attachments.files" :key="index">
                                <a :href="fileUrl" target="_blank" download class="file-link">
                                    {{ getFileName(fileUrl) }}
                                </a>
                            </div>
                        </div>
                        <span v-else>无附件</span>
                    </template>
                </el-table-column>

                <el-table-column prop="createTime" label="申请时间" min-width="120" sortable />

                <el-table-column label="审核状态" width="110" sortable>
                    <template v-slot="scope">
                        <!-- 调试信息 -->
                        <!-- {{ console.log('审核状态数据:', scope.row.applicationRecordList) }} -->
                        <el-tag v-if="getApplyStatus(scope.row) === 0 || getApplyStatus(scope.row) === '0'" type="warning">
                            待审核
                        </el-tag>
                        <el-tag v-else-if="getApplyStatus(scope.row) === 1 || getApplyStatus(scope.row) === '1'" type="success">
                            审核通过
                        </el-tag>
                        <el-tag v-else-if="getApplyStatus(scope.row) === 2 || getApplyStatus(scope.row) === '2'" type="danger">
                            审批拒绝
                        </el-tag>
                        <el-tag v-else type="info">
                            未知状态
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column label="审核意见" width="200" sortable>
                    <template v-slot="scope">
                        <div :class="getContentAlignClass(getReviewComments(scope.row))">
                            {{ getReviewComments(scope.row) || '暂无审核意见' }}
                        </div>
                    </template>
                </el-table-column>

                <!-- 操作列 -->
                <el-table-column label="操作" width="160" fixed="right">
                    <template v-slot="scope">
                        <el-tooltip content="查看申请详情" placement="bottom" effect="light">
                            <el-button @click="viewDetails(scope.row.id)" size="small">查看</el-button>
                        </el-tooltip>
                        <el-tooltip v-if="getApplyStatus(scope.row) === 0 || getApplyStatus(scope.row) === '0' || !hasApplicationRecord(scope.row)" content="审核申请" placement="bottom" effect="light">
                            <el-button @click="reviewApply(scope.row.id)" size="small" type="primary">
                                审核
                            </el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </el-card>

    <el-dialog title="重点实验室审核" v-model="formVisible" width="40%" destroy-on-close>
        <el-form :model="reviewData" label-width="70px" style="padding: 20px">
            <el-form-item prop="applyStatus" label="提交状态">
                <el-select v-model="reviewData.applyStatus" placeholder="请选择审核结果">
                    <el-option label="待审核" :value="0"></el-option>
                    <el-option label="审核通过" :value="1"></el-option>
                    <el-option label="不通过" :value="2"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item prop="reviewComments" label="审核理由">
                <el-input v-model="reviewData.reviewComments" placeholder="请输入审核理由"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="formVisible = false" size="small">取 消</el-button>
          <el-button type="primary" @click="submitReview" size="small">提 交</el-button>
            </span>
        </template>
    </el-dialog>

    <transition name="fade" mode="out-in">
        <LabApplicationForm :id="selectedApplicationId" v-if="labSelect" />
    </transition>
</template>

<script setup>
import { ref, reactive, toRaw, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, User, Grid, Money, Paperclip, Check, OfficeBuilding } from '@element-plus/icons-vue';
import request from "@/utils/request.js";
import LabApplicationForm from './componets/LabCom.vue';

// 读取环境变量
const baseUrl = import.meta.env?.VITE_BASE_URL || '';

// 页面状态
const activeTab = ref('basic');

const selectedApplicationId = ref(null); // 定义 selectedApplicationId

// 申请列表数据
const labApplyList = ref([]);

const formVisible = ref(false);

const labSelect = ref(false);

const reviewData = ref({
    labApplyForId: '',
    applyStatus: 0, // 初始值改为数字
    reviewComments: '',
});

const indexMethod = (index) => {
  return (data.pageNum - 1) * data.pageSize + index + 1
}

const reviewApply = (id) => {
    formVisible.value = true;
    reviewData.value.labApplyForId = id;
}

const data = reactive({
    user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
    pageNum: 1,
    pageSize: 10
})
const getFileName = (fileUrl) => {
    return fileUrl.split('-').pop();
};

// 定义一个方法来获取数据
const fetchLabApplyList = async () => {
    // 管理端应该获取的是所有审核记录
    try {
        const response = await request.get('/application_record/list'); // 假设这是获取数据的接口
        labApplyList.value = response.data; // 假设返回的数据是一个数组
    } catch (error) {
        console.error('获取实验室申请列表失败', error);
        ElMessage.error('获取实验室申请列表失败，请稍后再试');
    }
};

// 在组件挂载完成后调用 fetchData 方法
onMounted(fetchLabApplyList);


// 数据对象
const formData = ref({
    basic: { institutionName: '', establishmentDate: '', totalStaff: '', fullTimeStaff: '', isEntity: '', totalArea: '', labArea: '', averageFunding: '', mainFundingSource: '' },
    direction: { disciplines: [{ name: '', description: '' }], researches: [{ name: '' }] },
    members: { leader: { name: '', birthDate: '', title: '', position: '', academicPartTime: '', phone: '', researchDirection: '' }, labContact: { name: '', landline: '', phone: '' }, schoolContact: { name: '', landline: '', phone: '' } },
    buildings: { construacts: [{ name: '', leader: '', position: '' }] },
    attachments: { files: [] }
});

const viewDetails = (id) => {
    labSelect.value = true;
    selectedApplicationId.value = id; // 只传递 ID
}

const submitReview = () => {
    console.log('res', reviewData.value);
    request.post('/application_record/add', reviewData.value).then((res) => {
        // 如果请求成功，显示成功消息
        ElMessage({
            message: '审核成功！',
            type: 'success',
            duration: 2000, // 消息显示的持续时间（毫秒），设置为 0 时不会自动关闭
            onClose: () => {
                formVisible.value = false; // 关闭对话框
                fetchLabApplyList();
            },
        });
    }).catch((error) => {
        // 如果请求失败，显示错误消息
        ElMessage.error('审核失败，请检查输入内容或联系管理员');
        console.error('审核失败', error);
    });
}

// 根据内容长度判断对齐方式的方法
const getContentAlignClass = (content) => {
  if (!content) return 'content-center'
  // 判断内容是否超过一行（这里以50个字符为基准，可根据实际情况调整）
  const isMultiLine = content.length > 50 || content.includes('\n')
  return isMultiLine ? 'content-justify' : 'content-center'
}

// 获取申请状态的辅助函数
const getApplyStatus = (row) => {
  console.log('获取审核状态:', row.applicationRecordList)
  if (!row.applicationRecordList || row.applicationRecordList.length === 0) {
    return 0 // 如果没有审核记录，默认为待审核状态
  }
  return row.applicationRecordList[0]?.applyStatus
}

// 判断是否有申请记录的辅助函数
const hasApplicationRecord = (row) => {
  return row.applicationRecordList && row.applicationRecordList.length > 0
}

// 获取审核意见的辅助函数
const getReviewComments = (row) => {
  if (!row.applicationRecordList || row.applicationRecordList.length === 0) {
    return ''
  }
  return row.applicationRecordList[0]?.reviewComments || ''
}

</script>


<style scoped>
.main-card {
    display: flex;
    width: 98%;
    /* 限制卡片的最大宽度 */
    margin: 0 auto;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    flex: 1;
}

.left-sidebar {
    margin: 0 10px;
    border-right: 1px solid #eaeaea;
}

.right-content {
    flex: 1;
    padding: 0 15px;
    display: flex;
    flex-direction: column;
    /* 使内容垂直排列 */
    justify-content: space-between;
    /* 使按钮固定在底部 */
    overflow-y: auto;
    height: 50vh;
}

.navigation-buttons {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    /* 添加一些内边距 */
}

.content-wrapper {
    display: flex;
    /* 关键样式：确保左右内容在同一行 */
    width: 100%;
    height: 100%;
}



.el-menu-item.is-active {
    color: #63065f;
    font-weight: 600;
}

.el-menu-item:hover {
    background-color: #f5f7fa;
}

/* 确保表单控件占满宽度 */
:deep(.el-card__body) {
    width: 100%;
    padding:0;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* 内容居中对齐 */
.content-center {
    text-align: center;
}

/* 内容两端对齐 */
.content-justify {
    text-align: justify;
    text-justify: inter-ideograph; /* 中文字符间对齐 */
    line-height: 1.5;
}
</style>