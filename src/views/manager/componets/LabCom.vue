<template>
    <el-card class="main-card" style="margin-top:20px;">
        <div class="content-wrapper">
            <!-- 左侧侧边栏 -->
            <div class="left-sidebar">
                <el-menu :default-active="activeTab" @select="handleTabSelect" class="sidebar-menu">
                    <el-menu-item index="basic">
                        <el-icon>
                            <Document />
                        </el-icon>
                        基本情况
                    </el-menu-item>
                    <el-menu-item index="direction">
                        <el-icon>
                            <Grid />
                        </el-icon>
                        依托学科 & 研究方向
                    </el-menu-item>
                    <el-menu-item index="members">
                        <el-icon>
                            <User />
                        </el-icon>
                        实验室主要成员
                    </el-menu-item>
                    <el-menu-item index="buildings">
                        <el-icon>
                            <OfficeBuilding />
                        </el-icon>
                        下属子机构
                    </el-menu-item>
                    <el-menu-item index="attachments">
                        <el-icon>
                            <Paperclip />
                        </el-icon>
                        申请材料
                    </el-menu-item>
                </el-menu>
            </div>

            <!-- 右侧内容 -->
            <div class="right-content">
                <div v-if="activeTab === 'basic'">
                    <h3>基本情况</h3>
                    <el-form ref="basicForm" :model="formData" label-width="180px">
                        <el-form-item label="机构名称">
                            <span>{{ formData.institutionName }}</span>
                        </el-form-item>
                        <el-form-item label="成立时间">
                            <span>{{ formData.establishmentDate }}</span>
                        </el-form-item>

                        <el-row :gutter="10">
                            <el-col :span="12">
                                <el-form-item label="人员总数">
                                    <span>{{ formData.totalStaff }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="专职人员总数">
                                    <span>{{ formData.fullTimeStaff }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row :gutter="10">
                            <el-col :span="12">
                                <el-form-item label="是否实体">
                                    <span>{{ formData.isEntity === '1' ? '是' : '否' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="总面积（平米）">
                                    <span>{{ formData.totalArea }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row :gutter="10">
                            <el-col :span="12">
                                <el-form-item label="实验室面积（平米）">
                                    <span>{{ formData.labArea }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="近3年年均经费（万元）">
                                    <span>{{ formData.averageFunding }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-form-item label="主要经费来源">
                            <span>{{ formData.mainFundingSource }}</span>
                        </el-form-item>
                    </el-form>
                </div>


                <div v-if="activeTab === 'direction'">
                    <h3>依托学科 & 研究方向</h3>
                    <el-form label-width="120px" ref="memberForm" :model="formData">
                        <el-form-item label="其他依托学科">
                            <el-table :data="formData.direction.disciplines" border style="width: 100%" empty-text="暂无依托学科">
                                <el-table-column label="依托学科" prop="name">
                                    <template #default="scope">
                                        <span>{{ scope.row.name }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="学科说明" prop="description">
                                    <template #default="scope">
                                        <span>{{ scope.row.description }}</span>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-form-item>
                        <el-form-item label="研究方向">
                            <el-table :data="formData.direction.researches" border style="width: 100%" empty-text="暂无研究方向">
                                <el-table-column label="研究方向" prop="name">
                                    <template #default="scope">
                                        <span>{{ scope.row.name }}</span>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-form-item>
                    </el-form>
                </div>


                <div v-if="activeTab === 'members'">
                    <h3>实验室主要成员</h3>
                    <el-form label-width="150px" :model="formData.members">
                        <template v-for="(item, index) in formData.members" :key="index">
                            <h4 v-if="index === 0">实验室负责人</h4>
                            <h4 v-if="index === 1">实验室联系人</h4>
                            <h4 v-if="index === 2">学校管理部门联系人</h4>
                            <template v-for="field in formFields" :key="field.prop">
                                <el-form-item v-if="shouldShowField(index, field)" :label="field.label">
                                    <span>{{ formData.members[index][field.prop] }}</span>
                                </el-form-item>
                            </template>
                        </template>
                    </el-form>
                </div>

                <div v-if="activeTab === 'buildings'">
                    <h3>下属子机构</h3>
                    <el-form ref="buildingsForm" :model="formData.buildings">
                        <el-form-item>
                            <el-table :data="formData.buildings.construacts" border style="width: 100%" empty-text="暂无建设内容">
                                <el-table-column label="子机构名称" prop="name">
                                    <template #default="scope">
                                        <span>{{ scope.row.name }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="负责人" prop="leader">
                                    <template #default="scope">
                                        <span>{{ scope.row.leader }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="职务职称" prop="position">
                                    <template #default="scope">
                                        <span>{{ scope.row.description }}</span>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-form-item>
                    </el-form>
                </div>

                <div v-if="activeTab === 'attachments'">
                    <h3>申请材料</h3>
                    <el-table :data="formData.attachments.files" border style="width: 100%" empty-text="暂无附件">
                        <el-table-column label="文件名称" prop="name">
                            <template #default="scope">
                                <a :href="scope.row" target="_blank" download>
                                    {{ scope.row }}
                                </a>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>

            </div>
        </div>
    </el-card>
</template>

<script setup>
import { ref, reactive, toRaw, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, User, Grid, Money, Paperclip, Check, OfficeBuilding } from '@element-plus/icons-vue';
import request from "@/utils/request.js";

// 读取环境变量
const baseUrl = import.meta.env?.VITE_BASE_URL || '';


// 页面状态
const activeTab = ref('basic');

const formFields = ref([
    { label: '姓名', prop: 'name', required: true },
    { label: '出生年月', prop: 'birthDate', type: 'date', required: true },
    { label: '职称', prop: 'title', required: true },
    { label: '手机', prop: 'phone', required: true }
]);

// 数据对象
const formData = ref({
    institutionName: '',
    establishmentDate: '',
    totalStaff: '',
    fullTimeStaff: '',
    isEntity: '',
    totalArea: '',
    labArea: '',
    averageFunding: '',
    mainFundingSource: '',
    direction: {
        disciplines: [],
        researches: []
    },
    members: [
        { name: '', birthDate: '', title: '', phone: '' }, // leader
        { name: '', phone: '' }, // labContact
        { name: '', phone: '' } // schoolContact
    ],
    buildings: {
        construacts: [{ name: '', leader: '', position: '' }]
    },
    attachments: { files: [] }
});

const handleTabSelect = (index) => {
    activeTab.value = index;
}

const props = defineProps({
    id: {
        type: Number,
        required: true
    }
});

const shouldShowField = (index, field) => {
    // 根据索引和字段类型决定是否显示
    if (index === 0) { // leader
        return true;
    } else if (index === 1) { // labContact
        return field.prop !== 'birthDate' && field.prop !== 'title';
    } else if (index === 2) { // schoolContact
        return field.prop !== 'birthDate' && field.prop !== 'title';
    }
    return false;
};

const fetchApplicationDetails = async (id) => {
    try {
        ElMessage({
            message: '查询编号为：' + id + '的申请记录！',
            type: 'success',
            duration: 1000, // 消息显示的持续时间（毫秒），设置为 0 时不会自动关闭
        });
        const response = await request.get(`/laboratory_apply_for/select/${id}`);
        formData.value = response.data;
    } catch (error) {
        console.error('获取详细信息失败', error);
    }
};

watch(() => props.id, (newId) => {
    if (newId) {
        activeTab.value = 'basic';
        fetchApplicationDetails(newId);
    }
}, { immediate: true });

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
    /* 表单控件占满剩余宽度 */
}
</style>