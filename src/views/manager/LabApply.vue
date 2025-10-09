<template>
    <el-card class="main-card">
        <el-button type="primary" size="small" @click="labAddHandle" v-if="data.user.role ===  'NORMAL_LABORATORY'">新增</el-button>
        <div class="card" style="margin-top: 15px">
            <el-table stripe :data="labApplyList" class="table-center">
                <el-table-column prop="id" label="申请编号" />
                <el-table-column prop="institutionName" label="实验室名称" />
                <el-table-column prop="establishmentDate" label="成立日期" width="120" />
                <el-table-column prop="totalStaff" label="人员总数" width="120" />
                <el-table-column label="附件">
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

                <el-table-column prop="createTime" label="申请时间" width="120" />

                <el-table-column label="审核状态" width="100">
                    <template v-slot="scope">
                        <el-tag v-if="scope.row.applicationRecordList?.[0]?.applyStatus === 0" type="warning">
                            待审核
                        </el-tag>
                        <el-tag v-if="scope.row.applicationRecordList?.[0]?.applyStatus === 1" type="success">
                            审核通过
                        </el-tag>
                        <el-tag v-if="scope.row.applicationRecordList?.[0]?.applyStatus === 2" type="danger">
                            审批拒绝
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column label="审核意见">
                    <template v-slot="scope">
                        <div>{{ scope.row.applicationRecordList?.[0]?.reviewComments }}</div>
                    </template>
                </el-table-column>

                <!-- 操作列 -->
                <el-table-column label="操作" width="180">
                    <template v-slot="scope">
                        <el-button @click="viewDetails(scope.row.id)" size="small">查看</el-button>
                        <!-- 只有审核完毕的状态，才允许修改 -->
                        <el-button @click="updateDetails(scope.row.id)" size="small"
                            v-if="scope.row.applicationRecordList?.[0]?.applyStatus === 2" type="primary">修改</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </el-card>

    <transition name="fade" mode="out-in">
        <el-card class="main-card" style="margin-top:20px;" v-if="pageStatus === 'add' || pageStatus === 'update'">
            <div class="content-wrapper">
                <!-- 左侧步骤条 -->
                <div class="left-sidebar">
                    <el-steps :active="activeStep" finish-status="success" align-center direction="vertical">
                        <el-step title="基本情况" />
                        <el-step title="依托学科 & 研究方向" />
                        <el-step title="实验室主要成员" />
                        <el-step title="下属子机构" />
                        <el-step title="申请材料" />
                        <el-step title="提交成功" />
                    </el-steps>
                </div>

                <!-- 右侧内容 -->
                <div class="right-content">
                    <div v-if="activeStep === 0">
                        <h3>基本情况</h3>
                        <el-form ref="basicForm" :model="formData" label-width="180px" :rules="rules.basic">
                            <el-form-item label="机构名称" prop="institutionName">
                                <el-input v-model="formData.institutionName" placeholder="请输入机构名称"></el-input>
                            </el-form-item>
                            <el-form-item label="成立时间" prop="establishmentDate">
                                <el-date-picker v-model="formData.establishmentDate" type="month" placeholder="选择日期"
                                    value-format="YYYY-MM">
                                </el-date-picker>
                            </el-form-item>

                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <el-form-item label="人员总数" prop="totalStaff">
                                        <el-input v-model="formData.totalStaff" placeholder="请输入人员总数"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="专职人员总数" prop="fullTimeStaff">
                                        <el-input v-model="formData.fullTimeStaff" placeholder="请输入专职人员总数"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <el-form-item label="是否实体" prop="isEntity">
                                        <el-select v-model="formData.isEntity">
                                            <el-option label="是" value="1"></el-option>
                                            <el-option label="否" value="0"></el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="总面积（平米）" prop="totalArea">
                                        <el-input v-model="formData.totalArea" placeholder="请输入总面积"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <el-form-item label="实验室面积（平米）" prop="labArea">
                                        <el-input v-model="formData.labArea" placeholder="请输入实验室面积"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="近3年年均经费（万元）" prop="averageFunding">
                                        <el-input v-model="formData.averageFunding" placeholder="请输入近3年年均经费"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-form-item label="主要经费来源" prop="mainFundingSource">
                                <el-input v-model="formData.mainFundingSource" placeholder="请输入主要经费来源"></el-input>
                            </el-form-item>
                        </el-form>
                    </div>

                    <div v-if="activeStep === 1">
                        <h3>依托学科 & 研究方向</h3>
                        <el-form label-width="120px" ref="memberForm" :model="formData" :rules="rules">
                            <el-form-item label="其他依托学科" prop="direction.disciplines">
                                <el-table :data="formData.direction.disciplines" border style="width: 100%">
                                    <el-table-column label="依托学科" prop="name">
                                        <template #default="scope">
                                            <el-form-item>
                                                <el-input v-model="scope.row.name" placeholder="请输入依托学科"></el-input>
                                            </el-form-item>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="学科说明" prop="description">
                                        <template #default="scope">
                                            <el-form-item>
                                                <el-input v-model="scope.row.description"
                                                    placeholder="请输入学科说明"></el-input>
                                            </el-form-item>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="操作" width="180">
                                        <template #header>
                                            <el-button type="text" @click="addRow('1')">
                                                <el-icon>
                                                    <Plus />
                                                </el-icon>
                                            </el-button>
                                        </template>
                                        <template #default="scope">
                                            <el-button type="text" @click="removeRow('1', scope.$index)">
                                                删除
                                            </el-button>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </el-form-item>
                            <el-form-item label="研究方向" prop="direction.researches">
                                <el-table :data="formData.direction.researches" border style="width: 100%">
                                    <el-table-column label="研究方向" prop="name">
                                        <template #default="scope">
                                            <el-form-item>
                                                <el-input v-model="scope.row.name" placeholder="请输入研究方向"></el-input>
                                            </el-form-item>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="操作" width="180">
                                        <template #header>
                                            <el-button type="text" @click="addRow('2')">
                                                <el-icon>
                                                    <Plus />
                                                </el-icon>
                                            </el-button>
                                        </template>
                                        <template #default="scope">
                                            <el-button type="text" @click="removeRow('2', scope.$index)">
                                                删除
                                            </el-button>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </el-form-item>
                        </el-form>
                    </div>

                    <div v-if="activeStep === 2">
                        <h3>实验室主要成员</h3>
                        <el-form label-width="150px" :model="formData.members" :rules="rules" ref="membersForm">
                            <template v-for="(item, index) in formData.members" :key="index">
                                <h4 v-if="index === 0">实验室负责人</h4>
                                <h4 v-if="index === 1">实验室联系人</h4>
                                <h4 v-if="index === 2">学校管理部门联系人</h4>
                                <template v-for="field in formFields" :key="field.prop">
                                    <el-form-item v-if="shouldShowField(index, field)" :label="field.label"
                                        :prop="`${index}.${field.prop}`" :rules="getFieldRules(field)">
                                        <el-input v-if="field.type !== 'date'"
                                            v-model="formData.members[index][field.prop]"
                                            :placeholder="'请输入' + field.label"></el-input>
                                        <el-date-picker v-else v-model="formData.members[index][field.prop]" type="date"
                                            placeholder="选择日期" format="YYYY年MM月"
                                            value-format="YYYY-MM"></el-date-picker>
                                    </el-form-item>
                                </template>
                            </template>
                        </el-form>

                    </div>

                    <div v-if="activeStep === 3">
                        <h3>下属子机构</h3>
                        <!-- 研究方向 -->
                        <el-form ref="buildingsForm" :model="formData.buildings">
                            <el-form-item>
                                <el-table :data="formData.buildings.construacts" border style="width: 100%">
                                    <el-table-column label="子机构名称" prop="name">
                                        <template #default="scope">
                                            <el-form-item>
                                                <el-input v-model="scope.row.name" placeholder="请输入子机构名称"></el-input>
                                            </el-form-item>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="负责人" prop="leader">
                                        <template #default="scope">
                                            <el-form-item>
                                                <el-input v-model="scope.row.leader" placeholder="请输入相关负责人"></el-input>
                                            </el-form-item>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="职务职称" prop="position" width="700">
                                        <template #default="scope">
                                            <el-form-item>
                                                <el-input v-model="scope.row.description"
                                                    placeholder="请输入其职务职称"></el-input>
                                            </el-form-item>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="操作" width="180">
                                        <template #header>
                                            <el-button type="text" @click="addRow('3')">
                                                <el-icon>
                                                    <Plus />
                                                </el-icon>
                                            </el-button>
                                        </template>
                                        <template #default="scope">
                                            <el-button type="text" @click="removeRow('3', scope.$index)">
                                                删除
                                            </el-button>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </el-form-item>
                        </el-form>

                    </div>

                    <div v-if="activeStep === 4">
                        <h3>申请材料</h3>
                        <el-upload ac ref="uploadRef" class="upload-demo" :file-list="fileList"
                            :action="baseUrl + '/files/upload'" :on-success="handleFileUpload" :on-change="handleChange"
                            :on-remove="handleRemove" multiple>
                            <el-button type="primary" size="small">点击上传</el-button>
                        </el-upload>
                    </div>

                    <div v-if="activeStep === 5" class="success-container">
                        <el-icon :size="200" color="#67c23a">
                            <Check />
                        </el-icon>
                        <h1>提交成功</h1>
                    </div>

                    <!-- 页面底部的导航按钮 -->
                    <div class="navigation-buttons">
                        <el-button :style="{ opacity: activeStep === 0 || activeStep === 5 ? 0 : 1 }"
                            @click="prevTab(basicForm)" size="small">
                            上一页
                        </el-button>
                        <el-button v-if="activeStep !== 4 && activeStep !== 5" type="primary"
                            @click="nextTab(basicForm)" size="small">下一页</el-button>
                        <!-- 添加的时候 -->
                        <el-button v-if="activeStep === 4" type="success" @click="submitForm" size="small">提交</el-button>
                    </div>
                </div>


            </div>
        </el-card>
    </transition>

    <transition name="fade" mode="out-in">
        <LabApplicationForm v-if="pageStatus === 'select'" :id="selectedApplicationId" />
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

const basicForm = ref(null); // 基本情况表单引用
const memberForm = ref(null); // 依托学科 & 研究方向表单引用
const membersForm = ref(null); // 实验室主要成员表单引用
const buildingsForm = ref(null); // 下属子机构表单引用
const uploadRef = ref(null); // 上传组件引用

const selectedApplicationId = ref(null); // 定义 selectedApplicationId

// 页面状态
const pageStatus = ref('');
const activeStep = ref(0);

const fileList = ref([]);

const formFields = ref([
    { label: '姓名', prop: 'name', required: true },
    { label: '出生年月', prop: 'birthDate', type: 'date', required: true },
    { label: '职称', prop: 'title', required: true },
    { label: '手机', prop: 'phone', required: true }
]);

// 申请列表数据
const labApplyList = ref([]);

const data = reactive({
    user: JSON.parse(localStorage.getItem('xm-user') || '{}')
})

// 定义一个方法来获取数据
const fetchLabApplyList = async () => {
    try {
        const response = await request.get('/application_record/selectById/' + data.user.id); // 假设这是获取数据的接口
        labApplyList.value = response.data; // 假设返回的数据是一个数组
    } catch (error) {
        console.error('获取实验室申请列表失败', error);
        ElMessage.error('获取实验室申请列表失败，请稍后再试');
    }
};

// 在组件挂载完成后调用 fetchData 方法
onMounted(fetchLabApplyList);

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

const rules = ref({
    basic: {
        institutionName: [{ required: true, message: '机构名称不能为空', trigger: 'blur' }],
        establishmentDate: [{ required: true, message: '成立时间不能为空', trigger: 'blur' }],
        totalStaff: [{ required: true, message: '人员总数不能为空', trigger: 'blur' }],
        fullTimeStaff: [{ required: true, message: '专职人员总数不能为空', trigger: 'blur' }],
        isEntity: [{ required: true, message: '是否实体不能为空', trigger: 'blur' }],
        totalArea: [{ required: true, message: '总面积不能为空', trigger: 'blur' }],
        labArea: [{ required: true, message: '实验室面积不能为空', trigger: 'blur' }],
        averageFunding: [{ required: true, message: '近3年年均经费不能为空', trigger: 'blur' }],
        mainFundingSource: [{ required: true, message: '主要经费来源不能为空', trigger: 'blur' }]
    },
    "direction.disciplines": [
        {
            validator: (rule, value, callback) => {
                if (!value || value.length === 0) {
                    callback(new Error("至少需要添加一个依托学科"));
                } else {
                    callback();
                }
            },
            trigger: "change" // 监听数组变化
        }
    ],
    "direction.researches": [
        {
            validator: (rule, value, callback) => {
                if (!value || value.length === 0) {
                    callback(new Error("至少需要添加一个研究方向"));
                } else {
                    callback();
                }
            },
            trigger: "change" // 监听数组变化
        }
    ],
    "leader.name": [{ required: true, message: "姓名不能为空", trigger: "blur" }],
    "leader.birthDate": [{ required: true, message: "出生年月不能为空", trigger: "change" }],
    "leader.title": [{ required: true, message: "职称不能为空", trigger: "blur" }],
    "leader.position": [{ required: true, message: "职务不能为空", trigger: "blur" }],
    "leader.academicPartTime": [{ required: true, message: "学术兼职不能为空", trigger: "blur" }],
    "leader.phone": [
        { required: true, message: "手机不能为空", trigger: "blur" },
        { pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号码", trigger: "blur" }
    ],
    "leader.researchDirection": [{ required: true, message: "专业及研究方向不能为空", trigger: "blur" }],

    "labContact.name": [{ required: true, message: "实验室联系人姓名不能为空", trigger: "blur" }],
    "labContact.landline": [{ required: true, message: "固话不能为空", trigger: "blur" }],
    "labContact.phone": [
        { required: true, message: "手机不能为空", trigger: "blur" },
        { pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号码", trigger: "blur" }
    ],

    "schoolContact.name": [{ required: true, message: "学校管理部门联系人姓名不能为空", trigger: "blur" }],
    "schoolContact.landline": [{ required: true, message: "固话不能为空", trigger: "blur" }],
    "schoolContact.phone": [
        { required: true, message: "手机不能为空", trigger: "blur" },
        { pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号码", trigger: "blur" }
    ],
    // todo 待完成
    buildings: {
        construacts: {
            name: [{ required: true, message: '子机构名称不能为空', trigger: 'blur' }],
            leader: [{ required: true, message: '负责人不能为空', trigger: 'blur' }],
            position: [{ required: true, message: '职务职称不能为空', trigger: 'blur' }]
        }
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

const getFieldRules = (field) => {
    // 根据字段生成规则
    if (field.required) {
        return [{ required: true, message: `${field.label}不能为空`, trigger: 'blur' }];
    }
    return [];
};

// 添加一行
const addRow = (type) => {
    var limit = 5;
    if (type === '1') {
        if (formData.value.direction.disciplines.length < limit) {
            formData.value.direction.disciplines.push({ name: '', description: '' });
        } else {
            ElMessage.warning('依托学科最多只能添加' + limit + '行');
        }
    }
    else if (type == '2') {
        if (formData.value.direction.researches.length < limit) {
            formData.value.direction.researches.push({ name: '' });
        } else {
            ElMessage.warning('主要研究方向最多只能添加' + limit + '行');
        }

    }
    else {
        if (formData.value.buildings.construacts.length < limit) {
            formData.value.buildings.construacts.push({ name: '' });
        } else {
            ElMessage.warning('下属子机构最多只能添加' + limit + '行');
        }

    }
};

// 删除一行
const removeRow = (type, index) => {
    if (type === '1') {
        formData.value.direction.disciplines.splice(index, 1);
    }
    else if (type === '2') {
        formData.value.direction.researches.splice(index, 1);
    }
    else {
        formData.value.buildings.construacts.splice(index, 1);
    }

};


// 切换 Tab
const nextTab = () => {
    let formRef = null;

    switch (activeStep.value) {
        case 0:
            formRef = basicForm.value;
            break;
        case 1:
            formRef = memberForm.value;
            break;
        case 2:
            formRef = membersForm.value;
            break;
        case 3:
            formRef = buildingsForm.value;
            break;
        default:
            formRef = null;
    }

    if (formRef) {
        formRef.validate((valid) => {
            console.log('formRef', valid);
            if (valid) {
                activeStep.value += 1;
            } else {
                ElMessage.error('表单校验失败，请检查输入内容');
            }
        });
    } else {
        activeStep.value += 1;
    }
};

const prevTab = () => {
    if (activeStep.value > 0) {
        activeStep.value -= 1;
    }
};

// **文件上传成功**
const handleFileUpload = (res, file) => {
    if (res.code === "200") {
        const url = res.data;
        if (!formData.value.attachments.files.includes(url)) {
            formData.value.attachments.files.push(url);
        }

        // 直接更新 fileList
        fileList.value.push({
            name: url.split("-").pop(),
            url
        });
    } else {
        ElMessage.error("文件上传失败");
    }
};

// **删除文件**
const handleRemove = (file) => {
    formData.value.attachments.files = formData.value.attachments.files.filter(url => url !== file.url);
    fileList.value = fileList.value.filter(item => item.url !== file.url);
};


const submitForm = () => {
    if (pageStatus.value === 'add') {
        request.post('/laboratory_apply_for/add', formData.value).then((res) => {
            // 如果请求成功，显示成功消息
            ElMessage({
                message: '提交成功！',
                type: 'success',
                duration: 2000, // 消息显示的持续时间（毫秒），设置为 0 时不会自动关闭
                onClose: () => {
                    // 消息关闭后的回调函数
                    activeStep.value++; // 跳转到下一步
                    fetchLabApplyList();
                },
            });
        }).catch((error) => {
            // 如果请求失败，显示错误消息
            ElMessage.error('提交失败，请检查输入内容或联系管理员');
            console.error('提交失败', error);
        });
    }
    else {
        request.put('/laboratory_apply_for/update', formData.value).then((res) => {
            // 如果请求成功，显示成功消息
            ElMessage({
                message: '修改成功！',
                type: 'success',
                duration: 2000, // 消息显示的持续时间（毫秒），设置为 0 时不会自动关闭
                onClose: () => {
                    // 消息关闭后的回调函数
                    activeStep.value++; // 跳转到下一步
                    fetchLabApplyList();
                },
            });
        }).catch((error) => {
            // 如果请求失败，显示错误消息
            ElMessage.error('修改失败，请检查输入内容或联系管理员');
            console.error('修改失败', error);
        });
    }

};


const viewDetails = (id) => {
    pageStatus.value = 'select';
    selectedApplicationId.value = id; // 只传递 ID
}

const updateDetails = (id) => {
    pageStatus.value = 'update';
    // 回到开头
    activeStep.value = 0;
    // 但是要填充内容
    fetchApplicationDetails(id);
}

const fetchApplicationDetails = async (id) => {
    try {
        ElMessage({
            message: '查询编号为：' + id + '的申请记录！',
            type: 'success',
            duration: 1000, // 消息显示的持续时间（毫秒），设置为 0 时不会自动关闭
        });
        const response = await request.get(`/laboratory_apply_for/select/${id}`);
        formData.value = response.data;
        formData.value.attachments.files.forEach(url => {
            fileList.value.push({
                name: url.split("-").pop(),
                url
            });
        });
    } catch (error) {
        console.error('获取详细信息失败', error);
    }
};


const labAddHandle = () => {
    // 这里做个check，判断是否已经是重点实验室
    if (data.user.role === 'KEY_LABORATORY') {
        ElMessage({
            message: '你已经是重点实验室，无需再次提交！',
            type: 'warning',
            duration: 2000, // 消息显示的持续时间（毫秒），设置为 0 时不会自动关闭
        });
        return;
    }
    // 刷新 + 清空
    pageStatus.value = 'add';
    activeStep.value = 0;
    // 清空数据
    formData.value = {
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
    };
}

const getFileName = (fileUrl) => {
    return fileUrl.split('-').pop();
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
    margin: 0 20px;
    padding: 20px;
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

.success-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>