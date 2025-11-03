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
                    <el-menu-item index="members">
                        <el-icon><User /></el-icon>
                        实验室成员
                    </el-menu-item>
                    <el-menu-item index="foundation">
                        <el-icon><House /></el-icon>
                        建设基础 & 建设目标和发展思路
                    </el-menu-item>
                    <el-menu-item index="keyTasks">
                        <el-icon><List /></el-icon>
                        重点任务和建设举措
                    </el-menu-item>
                    <el-menu-item index="system">
                        <el-icon><Setting /></el-icon>
                        制度建设 & 预期成效及标志性成果
                    </el-menu-item>
                    <el-menu-item index="organization">
                        <el-icon><OfficeBuilding /></el-icon>
                        组织保障
                    </el-menu-item>
                    <el-menu-item index="budget">
                        <el-icon><Money /></el-icon>
                        经费预算
                    </el-menu-item>
                    <el-menu-item index="attachments">
                        <el-icon><Paperclip /></el-icon>
                        其他材料
                    </el-menu-item>
                </el-menu>
            </div>

            <!-- 右侧内容 -->
            <div class="right-content">
                <!-- 基本情况 -->
                <div v-if="activeTab === 'basic'">
                    <h3>基本情况</h3>
                    <el-form label-width="140px">
                        <!-- 第一行：实验室名称、实验室类别 -->
                        <el-row :gutter="20">
                            <el-col :span="11">
                                <el-form-item label="实验室名称">
                                    <span class="form-value">{{ (formData.basicInfo?.institutionName || formData.institutionName) || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="13">
                                <el-form-item label="实验室类别">
                                    <el-tag :type="(formData.basicInfo?.labCategory || formData.labCategory) === '重点建设' ? 'success' : 'warning'">
                                        {{ (formData.basicInfo?.labCategory || formData.labCategory) || '暂无' }}
                                    </el-tag>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <!-- 第二行：成立时间、是否实体 -->
                        <el-row :gutter="20">
                            <el-col :span="11">
                                <el-form-item label="成立时间">
                                    <span class="form-value">{{ (formData.basicInfo?.establishmentDate || formData.establishmentDate) || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="13">
                                <el-form-item label="是否实体">
                                    <el-tag :type="(formData.basicInfo?.isEntity || formData.isEntity) === '1' ? 'success' : 'info'">
                                        {{ (formData.basicInfo?.isEntity || formData.isEntity) === '1' ? '是' : ((formData.basicInfo?.isEntity || formData.isEntity) === '0' ? '否' : '暂无') }}
                                    </el-tag>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <!-- 第三行：依托学校、建设周期 -->
                        <el-row :gutter="20">
                            <el-col :span="11">
                                <el-form-item label="依托学校">
                                    <span class="form-value">{{ (formData.basicInfo?.affiliatedSchool || formData.affiliatedSchool) || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="13">
                                <el-form-item label="建设周期">
                                    <span class="form-value">
                                        {{ (formData.basicInfo?.buildPeriod || formData.buildPeriod) && (formData.basicInfo?.buildPeriod || formData.buildPeriod).length === 2 
                                            ? `${(formData.basicInfo?.buildPeriod || formData.buildPeriod)[0]} 至 ${(formData.basicInfo?.buildPeriod || formData.buildPeriod)[1]}` 
                                            : '暂无' }}
                                    </span>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <!-- 第四行：总面积、实验室面积 -->
                        <el-row :gutter="20">
                            <el-col :span="11">
                                <el-form-item label="总面积（平米）">
                                    <span class="form-value">{{ (formData.basicInfo?.totalArea || formData.totalArea) || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="13">
                                <el-form-item label="实验室面积（平米）">
                                    <span class="form-value">{{ (formData.basicInfo?.labArea || formData.labArea) || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <!-- 第五行：主要依托学科、其他依托学科 -->
                        <el-row :gutter="20">
                            <el-col :span="11">
                                <el-form-item label="主要依托学科">
                                    <span class="form-value">{{ (formData.basicInfo?.mainDiscipline || formData.mainDiscipline) || '暂无' }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="13">
                                <el-form-item label="其他依托学科">
                                    <div v-if="(formData.basicInfo?.direction?.disciplines || formData.direction?.disciplines)?.length">
                                        <div style="margin: 0;">
                                            <div 
                                                v-for="(discipline, index) in (formData.basicInfo?.direction?.disciplines || formData.direction?.disciplines)" 
                                                :key="index"
                                            >
                                                <span>{{ discipline.name }}</span>
                                                <span v-if="discipline.description"> - {{ discipline.description }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span v-else class="form-value">暂无</span>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <!-- 研究方向 -->
                        <el-form-item label="研究方向">
                            <div v-if="(formData.basicInfo?.direction?.researches || formData.direction?.researches)?.length">
                                <div style="margin: 0;">
                                    <div 
                                        v-for="(research, index) in (formData.basicInfo?.direction?.researches || formData.direction?.researches)" 
                                        :key="index"
                                    >
                                        {{ research.name || research }}
                                    </div>
                                </div>
                            </div>
                            <span v-else class="form-value">暂无</span>
                        </el-form-item>
                    </el-form>
                </div>

                <!-- 实验室成员 -->
                <div v-if="activeTab === 'members'">
                    <h3>实验室成员</h3>
                    <el-form label-width="120px" v-if="getMembersList().length > 0">
                        <template v-for="(member, index) in getMembersList()" :key="index">
                            <h4 v-if="index === 0" style="margin-top: 15px; margin-bottom: 10px; color: #409EFF;">实验室主任</h4>
                            <h4 v-if="index === 1" style="margin-top: 15px; margin-bottom: 10px; color: #409EFF;">实验室副主任</h4>
                            <h4 v-if="index === 2" style="margin-top: 15px; margin-bottom: 10px; color: #409EFF;">管理委员会主任</h4>
                            <h4 v-if="index === 3" style="margin-top: 15px; margin-bottom: 10px; color: #409EFF;">学术委员会主任</h4>
                            
                            <!-- 成员信息表单 -->
                            <div style="border: 1px solid #EBEEF5; border-radius: 4px; padding: 12px; margin-bottom: 15px; background-color: #FAFAFA;">
                                <!-- 第一行：姓名、出生年月 -->
                                <el-row :gutter="20" style="margin-bottom: 10px;">
                                    <el-col :span="12">
                                        <el-form-item label="姓名">
                                            <span class="form-value">{{ member.name || '暂无' }}</span>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item label="出生年月">
                                            <span class="form-value">{{ member.birthDate || '暂无' }}</span>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                
                                <!-- 第二行：手机号码、职务/职称 -->
                                <el-row :gutter="20" style="margin-bottom: 10px;">
                                    <el-col :span="12">
                                        <el-form-item label="手机号码">
                                            <span class="form-value">{{ member.phone || '暂无' }}</span>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item label="职务/职称">
                                            <span class="form-value">{{ member.title || '暂无' }}</span>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                
                                <!-- 第三行：任职时间、所在学科 -->
                                <el-row :gutter="20" style="margin-bottom: 10px;">
                                    <el-col :span="12">
                                        <el-form-item label="任职时间">
                                            <span class="form-value">{{ member.labTenure || '暂无' }}</span>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item label="所在学科">
                                            <span class="form-value">{{ member.discipline || '暂无' }}</span>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                
                                <!-- 第四行：研究方向（独占一行） -->
                                <el-row style="margin-bottom: 10px;">
                                    <el-col :span="24">
                                        <el-form-item label="研究方向">
                                            <span class="form-value">{{ member.researchDirection || '暂无' }}</span>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                
                                <!-- 第五行：主要学术荣誉称号（独占一行） -->
                                <el-row>
                                    <el-col :span="24">
                                        <el-form-item label="主要学术荣誉称号(限2项)">
                                            <span class="form-value">{{ member.academicHonors || '暂无' }}</span>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                            </div>
                        </template>
                    </el-form>
                    <div v-else style="text-align: center; padding: 40px; color: #909399;">
                        暂无成员信息
                    </div>

                    <!-- 人员队伍统计表格 -->
                    <div v-if="getTeamStatistics() && getTeamStatistics().length > 0" class="form-section" style="margin-top: 30px;">
                        <h4 style="color: #409EFF; margin-bottom: 20px; font-size: 16px; font-weight: bold;">人员队伍</h4>
                        <div class="team-table-container">
                            <table class="team-table">
                                <thead>
                                    <tr class="section-header">
                                        <th rowspan="2" style="width: 160px;">人员队伍数量</th>
                                        <th rowspan="2" style="width: 80px;">合计</th>
                                        <th colspan="3">教学科研人员</th>
                                        <th colspan="3">实验技术人员</th>
                                        <th rowspan="2" style="width: 80px;">其他人员</th>
                                    </tr>
                                    <tr class="section-header">
                                        <th style="width: 80px;">正高级</th>
                                        <th style="width: 80px;">副高级</th>
                                        <th style="width: 80px;">中级及以下</th>
                                        <th style="width: 80px;">正高级</th>
                                        <th style="width: 80px;">副高级</th>
                                        <th style="width: 80px;">中级及以下</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- 合计行 -->
                                    <tr v-if="getTeamStatistics()[0]">
                                        <td class="category-cell">合计</td>
                                        <td>{{ getTeamStatistics()[0].total || 0 }}</td>
                                        <td>{{ getTeamStatistics()[0].seniorTeacher || 0 }}</td>
                                        <td>{{ getTeamStatistics()[0].associateTeacher || 0 }}</td>
                                        <td>{{ getTeamStatistics()[0].middleTeacher || 0 }}</td>
                                        <td>{{ getTeamStatistics()[0].seniorTech || 0 }}</td>
                                        <td>{{ getTeamStatistics()[0].associateTech || 0 }}</td>
                                        <td>{{ getTeamStatistics()[0].middleTech || 0 }}</td>
                                        <td>{{ getTeamStatistics()[0].others || 0 }}</td>
                                    </tr>
                                    <!-- 专职行 -->
                                    <tr v-if="getTeamStatistics()[1]">
                                        <td class="category-cell">专职</td>
                                        <td>{{ getTeamStatistics()[1].total || 0 }}</td>
                                        <td>{{ getTeamStatistics()[1].seniorTeacher || 0 }}</td>
                                        <td>{{ getTeamStatistics()[1].associateTeacher || 0 }}</td>
                                        <td>{{ getTeamStatistics()[1].middleTeacher || 0 }}</td>
                                        <td>{{ getTeamStatistics()[1].seniorTech || 0 }}</td>
                                        <td>{{ getTeamStatistics()[1].associateTech || 0 }}</td>
                                        <td>{{ getTeamStatistics()[1].middleTech || 0 }}</td>
                                        <td>{{ getTeamStatistics()[1].others || 0 }}</td>
                                    </tr>
                                    <!-- 兼职行 -->
                                    <tr v-if="getTeamStatistics()[2]">
                                        <td class="category-cell">兼职</td>
                                        <td>{{ getTeamStatistics()[2].total || 0 }}</td>
                                        <td>{{ getTeamStatistics()[2].seniorTeacher || 0 }}</td>
                                        <td>{{ getTeamStatistics()[2].associateTeacher || 0 }}</td>
                                        <td>{{ getTeamStatistics()[2].middleTeacher || 0 }}</td>
                                        <td>{{ getTeamStatistics()[2].seniorTech || 0 }}</td>
                                        <td>{{ getTeamStatistics()[2].associateTech || 0 }}</td>
                                        <td>{{ getTeamStatistics()[2].middleTech || 0 }}</td>
                                        <td>{{ getTeamStatistics()[2].others || 0 }}</td>
                                    </tr>
                                    <!-- 61岁及以上行 -->
                                    <tr v-if="getTeamStatistics()[3]">
                                        <td class="category-cell">61岁及以上</td>
                                        <td>{{ getTeamStatistics()[3].total || 0 }}</td>
                                        <td>{{ getTeamStatistics()[3].seniorTeacher || 0 }}</td>
                                        <td>{{ getTeamStatistics()[3].associateTeacher || 0 }}</td>
                                        <td>{{ getTeamStatistics()[3].middleTeacher || 0 }}</td>
                                        <td>{{ getTeamStatistics()[3].seniorTech || 0 }}</td>
                                        <td>{{ getTeamStatistics()[3].associateTech || 0 }}</td>
                                        <td>{{ getTeamStatistics()[3].middleTech || 0 }}</td>
                                        <td>{{ getTeamStatistics()[3].others || 0 }}</td>
                                    </tr>
                                    <!-- 45-60岁行 -->
                                    <tr v-if="getTeamStatistics()[4]">
                                        <td class="category-cell">45-60岁</td>
                                        <td>{{ getTeamStatistics()[4].total || 0 }}</td>
                                        <td>{{ getTeamStatistics()[4].seniorTeacher || 0 }}</td>
                                        <td>{{ getTeamStatistics()[4].associateTeacher || 0 }}</td>
                                        <td>{{ getTeamStatistics()[4].middleTeacher || 0 }}</td>
                                        <td>{{ getTeamStatistics()[4].seniorTech || 0 }}</td>
                                        <td>{{ getTeamStatistics()[4].associateTech || 0 }}</td>
                                        <td>{{ getTeamStatistics()[4].middleTech || 0 }}</td>
                                        <td>{{ getTeamStatistics()[4].others || 0 }}</td>
                                    </tr>
                                    <!-- 45岁以下行 -->
                                    <tr v-if="getTeamStatistics()[5]">
                                        <td class="category-cell">45岁以下</td>
                                        <td>{{ getTeamStatistics()[5].total || 0 }}</td>
                                        <td>{{ getTeamStatistics()[5].seniorTeacher || 0 }}</td>
                                        <td>{{ getTeamStatistics()[5].associateTeacher || 0 }}</td>
                                        <td>{{ getTeamStatistics()[5].middleTeacher || 0 }}</td>
                                        <td>{{ getTeamStatistics()[5].seniorTech || 0 }}</td>
                                        <td>{{ getTeamStatistics()[5].associateTech || 0 }}</td>
                                        <td>{{ getTeamStatistics()[5].middleTech || 0 }}</td>
                                        <td>{{ getTeamStatistics()[5].others || 0 }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- 人才数量统计表格 -->
                    <div v-if="getTalentStatistics()" class="form-section">
                        <div class="table-container">
                            <table class="statistics-table">
                                <tbody>
                                    <!-- 第一行：人才数量标题和国家级高层次人才、国家级青年人才 -->
                                    <tr>
                                        <td style="font-weight: bold;background-color: #f0f5f9; width: 130px;" rowspan="2">人才数量</td>
                                        <td class="label-cell">国家级高层次人才</td>
                                        <td class="display-cell">
                                            <span>{{ getTalentStatistics().nationalHighLevel || 0 }}</span>
                                            <span style="margin-left: 5px; font-size: 12px; color: #666;">人</span>
                                        </td>
                                        <td class="label-cell">国家级青年人才</td>
                                        <td class="display-cell">
                                            <span>{{ getTalentStatistics().nationalYoung || 0 }}</span>
                                            <span style="margin-left: 5px; font-size: 12px; color: #666;">人</span>
                                        </td>
                                    </tr>
                                    <!-- 第二行：省部级人才 -->
                                    <tr>
                                        <td class="label-cell">省部级人才</td>
                                        <td class="display-cell">
                                            <span>{{ getTalentStatistics().provincial || 0 }}</span>
                                            <span style="margin-left: 5px; font-size: 12px; color: #666;">人</span>
                                        </td>
                                        <td class="empty-cell"></td>
                                        <td class="empty-cell"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- 建设基础 & 建设目标和发展思路 -->
                <div v-if="activeTab === 'foundation'">
                    <h3>建设基础</h3>
                    <el-form label-width="0px" style="margin-bottom: 30px;">
                        <el-form-item>
                            <div class="content-display" style="height: 35vh; overflow-y: auto;">
                                {{ formData.foundation?.foundation || '暂无内容' }}
                            </div>
                        </el-form-item>
                    </el-form>
                    
                    <h3>建设目标和发展思路</h3>
                    <el-form label-width="0px">
                        <el-form-item>
                            <div class="content-display" style="height: 35vh; overflow-y: auto;">
                                {{ formData.foundation?.goals || '暂无内容' }}
                            </div>
                        </el-form-item>
                    </el-form>
                </div>

                <!-- 重点任务和建设举措 -->
                <div v-if="activeTab === 'keyTasks'" style="height: calc(100vh - 200px); display: flex; flex-direction: column;">
                    <h3 style="margin-bottom: 20px;">重点任务和建设举措</h3>
                    <el-form label-width="0px">
                        <el-form-item>
                            <div class="content-display" style="height: 40vh; overflow-y: auto;">
                                {{ formData.keyTasks?.keyTasks || '暂无内容' }}
                            </div>
                        </el-form-item>
                    </el-form>
                </div>

                <!-- 制度建设 & 预期成效及标志性成果 -->
                <div v-if="activeTab === 'system'">
                    <h3>制度建设</h3>
                    <el-form label-width="0px" style="margin-bottom: 30px;">
                        <el-form-item>
                            <div class="content-display" style="height: 35vh; overflow-y: auto;">
                                {{ formData.systemBuilding?.systemBuilding || '暂无内容' }}
                            </div>
                        </el-form-item>
                    </el-form>
                    
                    <h3>预期成效及标志性成果</h3>
                    <el-form label-width="0px">
                        <el-form-item>
                            <div class="content-display" style="height: 35vh; overflow-y: auto;">
                                {{ formData.systemBuilding?.expectedResults || '暂无内容' }}
                            </div>
                        </el-form-item>
                    </el-form>
                </div>

                <!-- 组织保障 -->
                <div v-if="activeTab === 'organization'">
                    <h3>组织保障</h3>
                    <el-form label-width="0px">
                        <el-form-item>
                            <div class="content-display" style="height: 40vh; overflow-y: auto;">
                                {{ formData.organization?.organizationalSupport || '暂无内容' }}
                            </div>
                        </el-form-item>
                    </el-form>
                </div>

                <!-- 经费预算 -->
                <div v-if="activeTab === 'budget'">
                    <h3>经费预算</h3>
                    <div class="budget-table-container">
                        <table class="budget-table">
                            <thead>
                                <tr>
                                    <th rowspan="2" class="year-header">年度</th>
                                    <th colspan="3" class="funding-source-header">资金来源（万元）</th>
                                    <th rowspan="2" class="total-header">合计<br/>（万元）</th>
                                </tr>
                                <tr>
                                    <th class="sub-header">省财政拨付资金</th>
                                    <th class="sub-header">学校专项资金</th>
                                    <th class="sub-header">其他渠道经费投入</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="budget in formData.budget?.yearlyBudgets || []" :key="budget.year">
                                    <td class="year-cell">{{ budget.year }}</td>
                                    <td class="amount-cell">{{ budget.provincialFunds || '0' }}</td>
                                    <td class="amount-cell">{{ budget.schoolFunds || '0' }}</td>
                                    <td class="amount-cell">{{ budget.otherFunds || '0' }}</td>
                                    <td class="total-cell">{{ budget.total || '0' }}</td>
                                </tr>
                                <tr class="total-row" v-if="formData.budget?.yearlyBudgets?.length">
                                    <td class="year-cell total-label">合计</td>
                                    <td class="total-cell">{{ formData.budget.totalProvincialFunds || '0' }}</td>
                                    <td class="total-cell">{{ formData.budget.totalSchoolFunds || '0' }}</td>
                                    <td class="total-cell">{{ formData.budget.totalOtherFunds || '0' }}</td>
                                    <td class="total-cell grand-total">{{ formData.budget.grandTotal || '0' }}</td>
                                </tr>
                                <tr v-if="!formData.budget?.yearlyBudgets?.length">
                                    <td colspan="5" class="empty-cell">暂无经费预算</td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="budget-note">
                            注：经费预算和使用依据《高等学校哲学社会科学繁荣计划专项资金管理办法》（财教〔2021〕285号）。
                        </div>
                    </div>
                </div>



                <!-- 其他材料 -->
                <div v-if="activeTab === 'attachments'">
                    <h3>其他材料</h3>
                    <div v-if="formData.attachments?.files?.length > 0">
                        <el-table :data="getAttachmentsList()" border style="width: 100%">
                            <el-table-column label="序号" type="index" width="60" align="center" />
                            <el-table-column label="文件名" prop="name" min-width="200">
                                <template #default="scope">
                                    <el-link :href="scope.row.url" target="_blank" class="file-link">
                                        <el-icon><Document /></el-icon>
                                        {{ scope.row.name }}
                                    </el-link>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <div v-else style="text-align: center; padding: 40px; color: #909399; background-color: #fafafa; border: 1px dashed #dcdfe6; border-radius: 4px;">
                        <el-icon size="48" color="#c0c4cc"><Document /></el-icon>
                        <p style="margin: 10px 0 0 0;">暂无附件材料</p>
                    </div>
                </div>
            </div>
        </div>
    </el-card>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { 
    Document, User, Grid, Money, Paperclip, OfficeBuilding, 
    House, List, Setting, School, DataAnalysis 
} from '@element-plus/icons-vue';
import request from "@/utils/request.js";

// 页面状态
const activeTab = ref('basic');

// 数据对象 - 根据后端返回的数据结构初始化
const formData = ref({
    id: '',
    laboratoryId: '',
    institutionName: '',
    labCategory: '',
    buildPeriod: [],
    affiliatedSchool: '',
    establishmentDate: '',
    totalStaff: null,
    fullTimeStaff: null,
    isEntity: '',
    totalArea: '',
    labArea: '',
    averageFunding: null,
    mainFundingSource: null,
    mainDiscipline: '',
    relyDisciplines: null,
    researchDirection: null,
    members: null,
    foundation: {
        foundation: '',
        goals: ''
    },
    keyTasks: {
        keyTasks: ''
    },
    systemBuilding: {
        systemBuilding: '',
        expectedResults: ''
    },
    organization: {
        organizationalSupport: ''
    },
    budget: {
        yearlyBudgets: [],
        totalProvincialFunds: '',
        totalSchoolFunds: '',
        totalOtherFunds: '',
        grandTotal: '',
        description: ''
    },
    attachmentsList: null,
    subMechanism: null,
    teamStatistics: [],
    createTime: '',
    updateTime: '',
    laboratoryMembers: null,
    direction: {
        disciplines: [],
        researches: []
    },
    buildings: {
        construacts: []
    },
    attachments: {
        files: []
    },
    basicInfo: {},
    newMembers: []
});

// 组件属性
const props = defineProps({
    id: {
        type: [String, Number],
        required: true
    }
});

// 方法定义
const handleTabSelect = (index) => {
    activeTab.value = index;
};

// 获取文件名
const getFileName = (url) => {
    if (!url) return '未知文件';
    const parts = url.split('/');
    return parts[parts.length - 1] || '未知文件';
};

// 获取成员列表数据
const getMembersList = () => {
    console.log('=== 调试成员数据 ===');
    console.log('formData.value:', formData.value);
    console.log('formData.value.laboratoryMembers:', formData.value.laboratoryMembers);
    console.log('formData.value.data:', formData.value.data);
    console.log('formData.value.members:', formData.value.members);
    console.log('formData.value.newMembers:', formData.value.newMembers);
    
    // 检查 newMembers 字段（根据调试信息，这里是实验室成员数据）
    if (formData.value.newMembers && Array.isArray(formData.value.newMembers)) {
        console.log('找到 newMembers 数据:', formData.value.newMembers);
        return formData.value.newMembers;
    }
    
    // 检查是否有成员数据
    if (formData.value.data && Array.isArray(formData.value.data) && formData.value.data.length > 0) {
        // 返回第一个数组（成员信息）
        return formData.value.data[0] || [];
    }
    
    // 兼容旧的数据结构
    if (formData.value.members && Array.isArray(formData.value.members)) {
        return formData.value.members;
    }
    
    // 检查 laboratoryMembers 字段
    if (formData.value.laboratoryMembers && Array.isArray(formData.value.laboratoryMembers)) {
        return formData.value.laboratoryMembers;
    }
    
    console.log('未找到任何成员数据，返回空数组');
    return [];
};

// 获取人员队伍统计数据
const getTeamStatistics = () => {
    console.log('=== 调试人员队伍统计数据 ===');
    console.log('formData.value.teamStatistics:', formData.value.teamStatistics);
    
    // 检查 teamStatistics 字段
    if (formData.value.teamStatistics && Array.isArray(formData.value.teamStatistics)) {
        console.log('找到 teamStatistics 数据:', formData.value.teamStatistics);
        return formData.value.teamStatistics;
    }
    
    console.log('未找到人员队伍统计数据，返回空数组');
    return [];
};

// 获取人才数量统计数据
const getTalentStatistics = () => {
    console.log('=== 调试人才数量统计数据 ===');
    console.log('formData.value.talentStatistics:', formData.value.talentStatistics);
    
    // 检查 talentStatistics 字段
    if (formData.value.talentStatistics && Array.isArray(formData.value.talentStatistics) && formData.value.talentStatistics.length > 0) {
        console.log('找到 talentStatistics 数据:', formData.value.talentStatistics);
        return formData.value.talentStatistics[0]; // 返回第一个对象，包含人才数量统计
    }
    
    console.log('未找到人才数量统计数据，返回空对象');
    return null;
};

// 获取附件列表数据
const getAttachmentsList = () => {
    console.log('=== 调试附件数据 ===');
    console.log('formData.value.attachments:', formData.value.attachments);
    
    if (formData.value.attachments?.files && Array.isArray(formData.value.attachments.files)) {
        return formData.value.attachments.files.map((fileUrl, index) => {
            // 从URL中提取文件名
            const fileName = fileUrl.split('/').pop() || `文件${index + 1}`;
            // 从文件名中提取文件类型
            const fileExtension = fileName.split('.').pop()?.toUpperCase() || 'UNKNOWN';
            
            return {
                name: fileName,
                type: fileExtension,
                url: fileUrl
            };
        });
    }
    
    console.log('未找到附件数据，返回空数组');
    return [];
};

// 获取文件类型标签样式
const getFileTypeTag = (fileType) => {
    const type = fileType?.toLowerCase();
    switch (type) {
        case 'pdf':
            return 'danger';
        case 'doc':
        case 'docx':
            return 'primary';
        case 'xls':
        case 'xlsx':
            return 'success';
        case 'ppt':
        case 'pptx':
            return 'warning';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return 'info';
        default:
            return '';
    }
};

// 下载文件
const downloadFile = (file) => {
    const url = file.url || file;
    if (url) {
        // 创建一个临时的a标签来下载文件
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name || url.split('/').pop() || 'download';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        ElMessage.warning('文件链接无效');
    }
};

// 获取申请详情
const fetchApplicationDetails = async (id) => {
    try {
        ElMessage({
            message: '查询编号为：' + id + '的申请记录！',
            type: 'success',
            duration: 1000
        });
        const response = await request.get(`/laboratory_apply_for/select/${id}`);
        formData.value = response.data;
        console.log('获取到的数据:', response.data);
    } catch (error) {
        console.error('获取详细信息失败', error);
        ElMessage.error('获取申请详情失败');
    }
};

// 监听 props.id 变化
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
    padding: 10px;
    border-right: 1px solid #eaeaea;
    min-width: 200px;
}

.right-content {
    flex: 1;
    padding: 0 15px 0 10px;
    overflow-y: auto;
    max-height: 70vh;
    margin-left: 10px;
}

.sidebar-menu {
    border: none;
}

.el-menu-item.is-active {
    color: #409eff;
    font-weight: 600;
    background-color: #ecf5ff;
}

.el-menu-item:hover {
    background-color: #f5f7fa;
}

.form-value {
    font-weight: 400;
    color: #303133;
    font-size: 12px;
}

.content-display {
    background-color: #f8f9fa;
    padding: 12px;
    border-radius: 3px;
    border: 1px solid #e4e7ed;
    height: 18vh;
    white-space: pre-wrap;
    line-height: 1.3;
    width: 100%;
    font-size: 12px;
}

.budget-section {
    margin-top: 8px;
}

.budget-summary {
    margin-top: 15px;
}

.summary-card {
    text-align: center;
    margin-bottom: 8px;
}

.summary-item {
    padding: 8px;
}

.summary-label {
    font-size: 12px;
    color: #909399;
    margin-bottom: 4px;
}

.summary-value {
    font-size: 16px;
    font-weight: bold;
    color: #409eff;
}

.total-card {
    background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
    color: white;
}

.total-card .summary-label,
.total-card .summary-value {
    color: white;
}

.total-value {
    font-size: 18px;
}

.file-link {
    color: #409eff;
    text-decoration: none;
    font-size: 13px;
}

.file-link:hover {
    text-decoration: underline;
}

:deep(.el-card__body) {
    width: 100%;
    padding: 10px 15px;
}

:deep(.el-table) {
    font-size: 13px;
}

:deep(.el-form-item__label) {
    font-weight: 500;
    font-size: 13px;
}

:deep(.el-form-item) {
    margin-bottom: 12px;
}

:deep(.el-row) {
    margin-bottom: 8px;
}

h3 {
    color: #303133;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 2px solid #409eff;
    font-size: 16px;
}

h4 {
    color: #606266;
    margin: 12px 0 8px 0;
    font-size: 14px;
}

/* 经费预算表格样式 */
.budget-table-container {
    margin: 15px 0;
}

.budget-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #c4c4c4;
    font-size: 13px;
    margin-bottom: 15px;
}

.budget-table th,
.budget-table td {
    border: 1px solid #c4c4c4;
    padding: 6px 8px;
    text-align: center;
    vertical-align: middle;
}

.budget-table th {
    background-color: #f0f5f9;
    font-weight: bold;
    font-size: 13px;
}

.year-header,
.total-header {
    width: 80px;
    background-color: #f0f5f9;
}

.funding-source-header {
    background-color: #f0f5f9;
}

.sub-header {
    background-color: #f0f5f9;
    font-size: 12px;
    width: 120px;
}

.year-cell {
    font-weight: bold;
    background-color: #f0f5f9;
}

.amount-cell {
    background-color: #fafafa;
}

.total-cell {
    font-weight: bold;
    background-color: #f0f5f9;
}

.total-row {
    background-color: #f0f5f9;
}

.total-row .total-label {
    font-weight: bold;
    background-color: #f0f5f9;
}

.grand-total {
    background-color: #e6f3ff;
    font-weight: bold;
    color: #1890ff;
}

.empty-cell {
    background-color: #fafafa;
    color: #999;
    font-style: italic;
}

.budget-note {
    margin-top: 12px;
    font-size: 12px;
    color: #666;
    line-height: 1.4;
}

.budget-note p {
    margin: 2px 0;
}

.team-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #c4c4c4;
    font-size: 13px;
}

.team-table th,
.team-table td {
    border: 1px solid #c4c4c4;
    padding: 6px 8px;
    text-align: center;
    vertical-align: middle;
}

.team-table .section-header {
    background-color: #f0f5f9;
    font-weight: bold;
}

.team-table .category-cell {
    font-weight: bold;
    background-color: #f0f5f9;
    width: 160px;
}

.team-table td {
    background-color: #fafafa;
}

/* 人才数量表格样式 */
.statistics-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #c4c4c4;
    font-size: 14px;
    margin-bottom: 20px;
}

.statistics-table th,
.statistics-table td {
    border: 1px solid #c4c4c4;
    padding: 8px 12px;
    text-align: center;
    vertical-align: middle;
}

.statistics-table .category-cell {
    font-weight: bold;
    background-color: #f0f5f9;
    width: 160px;
}

.statistics-table .label-cell {
    background-color: #f0f5f9;
    font-size: 13px;
    color: #333;
    width: 150px;
}

.statistics-table .display-cell {
    padding: 8px 12px;
    width: 120px;
    background-color: #fafafa;
    text-align: center;
}

.statistics-table .empty-cell {
    background-color: #f9f9f9;
}
</style>