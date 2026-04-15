<template>
    <el-card class="main-card" style="margin-top:20px;">
        <div class="content-wrapper">
            <!-- 左侧侧边栏 -->
            <div class="left-sidebar">
                <el-menu :default-active="activeTab" @select="handleTabSelect" class="sidebar-menu">
                    <el-menu-item index="basic">
                        <el-icon><Document /></el-icon>
                        基本情况
                    </el-menu-item>
                    <el-menu-item index="leader">
                        <el-icon><User /></el-icon>
                        基地负责人情况
                    </el-menu-item>
                    <el-menu-item index="members">
                        <el-icon><User /></el-icon>
                        基地成员情况
                    </el-menu-item>
                    <el-menu-item index="foundation">
                        <el-icon><House /></el-icon>
                        现有基础
                    </el-menu-item>
                    <el-menu-item index="target">
                        <el-icon><Aim /></el-icon>
                        目标任务
                    </el-menu-item>
                    <el-menu-item index="measures">
                        <el-icon><Collection /></el-icon>
                        建设思路举措
                    </el-menu-item>
                    <el-menu-item index="directions">
                        <el-icon><Location /></el-icon>
                        主要研究方向
                    </el-menu-item>
                    <el-menu-item index="support">
                        <el-icon><OfficeBuilding /></el-icon>
                        依托高校支持举措
                    </el-menu-item>
                    <el-menu-item index="attachments">
                        <el-icon><Paperclip /></el-icon>
                        其他材料附件
                    </el-menu-item>
                </el-menu>
            </div>

            <!-- 右侧内容 -->
            <div class="right-content">
                <!-- 基本情况 -->
                <div v-if="activeTab === 'basic'">
                    <h3>基本情况</h3>
                    <el-form label-width="140px">
                        <el-row :gutter="20">
                            <el-col :span="24">
                                <el-form-item label="基地名称">
                                    <span class="form-value">{{ formData.base_name || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="基地负责人">
                                    <span class="form-value">{{ formData.base_leader_name || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="依托高校">
                                    <span class="form-value">{{ formData.rely_university || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="联系人">
                                    <span class="form-value">{{ formData.contact_person || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="联系电话">
                                    <span class="form-value">{{ formData.contact_phone || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="成立时间">
                                    <span class="form-value">{{ formData.establish_time || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="是否实体">
                                    <el-tag :type="formData.is_entity === '是' ? 'success' : 'info'">
                                        {{ formData.is_entity || '暂无' }}
                                    </el-tag>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="专兼职人员总数">
                                    <span class="form-value">{{ formData.staff_count_full_part_time || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="办公面积(平米)">
                                    <span class="form-value">{{ formData.office_area || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="主要依托学科">
                                    <span class="form-value">{{ formData.main_rely_subject || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="学科说明">
                                    <span class="form-value">{{ formData.main_subject_desc || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20" v-for="(item, index) in formData.other_rely_subjects" :key="index">
                            <el-col :span="12">
                                <el-form-item :label="'其他依托学科' + (index + 1)">
                                    <span class="form-value">{{ item.subject_name || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="学科说明">
                                    <span class="form-value">{{ item.subject_desc || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <h3 style="margin-top: 30px; margin-bottom: 15px;">基地主要研究方向信息</h3>
                        <el-table :data="formData.main_research_directions || []" border style="width: 100%">
                            <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
                            <el-table-column prop="direction_name" label="研究方向名称" min-width="100"></el-table-column>
                            <el-table-column prop="academic_leader_name" label="学术带头人姓名" min-width="80"></el-table-column>
                            <el-table-column prop="leader_title_post" label="职务 / 职称" min-width="100"></el-table-column>
                        </el-table>
                    </el-form>
                </div>

                <!-- 基地负责人情况 -->
                <div v-if="activeTab === 'leader'">
                    <h3>基地负责人基本信息</h3>
                    <el-form label-width="140px">
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="姓名">
                                    <span class="form-value">{{ formData.base_leader_name || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="性别">
                                    <span class="form-value">{{ formData.base_leader_gender || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="出生日期">
                                    <span class="form-value">{{ formData.base_leader_birth_date || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="学位">
                                    <span class="form-value">{{ formData.base_leader_degree || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="职称">
                                    <span class="form-value">{{ formData.base_leader_title || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="行政职务">
                                    <span class="form-value">{{ formData.base_leader_admin_post || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="手机号码">
                                    <span class="form-value">{{ formData.base_leader_mobile || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="电子邮箱">
                                    <span class="form-value">{{ formData.base_leader_email || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="所在部门/院系">
                                    <span class="form-value">{{ formData.base_leader_department || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="主要研究方向">
                                    <span class="form-value">{{ formData.base_leader_research_direction || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="24">
                                <el-form-item label="已入选省部级及以上重要人才计划">
                                    <span class="form-value" style="white-space: pre-wrap;">{{ formData.base_leader_talent_plan || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>

                    <h3 style="margin-top: 30px;">负责人主要简介</h3>
                    <div class="rich-text-content" v-html="formData.leader_main_intro || '暂无内容'"></div>

                    <h3 style="margin-top: 30px;">主持重要科研项目（限5项以内）</h3>
                    <el-table :data="formData.leader_hosted_projects || []" border style="margin-top: 10px;">
                        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
                        <el-table-column prop="project_name" label="项目名称" min-width="100px"></el-table-column>
                        <el-table-column prop="project_source" label="项目来源" min-width="100px"></el-table-column>
                        <el-table-column prop="funding" label="资助经费" width="120px"></el-table-column>
                        <el-table-column prop="start_end_time" label="起止时间" width="200px"></el-table-column>
                        <el-table-column prop="is_completed" label="是否完成" width="90px"></el-table-column>
                    </el-table>

                    <h3 style="margin-top: 30px;">以第一完成人获科研成果奖励情况（限5项以内）</h3>
                    <el-table :data="formData.leader_awards || []" border style="margin-top: 10px;">
                        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
                        <el-table-column prop="achievement_name" label="成果名称" min-width="100px"></el-table-column>
                        <el-table-column prop="award_name" label="奖励名称" min-width="100px"></el-table-column>
                        <el-table-column prop="award_level" label="等级" min-width="80px"></el-table-column>
                        <el-table-column prop="award_unit" label="授予单位" min-width="100px"></el-table-column>
                        <el-table-column prop="award_time" label="授予时间" width="110px"></el-table-column>
                    </el-table>

                    <h3 style="margin-top: 30px;">以第一作者或通讯作者身份发表标志性著作、论文情况（限10项以内）</h3>
                    <el-table :data="formData.leader_publications || []" border style="margin-top: 10px;">
                        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
                        <el-table-column prop="publication_name" label="论文或著作名称" min-width="100px"></el-table-column>
                        <el-table-column prop="journal_publisher" label="期刊或出版社名称" min-width="100px"></el-table-column>
                        <el-table-column prop="publish_time" label="发表时间" width="110px"></el-table-column>
                        <el-table-column prop="author_role" label="作者情况（第一/通讯）" min-width="100px"></el-table-column>
                        <el-table-column prop="citation_index_info" label="引用、收录、转载情况" min-width="100px"></el-table-column>
                    </el-table>

                    <h3 style="margin-top: 30px;">以第一完成人身份完成咨政建言情况（限5项以内）</h3>
                    <el-table :data="formData.leader_policy_reports || []" border style="margin-top: 10px;">
                        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
                        <el-table-column prop="report_name" label="咨政报告名称" min-width="100px"></el-table-column>
                        <el-table-column prop="author" label="作者" min-width="100px"></el-table-column>
                        <el-table-column prop="adopt_time" label="采纳时间" width="110px"></el-table-column>
                        <el-table-column prop="adopt_feedback" label="采纳批示及社会效益情况" min-width="100px"></el-table-column>
                    </el-table>

                    <h3 style="margin-top: 30px;">完成其他重要成果（限5项以内）</h3>
                    <el-table :data="formData.leader_other_achievements || []" border style="margin-top: 10px;">
                        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
                        <el-table-column prop="achievement_name" label="成果名称" min-width="100px"></el-table-column>
                        <el-table-column prop="author" label="作者" min-width="100px"></el-table-column>
                        <el-table-column prop="publish_time" label="发表时间" width="110px"></el-table-column>
                        <el-table-column prop="achievement_type" label="成果类型" min-width="100px"></el-table-column>
                        <el-table-column prop="achievement_intro" label="成果简介" min-width="100px"></el-table-column>
                    </el-table>
                </div>

                <!-- 基地成员情况 -->
                <div v-if="activeTab === 'members'">
                    <h3>主要学术骨干情况</h3>
                    
                    <h4 style="margin-top: 20px; margin-bottom: 10px;">专职核心成员</h4>
                    <el-table :data="formData.full_time_core_members || []" border>
                        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
                        <el-table-column prop="name" label="姓名" min-width="80"></el-table-column>
                        <el-table-column prop="gender" label="性别" width="60"></el-table-column>
                        <el-table-column prop="birth_date" label="出生年月" width="90"></el-table-column>
                        <el-table-column prop="title_degree" label="职称/学位" min-width="100px"></el-table-column>
                        <el-table-column prop="research_direction" label="研究方向" min-width="100px"></el-table-column>
                        <el-table-column prop="affiliation" label="所在单位" min-width="100px"></el-table-column>
                        <el-table-column prop="duty" label="成员分工" min-width="100px"></el-table-column>
                    </el-table>

                    <h4 style="margin-top: 30px; margin-bottom: 10px;">兼职核心成员</h4>
                    <el-table :data="formData.part_time_core_members || []" border>
                        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
                        <el-table-column prop="name" label="姓名" min-width="80"></el-table-column>
                        <el-table-column prop="gender" label="性别" width="60"></el-table-column>
                        <el-table-column prop="birth_date" label="出生年月" width="90"></el-table-column>
                        <el-table-column prop="title_degree" label="职称/学位" min-width="100px"></el-table-column>
                        <el-table-column prop="research_direction" label="研究方向" min-width="100px"></el-table-column>
                        <el-table-column prop="affiliation" label="所在单位" min-width="100px"></el-table-column>
                        <el-table-column prop="duty" label="成员分工" min-width="100px"></el-table-column>
                    </el-table>
                    <h3 style="margin-top: 30px;">专职秘书</h3>
                    <el-form label-width="100px">
                        <el-row :gutter="20">
                            <el-col :span="8">
                                <el-form-item label="姓名">
                                    <span class="form-value">{{ formData.full_time_secretary_name || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="性别">
                                    <span class="form-value">{{ formData.full_time_secretary_gender || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="出生年月">
                                    <span class="form-value">{{ formData.full_time_secretary_birth_date || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="8">
                                <el-form-item label="电话">
                                    <span class="form-value">{{ formData.full_time_secretary_telephone || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="手机">
                                    <span class="form-value">{{ formData.full_time_secretary_mobile || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="电子邮箱">
                                    <span class="form-value">{{ formData.full_time_secretary_email || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="8">
                                <el-form-item label="专业职称">
                                    <span class="form-value">{{ formData.full_time_secretary_title || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="学历">
                                    <span class="form-value">{{ formData.full_time_secretary_education || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="学位">
                                    <span class="form-value">{{ formData.full_time_secretary_degree || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                </div>

                <!-- 现有基础 -->
                <div v-if="activeTab === 'foundation'">
                    <h3>现有基础</h3>
                    <div v-if="formData.existing_foundation" class="rich-text-content" v-html="formData.existing_foundation"></div>
                    <el-empty v-else description="暂无内容"></el-empty>
                </div>

                <!-- 目标任务 -->
                <div v-if="activeTab === 'target'">
                    <h3>目标任务</h3>
                    <div v-if="formData.target_task" class="rich-text-content" v-html="formData.target_task"></div>
                    <el-empty v-else description="暂无内容"></el-empty>
                </div>

                <!-- 建设思路举措 -->
                <div v-if="activeTab === 'measures'">
                    <h3>建设思路举措</h3>
                    <div v-if="formData.construction_measures" class="rich-text-content" v-html="formData.construction_measures"></div>
                    <el-empty v-else description="暂无内容"></el-empty>
                </div>

                <!-- 主要研究方向 -->
                <div v-if="activeTab === 'directions'">
                    <h3>主要研究方向与内容</h3>
                    <div v-if="formData.research_directions_detail?.length > 0">
                        <div 
                            v-for="(item, index) in formData.research_directions_detail" 
                            :key="index" 
                            class="direction-box">
                            <h4 class="direction-title">主要研究方向{{ index + 1 }} <span style="margin-left: 100px;">名称：{{ item.direction_name || '未命名' }}</span></h4>
                            <div class="direction-content">
                                <div v-if="item.content" class="rich-text-content" v-html="item.content"></div>
                                <el-empty v-else description="暂无内容"></el-empty>
                            </div>
                        </div>
                    </div>
                    <el-empty v-else description="暂无内容"></el-empty>
                </div>

                <!-- 依托高校支持举措 -->
                <div v-if="activeTab === 'support'">
                    <h3>依托高校支持举措</h3>
                    <div v-if="formData.university_support" class="rich-text-content" v-html="formData.university_support"></div>
                    <el-empty v-else description="暂无内容"></el-empty>
                </div>

                <!-- 其他材料附件 -->
                <div v-if="activeTab === 'attachments'">
                    <h3>其他材料附件</h3>
                    <div v-if="formData.attachments_list?.length > 0">
                        <div v-for="(file, index) in formData.attachments_list" :key="index" class="file-item">
                            <el-icon><Document /></el-icon>
                            <span class="file-name">{{ file.name }}</span>
                            <el-button type="primary" link size="small" @click="downloadFile(file)">下载</el-button>
                        </div>
                    </div>
                    <el-empty v-else description="暂无附件"></el-empty>
                </div>
            </div>
        </div>
    </el-card>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, User, House, Aim, List, Location, OfficeBuilding, Paperclip, Collection } from '@element-plus/icons-vue';
import request from "@/utils/request.js";

const activeTab = ref('basic');
const formData = ref({});

const props = defineProps({
    id: {
        type: [String, Number],
        required: true
    }
});

const handleTabSelect = (index) => {
    activeTab.value = index;
};

const downloadFile = (file) => {
    const url = file.url;
    if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name || 'download';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        ElMessage.warning('文件链接无效');
    }
};

const fetchApplicationDetails = async (id) => {
    try {
        formData.value = {}; // 每次获取前重置，防止数据污染和闪烁
        const response = await request.get(`/research_base_apply_for/select/${id}`);
        if (response.code === '200') {
            formData.value = response.data;
            
            // 解析 JSON 字符串字段
            try {
                if (typeof formData.value.other_rely_subjects === 'string') {
                    formData.value.other_rely_subjects = JSON.parse(formData.value.other_rely_subjects);
                }
                if (typeof formData.value.main_research_directions === 'string') {
                    formData.value.main_research_directions = JSON.parse(formData.value.main_research_directions);
                }
                if (typeof formData.value.leader_hosted_projects === 'string') {
                    formData.value.leader_hosted_projects = JSON.parse(formData.value.leader_hosted_projects);
                }
                if (typeof formData.value.leader_awards === 'string') {
                    formData.value.leader_awards = JSON.parse(formData.value.leader_awards);
                }
                if (typeof formData.value.leader_publications === 'string') {
                    formData.value.leader_publications = JSON.parse(formData.value.leader_publications);
                }
                if (typeof formData.value.leader_policy_reports === 'string') {
                    formData.value.leader_policy_reports = JSON.parse(formData.value.leader_policy_reports);
                }
                if (typeof formData.value.leader_other_achievements === 'string') {
                    formData.value.leader_other_achievements = JSON.parse(formData.value.leader_other_achievements);
                }
                if (typeof formData.value.full_time_core_members === 'string') {
                    formData.value.full_time_core_members = JSON.parse(formData.value.full_time_core_members);
                }
                if (typeof formData.value.part_time_core_members === 'string') {
                    formData.value.part_time_core_members = JSON.parse(formData.value.part_time_core_members);
                }
                if (typeof formData.value.research_directions_detail === 'string') {
                    formData.value.research_directions_detail = JSON.parse(formData.value.research_directions_detail);
                }
                if (typeof formData.value.attachments_list === 'string') {
                    formData.value.attachments_list = JSON.parse(formData.value.attachments_list);
                }
            } catch (e) {
                console.error("JSON 解析错误", e);
            }
        } else {
            ElMessage.error(response.msg || '获取申请详情失败');
        }
    } catch (error) {
        console.error('获取详细信息失败', error);
        ElMessage.error('获取申请详情失败');
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
    margin: 0 auto;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    flex: 1;
}

.content-wrapper {
    display: flex;
    width: 100%;
    height: 100%;
}

.left-sidebar {
    margin: 0 10px;
    border-right: 1px solid #eaeaea;
    min-width: 200px;
}

.sidebar-menu {
    border-right: none;
}

.el-menu-item.is-active {
    color: #409eff;
    font-weight: 600;
    background-color: #ecf5ff;
}

.el-menu-item:hover {
    background-color: #f5f7fa;
}

.right-content {
    flex: 1;
    padding: 0 15px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    overflow-y: auto;
    height: auto;
}

.form-value {
    color: #333;
    font-weight: 500;
}

.rich-text-content {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 15px;
    background-color: #fcfcfc;
    height: auto;
    word-break: break-word;
}

.direction-box {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    margin-bottom: 20px;
    background-color: #fff;
}

.direction-title {
    margin: 0;
    padding: 12px 15px;
    border-bottom: 1px solid #dcdfe6;
    background-color: #f5f7fa;
    font-weight: bold;
    color: #303133;
}

.direction-content {
    padding: 15px;
}

.direction-content .rich-text-content {
    border: none;
    background-color: transparent;
    padding: 0;
}

.signature-img {
    max-width: 80px;
    max-height: 40px;
    object-fit: contain;
}

.file-item {
    display: flex;
    align-items: center;
    padding: 10px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    margin-bottom: 10px;
}

.file-item .el-icon {
    margin-right: 8px;
    font-size: 18px;
    color: #909399;
}

.file-name {
    flex: 1;
    margin-right: 15px;
    color: #606266;
}

:deep(.el-table) {
    --el-table-header-bg-color: #f5f7fa;
    --el-table-header-text-color: #333;
}
:deep(.el-table th.el-table__cell) {
    background-color: var(--el-table-header-bg-color) !important;
}
</style>