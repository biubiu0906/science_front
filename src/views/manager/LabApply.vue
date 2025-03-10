<template>
    <el-card class="main-card">
        <el-button type="primary" @click="nextTab">新增</el-button>
        <div class="card" style="margin-top: 15px">
            <el-table stripe :data="data">
                <el-table-column prop="code" label="申请编号" />
                <el-table-column prop="name" label="实验室名称" />
                <el-table-column prop="source" label="实验室研究方向" />
                <el-table-column prop="subject" label="学科" />
                <el-table-column prop="price" label="项目预算" />
                <el-table-column prop="start" label="申请时间" />
                <el-table-column prop="start" label="批次" />
                <el-table-column prop="status" label="审核状态" width="120">
                    <template v-slot="scope">
                        <el-tag v-if="scope.row.status === '审核通过'" type="success">{{ scope.row.status }}</el-tag>
                        <el-tag v-if="scope.row.status === '待审核'" type="warning">{{ scope.row.status }}</el-tag>
                        <el-tag v-if="scope.row.status === '不通过'" type="danger">{{ scope.row.status }}</el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </el-card>

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
                    <el-menu-item index="review" v-if="pageStatus !== 'add'">
                        <el-icon>
                            <Check />
                        </el-icon>
                        审核意见
                    </el-menu-item>
                </el-menu>
            </div>

            <!-- 右侧内容 -->
            <div class="right-content">
                <div v-if="activeTab === 'basic'">
                    <h3>基本情况</h3>
                    <el-form ref="basicForm" :model="formData.basic" label-width="180px" :rules="rules.basic">
                        <el-form-item label="机构名称" prop="institutionName">
                            <el-input v-model="formData.basic.institutionName" placeholder="请输入机构名称"></el-input>
                        </el-form-item>
                        <el-form-item label="成立时间" prop="establishmentDate">
                            <el-date-picker v-model="formData.basic.establishmentDate" type="month"
                                placeholder="选择日期"></el-date-picker>
                        </el-form-item>

                        <el-row :gutter="10">
                            <el-col :span="12">
                                <el-form-item label="人员总数" prop="totalStaff">
                                    <el-input v-model="formData.basic.totalStaff" placeholder="请输入人员总数"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="专职人员总数" prop="fullTimeStaff">
                                    <el-input v-model="formData.basic.fullTimeStaff" placeholder="请输入专职人员总数"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row :gutter="10">
                            <el-col :span="12">
                                <el-form-item label="是否实体" prop="isEntity">
                                    <el-select v-model="formData.basic.isEntity">
                                        <el-option label="是" value="是"></el-option>
                                        <el-option label="否" value="否"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="总面积（平米）" prop="totalArea">
                                    <el-input v-model="formData.basic.totalArea" placeholder="请输入总面积"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row :gutter="10">
                            <el-col :span="12">
                                <el-form-item label="实验室面积（平米）" prop="labArea">
                                    <el-input v-model="formData.basic.labArea" placeholder="请输入实验室面积"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="近3年年均经费（万元）" prop="averageFunding">
                                    <el-input v-model="formData.basic.averageFunding"
                                        placeholder="请输入近3年年均经费"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-form-item label="主要经费来源" prop="mainFundingSource">
                            <el-input v-model="formData.basic.mainFundingSource" placeholder="请输入主要经费来源"></el-input>
                        </el-form-item>
                    </el-form>
                </div>


                <div v-if="activeTab === 'direction'">
                    <h3>依托学科 & 研究方向</h3>
                    <el-form label-width="120px" ref="memberForm" :model="formData.direction" :rules="rules.direction">
                        <el-form-item label="其他依托学科">
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
                                            <el-input v-model="scope.row.description" placeholder="请输入学科说明"></el-input>
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

                        <!-- 研究方向 -->
                        <el-form-item label="主要研究方向">
                            <el-table :data="formData.direction.researches" border style="width: 100%">
                                <el-table-column label="主要研究方向" prop="name">
                                    <template #default="scope">
                                        <el-form-item>
                                            <el-input v-model="scope.row.name" placeholder="请输入主要研究方向"></el-input>
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


                <div v-if="activeTab === 'members'">
                    <h3>实验室主要成员</h3>
                    <el-form label-width="150px" :model="formData.members">
                        <!-- 实验室负责人 -->
                        <h4>实验室负责人</h4>
                        <el-form-item label="姓名">
                            <el-input v-model="formData.members.leader.name" placeholder="请输入姓名"></el-input>
                        </el-form-item>
                        <el-form-item label="出生年月">
                            <el-date-picker v-model="formData.members.leader.birthDate" type="date" placeholder="选择出生年月"
                                format="YYYY年MM月" value-format="YYYY年MM月"></el-date-picker>
                        </el-form-item>
                        <el-form-item label="职称">
                            <el-input v-model="formData.members.leader.title" placeholder="请输入职称"></el-input>
                        </el-form-item>
                        <el-form-item label="职务">
                            <el-input type="textarea" v-model="formData.members.leader.position"
                                placeholder="请输入职务"></el-input>
                        </el-form-item>
                        <el-form-item label="学术兼职">
                            <el-input type="textarea" v-model="formData.members.leader.academicPartTime"
                                placeholder="请输入学术兼职"></el-input>
                        </el-form-item>
                        <el-form-item label="手机">
                            <el-input v-model="formData.members.leader.phone" placeholder="请输入手机号"></el-input>
                        </el-form-item>
                        <el-form-item label="专业及研究方向">
                            <el-input type="textarea" v-model="formData.members.leader.researchDirection"
                                placeholder="请输入专业及研究方向"></el-input>
                        </el-form-item>

                        <!-- 实验室联系人 -->
                        <h4>实验室联系人</h4>
                        <el-form-item label="姓名">
                            <el-input v-model="formData.members.labContact.name" placeholder="请输入姓名"></el-input>
                        </el-form-item>
                        <el-form-item label="固话">
                            <el-input v-model="formData.members.labContact.landline" placeholder="请输入固话"></el-input>
                        </el-form-item>
                        <el-form-item label="手机">
                            <el-input v-model="formData.members.labContact.phone" placeholder="请输入手机号"></el-input>
                        </el-form-item>

                        <!-- 学校管理部门联系人 -->
                        <h4>学校管理部门联系人</h4>
                        <el-form-item label="姓名">
                            <el-input v-model="formData.members.schoolContact.name" placeholder="请输入姓名"></el-input>
                        </el-form-item>
                        <el-form-item label="固话">
                            <el-input v-model="formData.members.schoolContact.landline" placeholder="请输入固话"></el-input>
                        </el-form-item>
                        <el-form-item label="手机">
                            <el-input v-model="formData.members.schoolContact.phone" placeholder="请输入手机号"></el-input>
                        </el-form-item>
                    </el-form>
                </div>

                <div v-if="activeTab === 'buildings'">
                    <h3>下属子机构</h3>
                    <!-- 研究方向 -->
                    <el-form>
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
                                            <el-input v-model="scope.row.description" placeholder="请输入相关负责人"></el-input>
                                        </el-form-item>
                                    </template>
                                </el-table-column>
                                <el-table-column label="职务职称" prop="position" width="700">
                                    <template #default="scope">
                                        <el-form-item>
                                            <el-input v-model="scope.row.description" placeholder="请输入其职务职称"></el-input>
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

                <div v-if="activeTab === 'attachments'">
                    <h3>申请材料</h3>
                    <el-upload ref="upload" class="upload-demo" :file-list="formData.attachments.fileList"
                        :on-change="handleChange" :auto-upload="false" :on-remove="handleRemove">
                        <el-button type="primary">点击上传</el-button>
                    </el-upload>
                </div>

                <div v-if="activeTab === 'review'">
                    <h3>审核意见</h3>
                </div>
                <!-- 页面底部的导航按钮 -->
                <div class="navigation-buttons">
                    <el-button :style="{ opacity: activeTab === 'basic' ? 0 : 1 }" @click="prevTab(basicForm)">
                        上一页
                    </el-button>
                    <el-button v-if="activeTab !== 'attachments'" type="primary"
                        @click="nextTab(basicForm)">下一页</el-button>
                    <!-- 添加的时候 -->
                    <el-button v-if="activeTab === 'attachments' && pageStatus === 'add'" type="success"
                        @click="submitForm(basicForm)">提交</el-button>
                </div>
            </div>
        </div>
    </el-card>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, User, Grid, Money, Paperclip, Check, OfficeBuilding } from '@element-plus/icons-vue';
import type { ComponentSize, FormInstance, FormRules } from 'element-plus'
import request from "@/utils/request.js";

export default defineComponent({
    name: 'ProjectApplication',
    components: {
        Document,
        User,
        Grid,
        Money,
        Paperclip,
        Check
    },
    setup() {

        // 代表当前页面的状态(新增、修改、查看)
        const pageStatus = ref('add'); // 默认激活的标签

        const basicForm = ref<FormInstance>();

        const memberForm = ref<FormInstance>();

        const data = reactive({
            user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
            formVisible: false,
            checkVisible: false,
            form: {},
            tableData: [],
            pageNum: 1,
            pageSize: 10,
            total: 0,
            code: null,
            name: null,
        })

        const activeTab = ref('basic'); // 默认激活的标签

        const formData = ref({
            basic: {
                institutionName: '', // 机构名称
                establishmentDate: '', // 成立时间
                totalStaff: '', // 人员总数
                fullTimeStaff: '', // 专职人员总数
                isEntity: '', // 是否实体
                totalArea: '', // 总面积（平米）
                labArea: '', // 实验室面积（平米）
                averageFunding: '', // 近3年年均经费（万元）
                mainFundingSource: '' // 主要经费来源
            },
            direction: {
                // 依托学科
                disciplines: [
                    { name: '', description: '' } // 默认一行
                ],
                // 研究方向
                researches: [
                    { name: '' } // 默认一行
                ],
            },
            members: {
                leader: {
                    name: '', // 实验室负责人姓名
                    birthDate: '', // 出生年月
                    title: '', // 职称
                    position: '', // 职务
                    academicPartTime: '', // 学术兼职
                    phone: '', // 手机
                    researchDirection: '' // 专业及研究方向
                },
                labContact: {
                    name: '', // 实验室联系人姓名
                    landline: '', // 固话
                    phone: '' // 手机
                },
                schoolContact: {
                    name: '', // 学校管理部门联系人姓名
                    landline: '', // 固话
                    phone: '' // 手机
                }
            },
            buildings: {
                // 下属子机构
                construacts: [
                    { name: '', leader: '', position: '' } // 默认一行
                ],
            },
            attachments: {
                fileList: []
            },

        });

        // 校验规则
        const rules = reactive({
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
        });

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
        const removeRow = (type, index: number) => {
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


        // 切换到下一个页面
        const nextTab = (ruleFormRef) => {
            ruleFormRef.validate((valid) => {
                if (valid) {
                    console.log('test', formData.value.attachments.fileList);
                    const tabs = ['basic', 'direction', 'members', 'attachments', 'review'];
                    const currentIndex = tabs.indexOf(activeTab.value);
                    if (currentIndex < tabs.length - 1) {
                        activeTab.value = tabs[currentIndex + 1];
                    }
                } else {
                    ElMessage.error('表单校验失败，请检查输入内容');
                }
            });
        };

        // 切换到上一个页面
        const prevTab = (ruleFormRef) => {
            ruleFormRef.validate((valid) => {
                if (valid) {
                    console.log('test', formData.value.attachments.fileList);
                    const tabs = ['basic', 'direction', 'members', 'attachments', 'review'];
                    const currentIndex = tabs.indexOf(activeTab.value);
                    if (currentIndex > 0) {
                        activeTab.value = tabs[currentIndex - 1];
                    }
                } else {
                    ElMessage.error('表单校验失败，请检查输入内容');
                }
            });

        };

        // 提交表单
        const submitForm = (ruleFormRef) => {
            request.post('/login', formData.value).then(res => {
                console.log('表单提交', res.code);
                if (res.code === '200') {
                    ElMessage.success('登录成功')
                    // 存储用户信息到浏览器的缓存
                    localStorage.setItem('xm-user', JSON.stringify(res.data))
                    setTimeout(() => {
                        location.href = '/manager/home'
                    }, 500)
                } else {
                    ElMessage.error(res.msg)
                }
            })
        };

        // 通过侧边栏切换标签
        const handleTabSelect = (index: string) => {
            activeTab.value = index;
        };

        const handleChange = (rawFile) => {

            formData.value.attachments.fileList.push(rawFile.raw);
            console.log('handleChange', formData.value.attachments.fileList);
        }

        const handleRemove = (rawFile) => {
            console.log('handleRemove', rawFile);
            let tempuid = rawFile.raw.uid;
            formData.value.attachments.fileList =
                formData.value.attachments.fileList.filter((item) => item.uid !== tempuid);
        }

        return {
            activeTab,
            formData,
            pageStatus,
            rules,
            basicForm,
            memberForm,
            nextTab,
            prevTab,
            submitForm,
            handleTabSelect,
            addRow,
            removeRow,
            handleChange,
            handleRemove,
        };
    }
});
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
/deep/ .el-card__body {
    width: 100%;
    /* 表单控件占满剩余宽度 */
}
</style>