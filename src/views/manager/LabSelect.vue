<template>
    <el-card class="main-card">
        <div style="margin-bottom: 15px;">
            <h3 style="margin-left: 20px; margin-bottom: 15px;">重点组织审核</h3>
            <div style="margin-left: 20px;">
                <el-radio-group v-model="applyType" @change="handleTypeChange" size="small" :disabled="data.loading">
                    <el-radio-button value="LAB">重点实验室申请</el-radio-button>
                    <el-radio-button value="BASE">重点研究基地申请</el-radio-button>
                    <el-radio-button value="TEAM">优秀创新团队申请</el-radio-button>
                </el-radio-group>
            </div>
        </div>
        <div
            class="card lab-select-table-card"
            v-loading="data.loading"
            element-loading-text="数据加载中..."
            element-loading-background="rgba(255, 255, 255, 0.78)"
        >
            <el-table stripe :data="applyList" :header-cell-style="{ backgroundColor: '#e9edf2' }" class="table-center" border empty-text="暂无数据">
                <el-table-column type="index" label="序号" :index="indexMethod" width="60" />
                <el-table-column prop="id" label="申请编号" width="150" sortable />
                
                <!-- 动态列名 -->
                <el-table-column v-if="applyType === 'LAB'" prop="institutionName" label="实验室名称" min-width="120" sortable />
                <el-table-column v-else-if="applyType === 'BASE'" prop="base_name" label="基地名称" min-width="120" sortable />
                <el-table-column v-else-if="applyType === 'TEAM'" prop="team_name" label="团队名称" min-width="120" sortable />
                
                <el-table-column v-if="applyType === 'LAB'" prop="establishmentDate" label="成立日期" width="110" sortable />
                <el-table-column v-else-if="applyType === 'BASE'" prop="establish_time" label="成立日期" width="110" sortable />

                <el-table-column label="附件" min-width="150" sortable>
                    <template v-slot="scope">
                        <div v-if="applyType === 'LAB' && scope.row.attachments?.files?.length">
                            <div v-for="(fileUrl, index) in scope.row.attachments.files" :key="index">
                                <a :href="fileUrl" target="_blank" download class="file-link">
                                    {{ getFileName(fileUrl) }}
                                </a>
                            </div>
                        </div>
                        <div v-else-if="(applyType === 'BASE' || applyType === 'TEAM') && scope.row.attachments_list?.length">
                            <div v-for="(file, index) in scope.row.attachments_list" :key="index">
                                <a :href="file.url" target="_blank" download class="file-link">
                                    {{ file.name }}
                                </a>
                            </div>
                        </div>
                        <span v-else>无附件</span>
                    </template>
                </el-table-column>

                <el-table-column v-if="applyType === 'LAB'" prop="createTime" label="申请时间" min-width="120" sortable />
                <el-table-column v-else-if="applyType === 'BASE' || applyType === 'TEAM'" prop="create_time" label="申请时间" min-width="120" sortable />

            <el-table-column label="审核状态" width="110">
                    <template v-slot="scope">
                        <el-tag v-if="scope.row.state === 1" type="info">草稿</el-tag>
                        <el-tag v-else-if="scope.row.state === 0 || scope.row.state === '0'" type="warning">待审核</el-tag>
                        <el-tag v-else-if="scope.row.state === 2 || scope.row.state === '2'" type="success">校审通过</el-tag>
                        <el-tag v-else-if="scope.row.state === 3 || scope.row.state === '3'" type="danger">校审驳回</el-tag>
                        <el-tag v-else-if="scope.row.state === 4 || scope.row.state === '4'" type="success">终审通过</el-tag>  
                        <el-tag v-else-if="scope.row.state === 5 || scope.row.state === '5'" type="danger">终审驳回</el-tag>
                        <el-tag v-else type="info">未知状态</el-tag>
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
                <el-table-column label="操作" width="140" fixed="right">
                    <template v-slot="scope">
                        <el-tooltip content="查看申请详情" placement="bottom" effect="light">
                            <el-button @click="viewDetails(scope.row.id)" size="small">查看</el-button>
                        </el-tooltip>
                        <el-tooltip v-if="[0, 2].includes(scope.row.state) || !hasApplicationRecord(scope.row)" content="审核申请" placement="bottom" effect="light">
                            <el-button @click="reviewApply(scope.row.id)" size="small" type="primary">审核</el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>

            <div style="margin-top: 15px">
                <el-pagination 
                    @size-change="handleSizeChange" 
                    @current-change="handleCurrentChange" 
                    :current-page="data.pageNum" 
                    :page-size="data.pageSize" 
                    :page-sizes="[5, 10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next, jumper" 
                    :total="data.total"
                    :disabled="data.loading">
                </el-pagination>
            </div>
        </div>
    </el-card>

    <el-dialog title="申请审核" v-model="formVisible" width="40%" destroy-on-close append-to-body>
        <el-form :model="reviewData" label-width="70px" style="padding: 20px">
            <el-form-item prop="applyStatus" label="审核状态">
                <el-select v-model="reviewData.applyStatus" placeholder="请选择审核结果">
                    <el-option label="通过" :value="1"></el-option>
                    <el-option label="驳回" :value="2"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item prop="reviewComments" label="审核理由">
                <el-input v-model="reviewData.reviewComments" placeholder="请输入审核理由"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="formVisible = false" size="small">取 消</el-button>
                <el-button type="primary" @click="submitReview" size="small" :loading="data.reviewSubmitting" :disabled="data.reviewSubmitting">提 交</el-button>
            </span>
        </template>
    </el-dialog>

    <transition name="fade" mode="out-in">
        <div v-if="labSelect">
            <LabApplicationForm v-if="applyType === 'LAB'" :id="selectedApplicationId" />
            <ResearchBaseCom v-else-if="applyType === 'BASE'" :id="selectedApplicationId" />
            <InnovationTeamCom v-else-if="applyType === 'TEAM'" :id="selectedApplicationId" />
        </div>
    </transition>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Document, User, Grid, Money, Paperclip, Check, OfficeBuilding, Plus, Delete, Search } from '@element-plus/icons-vue';
import request from "@/utils/request.js";
import { usePaginationQuery } from '@/utils/paginationQuery.js';
import LabApplicationForm from './componets/LabCom.vue';
import ResearchBaseCom from './componets/ResearchBaseCom.vue';
import InnovationTeamCom from './componets/InnovationTeamCom.vue';

const route = useRoute();

// 读取环境变量
const baseUrl = import.meta.env?.VITE_BASE_URL || '';

// 页面状态
const applyTypeOptions = ['LAB', 'BASE', 'TEAM'];
const applyTypeFromQuery = String(route.query.applyType || '');
const hasApplyTypeQuery = applyTypeOptions.includes(applyTypeFromQuery);
const applyType = ref(hasApplyTypeQuery ? applyTypeFromQuery : 'LAB'); // 默认实验室
const selectedApplicationId = ref(null); 

// 申请列表数据
const applyList = ref([]);
const formVisible = ref(false);
const labSelect = ref(false);

const reviewData = ref({
    labApplyForId: '',
    researchBaseApplyForId: '', // 为基地准备的字段
    innovationTeamApplyForId: '', // 为团队准备的字段
    applyStatus: 0,
    reviewComments: '',
});

const data = reactive({
    user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
    pageNum: 1,
    pageSize: 5,
    total: 0,
    loading: false,
    reviewSubmitting: false
});

const paginationQuery = usePaginationQuery(data);

const syncListQuery = () => {
    paginationQuery.replaceQuery({
        pageNum: data.pageNum,
        pageSize: data.pageSize,
        applyType: applyType.value
    });
};

const handleSizeChange = (val) => {
    data.pageSize = val;
    data.pageNum = 1;
    fetchApplyList();
};

const handleCurrentChange = (val) => {
    data.pageNum = val;
    fetchApplyList();
};

const indexMethod = (index) => {
  return (data.pageNum - 1) * data.pageSize + index + 1
};

const getFileName = (fileUrl) => {
    return fileUrl.split('-').pop();
};

// 切换类型时重新加载数据
const handleTypeChange = (val) => {
    applyType.value = val;
    labSelect.value = false; // 切换时关闭详情
    selectedApplicationId.value = null; // 清空当前选中的ID，避免 watch 被触发自动请求
    
    // 重置分页和列表数据，避免数据污染
    data.pageNum = 1;
    applyList.value = [];
    data.total = 0;
    
    fetchApplyList();
};

// 定义一个方法来获取数据
const fetchApplyList = async () => {
    try {
        data.loading = true;
        syncListQuery();
        let response;
        if (applyType.value === 'LAB') {
            response = await request.get('/application_record/list', {
                params: {
                    pageNum: data.pageNum,
                    pageSize: data.pageSize
                }
            });
        } else if (applyType.value === 'BASE') {
            // 根据文档获取基地申请列表
            response = await request.get('/research_base_application_record/list', {
                params: {
                    pageNum: data.pageNum,
                    pageSize: data.pageSize
                }
            });
        } else if (applyType.value === 'TEAM') {
            response = await request.get('/innovation_team_application_record/list', {
                params: {
                    pageNum: data.pageNum,
                    pageSize: data.pageSize
                }
            });
        }

        // 安全解析后端不同格式的响应，防止数据污染
        let resData = response?.data || response;
        let list = [];
        let total = 0;

        if (resData) {
            if (Array.isArray(resData)) {
                list = resData;
                total = resData.length;
            } else if (resData.list && Array.isArray(resData.list)) {
                list = resData.list;
                total = resData.total || list.length;
            } else if (resData.records && Array.isArray(resData.records)) {
                list = resData.records;
                total = resData.total || list.length;
            } else {
                // 如果是个单独对象，包装成数组
                list = [resData];
                total = 1;
            }
        }

        applyList.value = list;
        data.total = total;

    } catch (error) {
        console.error('获取申请列表失败', error);
        ElMessage.error('获取申请列表失败，请稍后再试');
        applyList.value = [];
        data.total = 0;
    } finally {
        data.loading = false;
    }
};

// 在组件挂载完成后调用
onMounted(() => {
    // 如果 token 中 laboratoryHierarchy 标识了当前用户的类型，可以根据它设置默认值
    if (!hasApplyTypeQuery && data.user && data.user.laboratoryHierarchy) {
        if (data.user.laboratoryHierarchy === '基地') {
            applyType.value = 'BASE';
        } else if (data.user.laboratoryHierarchy === '团队') {
            applyType.value = 'TEAM';
        } else {
            applyType.value = 'LAB';
        }
    }
    fetchApplyList();
});

const viewDetails = (id) => {
    labSelect.value = true;
    selectedApplicationId.value = id; 
};

const reviewApply = (id) => {
    formVisible.value = true;
    if (applyType.value === 'LAB') {
        reviewData.value.labApplyForId = id;
        reviewData.value.researchBaseApplyForId = '';
        reviewData.value.innovationTeamApplyForId = '';
    } else if (applyType.value === 'BASE') {
        reviewData.value.researchBaseApplyForId = id;
        reviewData.value.labApplyForId = '';
        reviewData.value.innovationTeamApplyForId = '';
    } else if (applyType.value === 'TEAM') {
        reviewData.value.innovationTeamApplyForId = id;
        reviewData.value.labApplyForId = '';
        reviewData.value.researchBaseApplyForId = '';
    }

    reviewData.value.applyStatus = null;
    reviewData.value.reviewComments = '';
};

const submitReview = async () => {
    if (data.reviewSubmitting) return;
    console.log('res', reviewData.value);
    
    let apiEndpoint = '';
    let payload = {};
    let method = request.post;

    // 获取审核人角色，学校管理员传 SCHOOL_ADMIN，超级管理员传 SUPER_ADMIN
    const reviewerRole = data.user.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'SCHOOL_ADMIN';

    if (applyType.value === 'LAB') {
        apiEndpoint = '/application_record/add';
        payload = {
            labApplyForId: reviewData.value.labApplyForId,
            applyStatus: reviewData.value.applyStatus,
            reviewComments: reviewData.value.reviewComments
        };
    } else if (applyType.value === 'BASE') {
        apiEndpoint = '/research_base_application_record/check';
        payload = {
            researchBaseApplyForId: reviewData.value.researchBaseApplyForId,
            applyStatus: reviewData.value.applyStatus,
            reviewComments: reviewData.value.reviewComments,
            role: reviewerRole
        };
        method = request.put;
    } else if (applyType.value === 'TEAM') {
        apiEndpoint = '/innovation_team_application_record/check';
        payload = {
            innovationTeamApplyForId: reviewData.value.innovationTeamApplyForId,
            applyStatus: reviewData.value.applyStatus,
            reviewComments: reviewData.value.reviewComments,
            role: reviewerRole
        };
        method = request.put;
    }

    data.reviewSubmitting = true;
    try {
        const res = await method(apiEndpoint, payload);
        if (res.code === '200' || res.code === 200) {
            ElMessage({
                message: '审核成功！',
                type: 'success',
                duration: 2000,
                onClose: () => {
                    formVisible.value = false;
                    fetchApplyList();
                },
            });
        } else {
            ElMessage.error(res.msg || '审核失败，请检查输入内容或联系管理员');
        }
    } catch (error) {
        ElMessage.error('审核失败，请检查输入内容或联系管理员');
        console.error('审核失败', error);
    } finally {
        data.reviewSubmitting = false;
    }
};

// 根据内容长度判断对齐方式的方法
const getContentAlignClass = (content) => {
  if (!content) return 'content-center'
  const isMultiLine = content.length > 50 || content.includes('\n')
  return isMultiLine ? 'content-justify' : 'content-center'
};

// 判断是否有申请记录的辅助函数
const hasApplicationRecord = (row) => {
  if (applyType.value === 'LAB') {
      return row.applicationRecordList && row.applicationRecordList.length > 0;
  } else if (applyType.value === 'BASE' || applyType.value === 'TEAM') {
      const recordList = row.researchBaseApplicationRecordList || 
                         row.innovationTeamApplicationRecordList || 
                         row.applicationRecordList ||
                         row.research_base_application_record_list ||
                         row.innovation_team_application_record_list ||
                         row.application_record_list;
      return recordList && recordList.length > 0;
  }
  return false;
};

// 获取审核意见的辅助函数
const getReviewComments = (row) => {
  if (applyType.value === 'LAB') {
      if (!row.applicationRecordList || row.applicationRecordList.length === 0) {
        return ''
      }
      return row.applicationRecordList[0]?.reviewComments || ''
  } else if (applyType.value === 'BASE' || applyType.value === 'TEAM') {
      if (row.reviewComments !== undefined) return row.reviewComments;
      if (row.review_comments !== undefined) return row.review_comments;
      
      const recordList = row.researchBaseApplicationRecordList || 
                         row.innovationTeamApplicationRecordList || 
                         row.applicationRecordList ||
                         row.research_base_application_record_list ||
                         row.innovation_team_application_record_list ||
                         row.application_record_list;

      if (!recordList || recordList.length === 0) {
        return ''
      }
      return recordList[0]?.reviewComments || recordList[0]?.review_comments || ''
  }
  return '';
};
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

.lab-select-table-card {
    position: relative;
    min-height: 260px;
}

:deep(.lab-select-table-card .el-loading-spinner .circular) {
    width: 42px;
    height: 42px;
}

:deep(.lab-select-table-card .el-loading-text) {
    margin-top: 10px;
    color: #409eff;
    font-size: 14px;
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
