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
                    <el-menu-item index="members">
                        <el-icon>
                            <User />
                        </el-icon>
                        实验室主要成员
                    </el-menu-item>
                    <el-menu-item index="rationale">
                        <el-icon>
                            <Grid />
                        </el-icon>
                        立项依据
                    </el-menu-item>
                    <el-menu-item index="budget">
                        <el-icon>
                            <Money />
                        </el-icon>
                        经费预算
                    </el-menu-item>
                    <el-menu-item index="attachments">
                        <el-icon>
                            <Paperclip />
                        </el-icon>
                        项目附件
                    </el-menu-item>
                    <el-menu-item index="review">
                        <el-icon>
                            <Check />
                        </el-icon>
                        审核意见
                    </el-menu-item>
                </el-menu>
            </div>

            <!-- 右侧内容 -->
            <div class="right-content">
                <!-- 动态内容 -->
                <div v-if="activeTab === 'basic'">
                    <h3>基本情况</h3>
                    <el-form label-width="120px">
                        <el-form-item label="项目名称">
                            <el-input v-model="formData.basic.projectName"></el-input>
                        </el-form-item>
                        <el-form-item label="项目名称">
                            <el-input v-model="formData.basic.projectName"></el-input>
                        </el-form-item>
                        <el-form-item label="项目名称">
                            <el-input v-model="formData.basic.projectName"></el-input>
                        </el-form-item>
                        <el-form-item label="项目名称">
                            <el-input v-model="formData.basic.projectName"></el-input>
                        </el-form-item>
                        <el-form-item label="项目名称">
                            <el-input v-model="formData.basic.projectName"></el-input>
                        </el-form-item>
                        <el-form-item label="项目名称">
                            <el-input v-model="formData.basic.projectName"></el-input>
                        </el-form-item>
                        <el-form-item label="项目名称">
                            <el-input v-model="formData.basic.projectName"></el-input>
                        </el-form-item>
                        <el-form-item label="项目名称">
                            <el-input v-model="formData.basic.projectName"></el-input>
                        </el-form-item>
                        <el-form-item label="项目名称">
                            <el-input v-model="formData.basic.projectName"></el-input>
                        </el-form-item>
                        <el-form-item label="项目名称">
                            <el-input v-model="formData.basic.projectName"></el-input>
                        </el-form-item>
                        <el-form-item label="项目名称">
                            <el-input v-model="formData.basic.projectName"></el-input>
                        </el-form-item>
                        <el-form-item label="项目名称">
                            <el-input v-model="formData.basic.projectName"></el-input>
                        </el-form-item>
                        <el-form-item label="项目名称">
                            <el-input v-model="formData.basic.projectName"></el-input>
                        </el-form-item>
                        <el-form-item label="项目名称">
                            <el-input v-model="formData.basic.projectName"></el-input>
                        </el-form-item>
                        <el-form-item label="项目名称">
                            <el-input v-model="formData.basic.projectName"></el-input>
                        </el-form-item>
                        <el-form-item label="项目名称">
                            <el-input v-model="formData.basic.projectName"></el-input>
                        </el-form-item>
                        <el-form-item label="项目名称">
                            <el-input v-model="formData.basic.projectName"></el-input>
                        </el-form-item>
                        <el-form-item label="项目名称">
                            <el-input v-model="formData.basic.projectName"></el-input>
                        </el-form-item>
                        <el-form-item label="项目类型">
                            <el-select v-model="formData.basic.projectType">
                                <el-option label="科研创新" value="科研创新"></el-option>
                                <el-option label="创业实践" value="创业实践"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                </div>

                <div v-if="activeTab === 'members'">
                    <h3>实验室主要成员</h3>
                    <el-form label-width="120px">
                        <el-form-item label="项目负责人">
                            <el-input v-model="formData.members.leader"></el-input>
                        </el-form-item>
                        <el-form-item label="团队成员">
                            <el-input v-model="formData.members.teamMembers"></el-input>
                        </el-form-item>
                        <el-form-item label="指导教师">
                            <el-input v-model="formData.members.mentor"></el-input>
                        </el-form-item>
                    </el-form>
                </div>

                <div v-if="activeTab === 'rationale'">
                    <h3>立项依据</h3>
                    <el-form label-width="120px">
                        <el-form-item label="研究背景">
                            <el-input type="textarea" v-model="formData.rationale.background"></el-input>
                        </el-form-item>
                        <el-form-item label="研究意义">
                            <el-input type="textarea" v-model="formData.rationale.significance"></el-input>
                        </el-form-item>
                    </el-form>
                </div>

                <div v-if="activeTab === 'budget'">
                    <h3>经费预算</h3>
                    <el-form label-width="120px">
                        <el-form-item label="总预算">
                            <el-input v-model="formData.budget.total"></el-input>
                        </el-form-item>
                        <el-form-item label="分项预算">
                            <el-table :data="formData.budget.items" border>
                                <el-table-column prop="item" label="项目"></el-table-column>
                                <el-table-column prop="amount" label="金额"></el-table-column>
                                <el-table-column label="操作">
                                    <template #default="scope">
                                        <el-button type="text" @click="addItem(scope.$index)">添加</el-button>
                                        <el-button type="text" @click="removeItem(scope.$index)">删除</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-form-item>
                    </el-form>
                </div>

                <div v-if="activeTab === 'attachments'">
                    <h3>项目附件</h3>
                    <el-upload class="upload-demo" action="https://jsonplaceholder.typicode.com/posts/"
                        :on-preview="handlePreview" :on-remove="handleRemove"
                        :file-list="formData.attachments.fileList">
                        <el-button size="small" type="primary">点击上传</el-button>
                    </el-upload>
                </div>

                <div v-if="activeTab === 'review'">
                    <h3>审核意见</h3>
                    <el-form label-width="120px">
                        <el-form-item label="审核意见">
                            <el-input type="textarea" v-model="formData.review.opinion"></el-input>
                        </el-form-item>
                    </el-form>
                </div>
                <!-- 页面底部的导航按钮 -->
                <div class="navigation-buttons">
                    <el-button :style="{ opacity: activeTab === 'basic' ? 0 : 1 }" @click="prevTab">
                        上一页
                    </el-button>
                    <el-button v-if="activeTab !== 'review'" type="primary" @click="nextTab">下一页</el-button>
                    <el-button v-if="activeTab === 'review'" type="success" @click="submitForm">提交</el-button>
                </div>
            </div>
        </div>
    </el-card>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, User, Grid, Money, Paperclip, Check } from '@element-plus/icons-vue';

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
                projectName: '',
                projectType: ''
            },
            members: {
                leader: '',
                teamMembers: '',
                mentor: ''
            },
            rationale: {
                background: '',
                significance: ''
            },
            budget: {
                total: '',
                items: [
                    { item: '材料费', amount: '1000' },
                    { item: '设备费', amount: '2000' }
                ]
            },
            attachments: {
                fileList: []
            },
            review: {
                opinion: ''
            },
            status: {
                projectStatus: '',
                progress: 50
            }
        });

        // 保存当前表单数据
        const saveFormData = () => {
            ElMessage({
                message: '当前表单数据已保存',
                type: 'success',
                duration: 500 // 消息框显示时长（毫秒）
            });
            console.log('保存当前表单数据:', formData.value);
        };


        // 切换到下一个页面
        const nextTab = () => {
            saveFormData(); // 保存当前数据
            const tabs = ['basic', 'members', 'rationale', 'budget', 'attachments', 'review'];
            const currentIndex = tabs.indexOf(activeTab.value);
            if (currentIndex < tabs.length - 1) {
                activeTab.value = tabs[currentIndex + 1];
            }
            console.log(activeTab.value);
        };

        // 切换到上一个页面
        const prevTab = () => {
            saveFormData(); // 保存当前数据
            const tabs = ['basic', 'members', 'rationale', 'budget', 'attachments', 'review'];
            const currentIndex = tabs.indexOf(activeTab.value);
            if (currentIndex > 0) {
                activeTab.value = tabs[currentIndex - 1];
            }
        };

        // 提交表单
        const submitForm = () => {
            saveFormData(); // 保存最后一页的数据
            console.log('提交表单数据:', formData.value);
            alert('表单已提交！');
        };

        // 添加分项预算
        const addItem = (index: number) => {
            formData.value.budget.items.splice(index + 1, 0, { item: '', amount: '' });
        };

        // 删除分项预算
        const removeItem = (index: number) => {
            formData.value.budget.items.splice(index, 1);
        };

        // 文件预览
        const handlePreview = (file: any) => {
            console.log('文件预览:', file);
        };

        // 文件移除
        const handleRemove = (file: any) => {
            console.log('文件移除:', file);
        };

        // 通过侧边栏切换标签
        const handleTabSelect = (index: string) => {
            saveFormData(); // 在切换前保存当前数据
            activeTab.value = index;
        };

        return {
            activeTab,
            formData,
            nextTab,
            prevTab,
            submitForm,
            addItem,
            removeItem,
            handlePreview,
            handleRemove,
            handleTabSelect
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