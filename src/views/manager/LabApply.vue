<template>
    <el-card class="main-card">
        <h3 style="margin-left: 20px;">重点实验室申请</h3>
        <el-button type="primary" size="small" @click="labAddHandle" v-if="data.user.role ===  'NORMAL_LABORATORY'" style="margin-left: 20px;">新增</el-button>
        <div class="card" style="margin-top: 15px">
            <el-table stripe :data="labApplyList" :header-cell-style="{ backgroundColor: '#e9edf2' }" class="table-center" empty-text="暂无数据">
                <el-table-column prop="id" label="申请编号" />
                <el-table-column prop="institutionName" label="实验室名称" />
                <el-table-column prop="establishmentDate" label="成立日期" width="120" />
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
                <el-table-column label="操作" width="140">
                    <template v-slot="scope">
                        <el-tooltip content="查看申请详情" placement="bottom" effect="light">
                            <el-button @click="viewDetails(scope.row.id)" size="small">查看</el-button>
                        </el-tooltip>
                        <!-- 只有审核完毕的状态，才允许修改 -->
                        <!--<el-tooltip v-if="scope.row.applicationRecordList?.[0]?.applyStatus === 0"  content="修改申请信息" placement="bottom" effect="light">
                            <el-button @click="updateDetails(scope.row.id)" size="small" type="primary">修改</el-button>
                        </el-tooltip>-->
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
                        <el-step title="实验室成员" />
                        <el-step title="建设基础 & 建设目标和发展思路" />
                        <el-step title="重点任务和建设举措" />
                        <el-step title="制度建设 & 预期成效及标志性成果" />
                        <el-step title="组织保障" />
                        <el-step title="经费预算" />
                        <el-step title="其他材料" />
                    </el-steps>
                </div>

                <!-- 右侧内容 -->
                <div class="right-content">
                    <div v-if="activeStep === 0">
                        <h3>基本情况</h3>
                        <el-form ref="basicForm" :model="formData.basicInfo" :rules="rules.basicInfo">
                            <el-row :gutter="15">
                                <el-col :span="11">
                                    <el-form-item label="实验室名称" prop="institutionName" label-width="110px">
                                        <el-input v-model="formData.basicInfo.institutionName" placeholder="请输入实验室名称"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="13">
                                    <el-form-item label="实验室类别" prop="labCategory" label-width="135px">
                                        <el-radio-group v-model="formData.basicInfo.labCategory">
                                            <el-radio value="重点建设">重点建设</el-radio>
                                            <el-radio value="培育建设">培育建设</el-radio>
                                        </el-radio-group>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row :gutter="15">
                                <el-col :span="11">
                                    <el-form-item label="成立时间" prop="establishmentDate" label-width="110px">
                                        <el-date-picker v-model="formData.basicInfo.establishmentDate" type="month" placeholder="选择日期"
                                            value-format="YYYY-MM">
                                        </el-date-picker>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="13">
                                    <el-form-item label="是否实体" prop="isEntity" label-width="135px">
                                        <el-radio-group v-model="formData.basicInfo.isEntity">
                                            <el-radio value="1">是</el-radio>
                                            <el-radio value="0">否</el-radio>
                                        </el-radio-group>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            
                            <el-row :gutter="15">
                                <el-col :span="11">
                                    <el-form-item label="依托学校" prop="affiliatedSchool" label-width="110px">
                                        <el-input v-model="formData.basicInfo.affiliatedSchool" placeholder="请输入依托学校"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="13">
                                    <el-form-item label="建设周期" prop="buildPeriod" label-width="135px">
                                        <el-date-picker
                                            v-model="formData.basicInfo.buildPeriod"
                                            type="yearrange"
                                            range-separator="至"
                                            start-placeholder="开始年份"
                                            end-placeholder="结束年份"
                                            value-format="YYYY"
                                        />
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <!--<el-row :gutter="15">
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
                            </el-row>-->

                            <el-row :gutter="15">
                                <el-col :span="11">
                                    <el-form-item label="总面积(平米)" prop="totalArea" label-width="110px">
                                        <el-input v-model="formData.basicInfo.totalArea" placeholder="请输入总面积"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="13">
                                    <el-form-item label="实验室面积(平米)" prop="labArea" label-width="135px">
                                        <el-input v-model="formData.basicInfo.labArea" placeholder="请输入实验室面积"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <!--<el-row :gutter="15">
                                <el-col :span="12">
                                    <el-form-item label="近3年年均经费（万元）" prop="averageFunding">
                                        <el-input v-model="formData.basicInfo.averageFunding" placeholder="请输入近3年年均经费"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                </el-col>
                            </el-row>
                            <el-form-item label="主要经费来源" prop="mainFundingSource">
                                <el-input v-model="formData.basicInfo.mainFundingSource" placeholder="请输入主要经费来源"></el-input>
                            </el-form-item>-->

                            <el-row :gutter="15">
                                <el-col :span="11">
                                    <el-form-item label="主要依托学科" prop="mainDiscipline" label-width="110px">
                                        <el-input v-model="formData.basicInfo.mainDiscipline" placeholder="请输入主要依托学科"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="13">
                                    <el-form-item label="其他依托学科" prop="direction.disciplines" label-width="135px">
                                        <div class="discipline-container">
                                            <div style="display: flex; align-items: center; margin-bottom: 5px;">
                                                <el-input v-model="data.newDiscipline" placeholder="请输入其他依托学科" style="flex: 1;"></el-input>
                                                <el-button type="primary" circle size="small" @click="addDiscipline" style="margin-left: 10px;">
                                                    <el-icon><Plus /></el-icon>
                                                </el-button>
                                            </div>
                                            <div v-for="(discipline, index) in formData.basicInfo.direction.disciplines" :key="index" class="discipline-input-row" style="display: flex; margin-bottom: 5px; align-items: center;">
                                                <el-input v-model="discipline.name" placeholder="请输入其他依托学科" style="flex: 1;"></el-input>
                                                <el-button type="danger" circle size="small" @click="removeRow('1', index)" style="margin-left: 10px;">
                                                    <el-icon><Delete /></el-icon>
                                                </el-button>
                                            </div>
                                        </div>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-form-item label="研究方向" prop="direction.researches" label-width="110px">
                                <div class="research-container">
                                    <div style="display: flex; align-items: center; margin-bottom: 5px;">
                                        <el-input v-model="data.newResearch" placeholder="请输入研究方向" style="flex: 1;"></el-input>
                                        <el-button type="primary" circle size="small" @click="addResearch" style="margin-left: 10px;">
                                            <el-icon><Plus /></el-icon>
                                        </el-button>
                                    </div>
                                    <div v-for="(research, index) in formData.basicInfo.direction.researches" :key="index" class="research-input-row" style="display: flex; margin-bottom: 5px; align-items: center;">
                                        <el-input v-model="research.name" :placeholder="`请输入研究方向${index + 1}`" style="flex: 1;"></el-input>
                                        <el-button type="danger" circle size="small" @click="removeRow('2', index)" style="margin-left: 10px;">
                                            <el-icon><Delete /></el-icon>
                                        </el-button>
                                    </div>
                                </div>
                            </el-form-item>
                        </el-form>
                    </div>

                    <div v-if="activeStep === 1">
                        <h3>实验室成员</h3>
                        <el-form label-width="100px" :model="formData.members" :rules="rules" ref="membersForm">
                            <template v-for="(item, index) in formData.members" :key="index">
                                <h4 v-if="index === 0">实验室主任</h4>
                                <h4 v-if="index === 1">实验室副主任</h4>
                                <h4 v-if="index === 2">管理委员会主任</h4>
                                <h4 v-if="index === 3">学术委员会主任</h4>
                                
                                <!-- 使用栅格系统实现布局，研究方向和学术荣誉称号独占一行 -->
                                <template v-for="(field, fieldIndex) in formFields.filter(f => shouldShowField(index, f))" :key="field.prop">
                                    <!-- 研究方向和主要学术荣誉称号独占一行 -->
                                    <el-row v-if="field.prop === 'researchDirection' || field.prop === 'academicHonors'" :gutter="10">
                                        <el-col :span="24">
                                            <el-form-item :label="field.label"
                                                :prop="`${index}.${field.prop}`" :rules="getFieldRules(field, index)">
                                                <el-input v-if="field.type !== 'date'"
                                                    v-model="formData.members[index][field.prop]"
                                                    :placeholder="'请输入' + field.label"></el-input>
                                                <el-date-picker v-else v-model="formData.members[index][field.prop]" type="month"
                                                    placeholder="选择年月" format="YYYY年MM月"
                                                    value-format="YYYY-MM" style="width: 100%;"></el-date-picker>
                                            </el-form-item>
                                        </el-col>
                                    </el-row>
                                    
                                    <!-- 其他字段每两个一行 -->
                                    <template v-else>
                                        <!-- 计算当前字段在非独占字段中的索引 -->
                                        <el-row v-if="getFieldIndexInPairedFields(formFields.filter(f => shouldShowField(index, f)), fieldIndex) % 2 === 0" :gutter="10">
                                            <!-- 第一个字段 -->
                                            <el-col :span="12">
                                                <el-form-item :label="field.label"
                                                    :prop="`${index}.${field.prop}`" :rules="getFieldRules(field, index)">
                                                    <el-input v-if="field.type !== 'date'"
                                                        v-model="formData.members[index][field.prop]"
                                                        :placeholder="'请输入' + field.label"></el-input>
                                                    <el-date-picker v-else v-model="formData.members[index][field.prop]" type="month"
                                                        placeholder="选择年月" format="YYYY年MM月"
                                                        value-format="YYYY-MM" style="width: 100%;"></el-date-picker>
                                                </el-form-item>
                                            </el-col>
                                            
                                            <!-- 第二个字段（如果存在且不是独占字段） -->
                                            <el-col :span="12" v-if="getNextPairedField(formFields.filter(f => shouldShowField(index, f)), fieldIndex)">
                                                <el-form-item :label="getNextPairedField(formFields.filter(f => shouldShowField(index, f)), fieldIndex).label"
                                                    :prop="`${index}.${getNextPairedField(formFields.filter(f => shouldShowField(index, f)), fieldIndex).prop}`" 
                                                    :rules="getFieldRules(getNextPairedField(formFields.filter(f => shouldShowField(index, f)), fieldIndex), index)">
                                                    <el-input v-if="getNextPairedField(formFields.filter(f => shouldShowField(index, f)), fieldIndex).type !== 'date'"
                                                        v-model="formData.members[index][getNextPairedField(formFields.filter(f => shouldShowField(index, f)), fieldIndex).prop]"
                                                        :placeholder="'请输入' + getNextPairedField(formFields.filter(f => shouldShowField(index, f)), fieldIndex).label"></el-input>
                                                    <el-date-picker v-else v-model="formData.members[index][getNextPairedField(formFields.filter(f => shouldShowField(index, f)), fieldIndex).prop]" type="month"
                                                        placeholder="选择年月" format="YYYY年MM月"
                                                        value-format="YYYY-MM" style="width: 100%;"></el-date-picker>
                                                </el-form-item>
                                            </el-col>
                                        </el-row>
                                    </template>
                                </template>
                            </template>
                        </el-form>

                        <!-- 人员队伍统计表格 -->
                        <div style="margin-top: 30px;">
                            <h4>人员队伍</h4>
                            <div class="team-table-container">
                                <table class="team-table">
                                    <thead>
                                        <tr>
                                            <th rowspan="2" class="category-header">人员队伍数量</th>
                                            <th rowspan="2" class="total-header">合计</th>
                                            <th colspan="3" class="teacher-header">教学科研人员</th>
                                            <th colspan="3" class="tech-header">实验技术人员</th>
                                            <th rowspan="2" class="other-header">其他</th>
                                        </tr>
                                        <tr>
                                            <th class="sub-header">正高级</th>
                                            <th class="sub-header">副高级</th>
                                            <th class="sub-header">中级及以下</th>
                                            <th class="sub-header">正高级</th>
                                            <th class="sub-header">副高级</th>
                                            <th class="sub-header">中级及以下</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- 合计行 -->
                                        <tr>
                                            <td class="category-cell">合计</td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[0].total" size="small" placeholder="0" disabled />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[0].seniorTeacher" size="small" placeholder="0" disabled />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[0].associateTeacher" size="small" placeholder="0" disabled />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[0].middleTeacher" size="small" placeholder="0" disabled />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[0].seniorTech" size="small" placeholder="0" disabled />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[0].associateTech" size="small" placeholder="0" disabled />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[0].middleTech" size="small" placeholder="0" disabled />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[0].others" size="small" placeholder="0" disabled />
                                            </td>
                                        </tr>
                                        <!-- 专职行 -->
                                        <tr>
                                            <td class="category-cell">专职</td>
                                            <td class="input-cell">
                                                <!-- 合计（自动计算） -->
                                                <el-input v-model="formData.teamStatistics[1].total" size="small" placeholder="0" disabled />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[1].seniorTeacher" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[1].associateTeacher" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[1].middleTeacher" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[1].seniorTech" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[1].associateTech" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[1].middleTech" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[1].others" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                        </tr>
                                        <!-- 兼职行 -->
                                        <tr>
                                            <td class="category-cell">兼职</td>
                                            <td class="input-cell">
                                                <!-- 合计（自动计算） -->
                                                <el-input v-model="formData.teamStatistics[2].total" size="small" placeholder="0" disabled />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[2].seniorTeacher" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[2].associateTeacher" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[2].middleTeacher" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[2].seniorTech" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[2].associateTech" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[2].middleTech" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[2].others" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                        </tr>
                                        <!-- 61岁及以上行 -->
                                        <tr>
                                            <td class="category-cell">61岁及以上</td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[3].total" size="small" placeholder="0" disabled />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[3].seniorTeacher" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[3].associateTeacher" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[3].middleTeacher" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[3].seniorTech" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[3].associateTech" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[3].middleTech" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[3].others" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                        </tr>
                                        <!-- 45-60岁行 -->
                                        <tr>
                                            <td class="category-cell">45-60岁</td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[4].total" size="small" placeholder="0" disabled />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[4].seniorTeacher" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[4].associateTeacher" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[4].middleTeacher" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[4].seniorTech" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[4].associateTech" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[4].middleTech" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[4].others" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                        </tr>
                                        <!-- 45岁以下行 -->
                                        <tr>
                                            <td class="category-cell">45岁以下</td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[5].total" size="small" placeholder="0" disabled />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[5].seniorTeacher" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[5].associateTeacher" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[5].middleTeacher" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[5].seniorTech" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[5].associateTech" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[5].middleTech" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.teamStatistics[5].others" size="small" placeholder="0" @input="calculateTeamStatistics" />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 人才数量表格 -->
                        <div class="form-section">
                            <div class="table-container">
                                <table class="statistics-table">
                                    <tbody>
                                        <!-- 第一行：人才数量标题和国家级高层次人才、国家级青年人才 -->
                                        <tr>
                                            <td style="font-weight: bold;background-color: #f0f5f9; width: 96px;" rowspan="2">人才数量</td>
                                            <td class="label-cell">国家级高层次人才</td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.talentStatistics[0].nationalHighLevel" size="small" placeholder="0" @input="calculateTalentTotal" />
                                                <span style="margin-left: 5px; font-size: 12px; color: #666;">人</span>
                                            </td>
                                            <td class="label-cell">国家级青年人才</td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.talentStatistics[0].nationalYoung" size="small" placeholder="0" @input="calculateTalentTotal" />
                                                <span style="margin-left: 5px; font-size: 12px; color: #666;">人</span>
                                            </td>
                                        </tr>
                                        <!-- 第二行：省部级人才 -->
                                        <tr>
                                            <td class="label-cell">省部级人才</td>
                                            <td class="input-cell">
                                                <el-input v-model="formData.talentStatistics[0].provincial" size="small" placeholder="0" @input="calculateTalentTotal" />
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

                    <div v-if="activeStep === 2">
                        <h3>建设基础</h3>
                        <el-form ref="foundationForm" :model="formData.foundation" :rules="rules.foundation">
                            <el-form-item prop="foundation">
                                <el-input
                                    v-model="formData.foundation.foundation"
                                    type="textarea"
                                    :rows="8"
                                    maxlength="1000"
                                    show-word-limit
                                    placeholder="现有基础、功能定位、主要特色、标志性成果及国内外影响等综述（限1000字）"
                                    style="width: 100%;">
                                </el-input>
                            </el-form-item>
                        </el-form>
                        
                        <h3>建设目标和发展思路</h3>
                        <el-form :model="formData.foundation" :rules="rules.foundation">
                            <el-form-item prop="goals">
                                <el-input
                                    v-model="formData.foundation.goals"
                                    type="textarea"
                                    :rows="8"
                                    maxlength="1000"
                                    show-word-limit
                                    placeholder="围绕国家（区域、行业）重大战略需求，聚焦哲学社会科学领域重大理论和现实问题，坚持学科交叉融合，坚持研究范式革新，提出建设期内本实验室整体建设目标和发展思路（限1000字）"
                                    style="width: 100%;">
                                </el-input>
                            </el-form-item>
                        </el-form>
                    </div>

                    <div v-if="activeStep === 3">
                        <h3>重点任务和建设举措</h3>
                        <el-form ref="keyTasksForm" :model="formData.keyTasks" :rules="rules.keyTasks">
                            <el-form-item prop="keyTasks">
                                <el-input
                                    v-model="formData.keyTasks.keyTasks"
                                    type="textarea"
                                    :rows="15"
                                    :maxlength="3000"
                                    show-word-limit
                                    placeholder="围绕建设目标，在哲学社会科学自主知识体系建构、咨政服务能力提升、高层次团队建设、高质量人才培养、高水平科研创新、开放共享与社会服务（包括但不限于）等方面逐条提出拟开展的重点任务和建设举措（限3000字）。"
                                />
                            </el-form-item>
                        </el-form>
                    </div>

                    <div v-if="activeStep === 4">
                        <h3>制度建设</h3>
                        <el-form ref="systemBuildingForm" :model="formData.systemBuilding" :rules="rules.systemBuilding">
                            <el-form-item prop="systemBuilding">
                                <el-input
                                    v-model="formData.systemBuilding.systemBuilding"
                                    type="textarea"
                                    :rows="8"
                                    :maxlength="1000"
                                    show-word-limit
                                    placeholder="简述实验室管理制度建设和内部运行机制建设主要内容，重点突出制度创新（限1000字）。"
                                />
                            </el-form-item>
                        </el-form>
                        
                        <h3>预期成效及标志性成果</h3>
                        <el-form :model="formData.systemBuilding" :rules="rules.systemBuilding">
                            <el-form-item prop="expectedResults">
                                <el-input
                                    v-model="formData.systemBuilding.expectedResults"
                                    type="textarea"
                                    :rows="12"
                                    :maxlength="2000"
                                    show-word-limit
                                    placeholder="对照重点任务提出建设期内预期成效，并以2024-2026年、2027-2028年两个时间段列出预期标志性成果及其学术价值和实际贡献（限2000字）。"
                                />
                            </el-form-item>
                        </el-form>
                    </div>

                    <div v-if="activeStep === 5">
                        <h3>组织保障</h3>
                        <el-form ref="organizationForm" :model="formData.organization" :rules="rules.organization">
                            <el-form-item prop="organizationalSupport">
                                <el-input
                                    v-model="formData.organization.organizationalSupport"
                                    type="textarea"
                                    :rows="12"
                                    :maxlength="1000"
                                    show-word-limit
                                    placeholder="学校在人、财、物等方面对本实验室建设给予的政策保障与支持措施（限1000字）。"
                                />
                            </el-form-item>
                        </el-form>
                    </div>

                    <div v-if="activeStep === 6">
                        <h3>经费预算</h3>
                        <el-form ref="budgetForm" :model="formData.budget">
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
                                    <tr v-for="(budget, index) in formData.budget.yearlyBudgets" :key="budget.year">
                                        <td class="year-cell">{{ budget.year }}</td>
                                        <td class="input-cell">
                                            <el-input 
                                                v-model="budget.provincialFunds" 
                                                @input="calculateRowTotal(index)"
                                                placeholder="0"
                                                size="small"
                                            />
                                        </td>
                                        <td class="input-cell">
                                            <el-input 
                                                v-model="budget.schoolFunds" 
                                                @input="calculateRowTotal(index)"
                                                placeholder="0"
                                                size="small"
                                            />
                                        </td>
                                        <td class="input-cell">
                                            <el-input 
                                                v-model="budget.otherFunds" 
                                                @input="calculateRowTotal(index)"
                                                placeholder="0"
                                                size="small"
                                            />
                                        </td>
                                        <td class="total-cell">{{ budget.total || '0' }}</td>
                                    </tr>
                                    <tr class="total-row">
                                        <td class="year-cell total-label">合计</td>
                                        <td class="total-cell">{{ formData.budget.totalProvincialFunds || '0' }}</td>
                                        <td class="total-cell">{{ formData.budget.totalSchoolFunds || '0' }}</td>
                                        <td class="total-cell">{{ formData.budget.totalOtherFunds || '0' }}</td>
                                        <td class="total-cell grand-total">{{ formData.budget.grandTotal || '0' }}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div class="budget-note">
                                注：.经费预算和使用依据《高等学校哲学社会科学繁荣计划专项资金管理办法》（财教〔2021〕285号）。
                            </div>
                            </div>
                        </el-form>
                    </div>

                    <div v-if="activeStep === 7">
                        <h3>其他材料</h3>
                        <el-upload ac ref="uploadRef" class="upload-demo" :file-list="fileList"
                            :action="baseUrl + '/files/upload'" :on-success="handleFileUpload" :on-change="handleChange"
                            :on-remove="handleRemove" multiple>
                            <el-button type="primary" size="small">点击上传</el-button>
                        </el-upload>
                    </div>

                    <div v-if="activeStep === 8" class="success-container">
                        <el-icon :size="200" color="#67c23a">
                            <Check />
                        </el-icon>
                        <h1>提交成功</h1>
                    </div>

                    <!-- 页面底部的导航按钮 -->
                    <div v-if="activeStep !== 8" class="navigation-buttons">
                        <el-button :style="{ opacity: activeStep === 0 ? 0 : 1 }"
                            @click="prevTab" size="small">
                            上一页
                        </el-button>
                        <el-button v-if="activeStep !== 7" type="primary"
                            @click="nextTab" size="small">下一页</el-button>
                        <!-- 添加的时候 -->
                        <el-button v-if="activeStep === 7" type="success" @click="submitForm" size="small">提交</el-button>
                    </div>
                </div>


            </div>
        </el-card>
    </transition>

    <transition name="fade" mode="out-in">
        <LabApplicationForm v-if="pageStatus === 'select'" :id="selectedApplicationId" />
    </transition>

    <!-- 安全提醒组件 -->
    <SecurityAlert v-model="showSecurityAlert" @confirm="handleSecurityConfirm" />

</template>

<script setup>
import { ref, reactive, toRaw, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, User, Grid, Money, Paperclip, Check, OfficeBuilding, Plus, Delete } from '@element-plus/icons-vue';
import request from "@/utils/request.js";
import LabApplicationForm from './componets/LabCom.vue';
import SecurityAlert from "@/components/SecurityAlert.vue";
import { securityAlertManager } from "@/utils/securityAlert.js";

// 定义组件事件
const emit = defineEmits(['updateUser']);

// 读取环境变量
const baseUrl = import.meta.env?.VITE_BASE_URL || '';

const basicForm = ref(null); // 步骤0：基本情况表单引用
const membersForm = ref(null); // 步骤1：实验室成员表单引用
const foundationForm = ref(null); // 步骤2：建设基础和建设目标表单引用
const keyTasksForm = ref(null); // 步骤3：重点任务和建设举措表单引用
const systemBuildingForm = ref(null); // 步骤4：制度建设和预期成效表单引用
const organizationForm = ref(null); // 步骤5：组织保障表单引用
const budgetForm = ref(null); // 步骤6：经费预算表单引用
const uploadRef = ref(null); // 步骤7：文件上传组件引用

const selectedApplicationId = ref(null); // 定义 selectedApplicationId

// 页面状态
const pageStatus = ref('');
const activeStep = ref(0);
const showSecurityAlert = ref(false);

const fileList = ref([]);

const formFields = ref([
    { label: '姓名', prop: 'name', required: true },
    { label: '出生年月', prop: 'birthDate', type: 'date', required: true },
    { label: '手机号码', prop: 'phone', required: true },
    { label: '职务/职称', prop: 'title', required: true },
    { label: '任职时间', prop: 'labTenure', required: true },
    { label: '所在学科', prop: 'discipline', required: true },
    { label: '研究方向', prop: 'researchDirection', required: true },
    { label: '主要学术荣誉称号(限2项)', prop: 'academicHonors', required: false }
]);

// 申请列表数据
const labApplyList = ref([]);

const data = reactive({
    user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
    newDiscipline: '',
    newResearch: ''
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
    // 步骤0：基本情况
    basicInfo: {
        institutionName: '',
        labCategory: '重点建设',
        buildPeriod: ['2024', '2028'],
        affiliatedSchool: '',
        establishmentDate: '',
        totalStaff: '',
        fullTimeStaff: '',
        isEntity: '',
        totalArea: '',
        labArea: '',
        averageFunding: '',
        mainFundingSource: '',
        mainDiscipline: '',
        direction: {
            disciplines: [],
            researches: []
        }
    },
    // 步骤1：实验室成员
    members: [
        { name: '', birthDate: '', title: '', labTenure: '', discipline: '', researchDirection: '', academicHonors: '', phone: '' }, // 实验室主任
        { name: '', birthDate: '', title: '', labTenure: '', discipline: '', researchDirection: '', academicHonors: '', phone: '' }, // 实验室副主任(含学术带头人)
        { name: '', birthDate: '', title: '', discipline: '', researchDirection: '' }, // 管理委员会主任
        { name: '', birthDate: '', title: '', discipline: '', researchDirection: '' } // 学术委员会主任
    ],
    // 人员队伍统计表
    teamStatistics: [
        { 
            category: '人员队伍', 
            isMainCategory: true,
            total: '', 
            seniorTeacher: '', 
            associateTeacher: '', 
            middleTeacher: '', 
            seniorTech: '', 
            associateTech: '', 
            middleTech: '', 
            others: '' 
        },
        { 
            category: '合计', 
            isMainCategory: false,
            total: '', 
            seniorTeacher: '', 
            associateTeacher: '', 
            middleTeacher: '', 
            seniorTech: '', 
            associateTech: '', 
            middleTech: '', 
            others: '' 
        },
        { 
            category: '专职', 
            isMainCategory: false,
            total: '', 
            seniorTeacher: '', 
            associateTeacher: '', 
            middleTeacher: '', 
            seniorTech: '', 
            associateTech: '', 
            middleTech: '', 
            others: '' 
        },
        { 
            category: '兼职', 
            isMainCategory: false,
            total: '', 
            seniorTeacher: '', 
            associateTeacher: '', 
            middleTeacher: '', 
            seniorTech: '', 
            associateTech: '', 
            middleTech: '', 
            others: '' 
        },
        { 
            category: '61岁及以上', 
            isMainCategory: false,
            total: '', 
            seniorTeacher: '', 
            associateTeacher: '', 
            middleTeacher: '', 
            seniorTech: '', 
            associateTech: '', 
            middleTech: '', 
            others: '' 
        },
        { 
            category: '45-60岁', 
            isMainCategory: false,
            total: '', 
            seniorTeacher: '', 
            associateTeacher: '', 
            middleTeacher: '', 
            seniorTech: '', 
            associateTech: '', 
            middleTech: '', 
            others: '' 
        },
        { 
            category: '45岁以下', 
            isMainCategory: false,
            total: '', 
            seniorTeacher: '', 
            associateTeacher: '', 
            middleTeacher: '', 
            seniorTech: '', 
            associateTech: '', 
            middleTech: '', 
            others: '' 
        }
    ],
    // 人才数量统计
    talentStatistics: [
        { 
            category: '', 
            total: '0', // 合计人数
            nationalHighLevel: '0', // 国家级高层次人才
            nationalYoung: '0', // 国家级青年人才
            provincial: '0', // 省部级人才
            placeholder1: '0',
            placeholder2: '0',
            placeholder3: '0',
            placeholder4: '0'
        }
    ],
    // 步骤2：建设基础和建设目标
    foundation: {
        foundation: '', // 建设基础
        goals: '' // 建设目标和发展思路
    },
    // 步骤3：重点任务和建设举措
    keyTasks: {
        keyTasks: '' // 重点任务和建设举措（限3000字）
    },
    // 步骤4：制度建设 & 预期成效及标志性成果
    systemBuilding: {
        systemBuilding: '', // 制度建设（限1000字）
        expectedResults: '' // 预期成效及标志性成果（限2000字）
    },
    // 步骤5：组织保障
    organization: {
        organizationalSupport: '' // 组织保障（限1000字）
    },
    // 步骤6：经费预算
    budget: {
        yearlyBudgets: [
            { year: '2024', provincialFunds: '', schoolFunds: '', otherFunds: '', total: '' },
            { year: '2025', provincialFunds: '', schoolFunds: '', otherFunds: '', total: '' },
            { year: '2026', provincialFunds: '', schoolFunds: '', otherFunds: '', total: '' },
            { year: '2027', provincialFunds: '', schoolFunds: '', otherFunds: '', total: '' },
            { year: '2028', provincialFunds: '', schoolFunds: '', otherFunds: '', total: '' }
        ],
        totalProvincialFunds: '',
        totalSchoolFunds: '',
        totalOtherFunds: '',
        grandTotal: '',
        description: '' // 预算说明
    },
    // 步骤7：其他材料
    attachments: { 
        files: [] 
    }
});

const rules = ref({
    basicInfo: {
        institutionName: [{ required: true, message: '机构名称不能为空', trigger: 'blur' }],
        labCategory: [{ required: true, message: '实验室类别不能为空', trigger: 'change' }],
        buildPeriod: [{ required: true, message: '建设周期不能为空', trigger: 'change' }],
        affiliatedSchool: [{ required: true, message: '依托学校不能为空', trigger: 'blur' }],
        establishmentDate: [{ required: true, message: '成立时间不能为空', trigger: 'blur' }],
        totalStaff: [{ required: true, message: '人员总数不能为空', trigger: 'blur' }],
        fullTimeStaff: [{ required: true, message: '专职人员总数不能为空', trigger: 'blur' }],
        isEntity: [{ required: true, message: '是否实体不能为空', trigger: 'blur' }],
        totalArea: [{ required: true, message: '总面积不能为空', trigger: 'blur' }],
        labArea: [{ required: true, message: '实验室面积不能为空', trigger: 'blur' }],
        averageFunding: [{ required: true, message: '近3年年均经费不能为空', trigger: 'blur' }],
        mainFundingSource: [{ required: true, message: '主要经费来源不能为空', trigger: 'blur' }],
        mainDiscipline: [{ required: true, message: '主要依托学科不能为空', trigger: 'blur' }]
    },
    "basicInfo.direction.disciplines": [
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
    "basicInfo.direction.researches": [
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
    // 步骤2：建设基础验证规则
    foundation: {
        foundation: [{ required: true, message: '建设基础不能为空', trigger: 'blur' }],
        goals: [{ required: true, message: '建设目标和发展思路不能为空', trigger: 'blur' }]
    },
    // 步骤3：重点任务验证规则
    keyTasks: {
        keyTasks: [{ required: true, message: '重点任务和建设举措不能为空', trigger: 'blur' }]
    },
    // 步骤4：制度建设验证规则
    systemBuilding: {
        systemBuilding: [{ required: true, message: '制度建设不能为空', trigger: 'blur' }],
        expectedResults: [{ required: true, message: '预期成效及标志性成果不能为空', trigger: 'blur' }]
    },
    // 步骤5：组织保障验证规则
    organization: {
        organizationalSupport: [{ required: true, message: '组织保障不能为空', trigger: 'blur' }]
    },
    // 实验室主任验证规则
    "0.name": [{ required: true, message: "姓名不能为空", trigger: "blur" }],
    "0.birthDate": [{ required: true, message: "出生年月不能为空", trigger: "change" }],
    "0.title": [{ required: true, message: "职务/职称不能为空", trigger: "blur" }],
    "0.discipline": [{ required: true, message: "所在学科不能为空", trigger: "blur" }],
    "0.researchDirection": [{ required: true, message: "研究方向不能为空", trigger: "blur" }],
    "0.phone": [
        { required: true, message: "手机号码不能为空", trigger: "blur" },
    ],

    // 实验室副主任(含学术带头人)验证规则

    // 管理委员会主任验证规则
    "2.name": [{ required: true, message: "姓名不能为空", trigger: "blur" }],
    "2.birthDate": [{ required: true, message: "出生年月不能为空", trigger: "change" }],
    "2.title": [{ required: true, message: "职务/职称不能为空", trigger: "blur" }],
    "2.discipline": [{ required: true, message: "所在学科不能为空", trigger: "blur" }],
    "2.researchDirection": [{ required: true, message: "研究方向不能为空", trigger: "blur" }],
    "2.phone": [
        { required: true, message: "手机号码不能为空", trigger: "blur" },
    ],

    // 学术委员会主任验证规则
    "3.name": [{ required: true, message: "姓名不能为空", trigger: "blur" }],
    "3.birthDate": [{ required: true, message: "出生年月不能为空", trigger: "change" }],
    "3.title": [{ required: true, message: "职务/职称不能为空", trigger: "blur" }],
    "3.discipline": [{ required: true, message: "所在学科不能为空", trigger: "blur" }],
    "3.researchDirection": [{ required: true, message: "研究方向不能为空", trigger: "blur" }],
    "3.phone": [
        { required: true, message: "手机号码不能为空", trigger: "blur" },
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
    if (index === 0) { // 实验室主任 - 显示所有字段
        return true;
    } else if (index === 1) { // 实验室副主任(含学术带头人) - 显示所有字段
        return true;
    } else if (index === 2 || index === 3) { // 管理委员会主任、学术委员会主任 - 不显示学术荣誉称号、实验室任职时间和手机号码
        return field.prop !== 'academicHonors' && field.prop !== 'labTenure' && field.prop !== 'phone';
    }
    return false;
};

const getFieldRules = (field, memberIndex) => {
    // 根据字段和成员索引生成规则
    // 实验室副主任(index=1)的所有字段都不是必填项
    if (memberIndex === 1) {
        return [];
    }
    
    // 其他成员按照字段的required属性决定
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

// 添加依托学科
const addDiscipline = () => {
    formData.value.basicInfo.direction.disciplines.push({ name: '', description: '' });
};

// 添加研究方向
const addResearch = () => {
    formData.value.basicInfo.direction.researches.push({ name: '' });
};

// 删除一行
const removeRow = (type, index) => {
    if (type === '1') {
        formData.value.basicInfo.direction.disciplines.splice(index, 1);
    }
    else if (type === '2') {
        formData.value.basicInfo.direction.researches.splice(index, 1);
    }
    else {
        formData.value.buildings.construacts.splice(index, 1);
    }

};


// 切换 Tab
const nextTab = () => {
    let formRef = null;
    let canProceed = true;

    switch (activeStep.value) {
        case 0:
            // 步骤0：基本情况 - 有表单验证
            formRef = basicForm.value;
            break;
        case 1:
            // 步骤1：实验室成员 - 有表单验证
            formRef = membersForm.value;
            break;
        case 2:
            // 步骤2：建设基础 & 建设目标和发展思路 - 检查必填内容
            formRef = foundationForm.value;
            break;
        case 3:
            // 步骤3：重点任务和建设举措 - 检查必填内容
            formRef = keyTasksForm.value;
            break;
        case 4:
            // 步骤4：制度建设 & 预期成效及标志性成果 - 检查必填内容
            formRef = systemBuildingForm.value;
            break;
        case 5:
            // 步骤5：组织保障 - 检查必填内容
            formRef = organizationForm.value;
            break;
        case 6:
            // 步骤6：经费预算 - 检查是否填写了预算数据
            const hasValidBudget = formData.value.budget.yearlyBudgets.some(budget => 
                (budget.provincialFunds && budget.provincialFunds.trim() !== '') ||
                (budget.schoolFunds && budget.schoolFunds.trim() !== '') ||
                (budget.otherFunds && budget.otherFunds.trim() !== '')
            );
            formRef = budgetForm.value;
            break;
        default:
            formRef = null;
    }

    // 如果有表单引用，进行表单验证
    if (formRef) {
        formRef.validate((valid, invalidFields) => {
            console.log('formRef validation:', valid);
            console.log('当前步骤:', activeStep.value);
            console.log('表单引用:', formRef);
            if (invalidFields) {
                console.log('校验失败的字段:', invalidFields);
            }
            if (valid && canProceed) {
                activeStep.value += 1;
                // 如果进入第7步（其他材料步骤），显示安全提醒
                if (activeStep.value === 7) {
                    securityAlertManager.show();
                }
            } else {
                ElMessage.error('表单校验失败，请检查输入内容');
            }
        });
    } else if (canProceed) {
        // 没有表单引用但可以继续的情况
        activeStep.value += 1;
        // 如果进入第7步（其他材料步骤），显示安全提醒
        if (activeStep.value === 7) {
            securityAlertManager.show();
        }
    }
};

const prevTab = () => {
    if (activeStep.value > 0) {
        // 如果从第7步（其他材料步骤）退出，隐藏安全提醒
        if (activeStep.value === 7) {
            securityAlertManager.hide();
        }
        activeStep.value -= 1;
    }
};

// **经费预算计算函数**
const calculateRowTotal = (index) => {
    const budget = formData.value.budget.yearlyBudgets[index];
    const provincial = parseFloat(budget.provincialFunds) || 0;
    const school = parseFloat(budget.schoolFunds) || 0;
    const other = parseFloat(budget.otherFunds) || 0;
    
    // 计算行总计
    budget.total = (provincial + school + other).toString();
    
    // 重新计算列总计
    calculateColumnTotals();
};

const calculateColumnTotals = () => {
    let totalProvincial = 0;
    let totalSchool = 0;
    let totalOther = 0;
    let grandTotal = 0;
    
    formData.value.budget.yearlyBudgets.forEach(budget => {
        totalProvincial += parseFloat(budget.provincialFunds) || 0;
        totalSchool += parseFloat(budget.schoolFunds) || 0;
        totalOther += parseFloat(budget.otherFunds) || 0;
        grandTotal += parseFloat(budget.total) || 0;
    });
    
    formData.value.budget.totalProvincialFunds = totalProvincial.toString();
    formData.value.budget.totalSchoolFunds = totalSchool.toString();
    formData.value.budget.totalOtherFunds = totalOther.toString();
    formData.value.budget.grandTotal = grandTotal.toString();
};

// **人员统计计算函数**
const calculateTeamStatistics = () => {
    // 首先计算每行的合计（除了第一行总合计行）
    for (let i = 1; i <= 5; i++) {
        calculateRowTeamTotal(i);
    }
    
    // 然后计算总合计行（索引0）
    const totalRow = formData.value.teamStatistics[0];
    
    // 初始化合计行的所有字段为0
    totalRow.total = '0';
    totalRow.seniorTeacher = '0';
    totalRow.associateTeacher = '0';
    totalRow.middleTeacher = '0';
    totalRow.seniorTech = '0';
    totalRow.associateTech = '0';
    totalRow.middleTech = '0';
    totalRow.others = '0';
    
    // 计算专职、兼职和年龄段的合计（索引1-5）
    for (let i = 1; i <= 5; i++) {
        const row = formData.value.teamStatistics[i];
        totalRow.total = (parseFloat(totalRow.total) + (parseFloat(row.total) || 0)).toString();
        totalRow.seniorTeacher = (parseFloat(totalRow.seniorTeacher) + (parseFloat(row.seniorTeacher) || 0)).toString();
        totalRow.associateTeacher = (parseFloat(totalRow.associateTeacher) + (parseFloat(row.associateTeacher) || 0)).toString();
        totalRow.middleTeacher = (parseFloat(totalRow.middleTeacher) + (parseFloat(row.middleTeacher) || 0)).toString();
        totalRow.seniorTech = (parseFloat(totalRow.seniorTech) + (parseFloat(row.seniorTech) || 0)).toString();
        totalRow.associateTech = (parseFloat(totalRow.associateTech) + (parseFloat(row.associateTech) || 0)).toString();
        totalRow.middleTech = (parseFloat(totalRow.middleTech) + (parseFloat(row.middleTech) || 0)).toString();
        totalRow.others = (parseFloat(totalRow.others) + (parseFloat(row.others) || 0)).toString();
    }
};

// 计算单行的合计
const calculateRowTeamTotal = (rowIndex) => {
    const row = formData.value.teamStatistics[rowIndex];
    
    // 计算该行各列的总和
    const seniorTeacher = parseFloat(row.seniorTeacher) || 0;
    const associateTeacher = parseFloat(row.associateTeacher) || 0;
    const middleTeacher = parseFloat(row.middleTeacher) || 0;
    const seniorTech = parseFloat(row.seniorTech) || 0;
    const associateTech = parseFloat(row.associateTech) || 0;
    const middleTech = parseFloat(row.middleTech) || 0;
    const others = parseFloat(row.others) || 0;
    
    // 更新该行的合计
    row.total = (seniorTeacher + associateTeacher + middleTeacher + seniorTech + associateTech + middleTech + others).toString();
};

// 人才数量自动计算函数
const calculateTalentTotal = () => {
    const talentData = formData.value.talentStatistics[0];
    
    // 计算三种人才类型的总和
    const nationalHighLevel = parseFloat(talentData.nationalHighLevel) || 0;
    const nationalYoung = parseFloat(talentData.nationalYoung) || 0;
    const provincial = parseFloat(talentData.provincial) || 0;
    
    // 更新合计人数
    talentData.total = (nationalHighLevel + nationalYoung + provincial).toString();
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
            console.log('formData.value', formData.value)
            ElMessage({
                message: '提交成功！',
                type: 'success',
                duration: 2000, // 消息显示的持续时间（毫秒），设置为 0 时不会自动关闭
                onClose: () => {
                    // 消息关闭后的回调函数
                    activeStep.value++; // 跳转到下一步
                    securityAlertManager.hide(); // 隐藏安全提醒
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
                    securityAlertManager.hide(); // 隐藏安全提醒
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
    // 隐藏安全提醒
    securityAlertManager.hide();
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
    // 隐藏安全提醒
    securityAlertManager.hide();
    // 清空数据 - 使用重构后的数据结构
    formData.value = {
        // 步骤0: 基本情况
        basicInfo: {
            institutionName: '',
            labCategory: '',
            establishmentDate: '',
            isEntity: '',
            affiliatedSchool: '',
            buildPeriod: ['2024', '2028'],
            totalArea: '',
            labArea: '',
            mainDiscipline: '',
            direction: {
                disciplines: [],
                researches: []
            }
        },
        // 步骤1: 实验室成员
        members: [
            { name: '', birthDate: '', title: '', labTenure: '', discipline: '', researchDirection: '', academicHonors: '', phone: '' }, // 实验室主任
            { name: '', birthDate: '', title: '', labTenure: '', discipline: '', researchDirection: '', academicHonors: '', phone: '' }, // 实验室副主任(含学术带头人)
            { name: '', birthDate: '', title: '', discipline: '', researchDirection: '' }, // 管理委员会主任
            { name: '', birthDate: '', title: '', discipline: '', researchDirection: '' } // 学术委员会主任
        ],
        // 人员队伍统计表
        teamStatistics: [
            { 
                category: '人员队伍', 
                isMainCategory: true,
                total: '', 
                seniorTeacher: '', 
                associateTeacher: '', 
                middleTeacher: '', 
                seniorTech: '', 
                associateTech: '', 
                middleTech: '', 
                others: '' 
            },
            { 
                category: '合计', 
                isMainCategory: false,
                total: '', 
                seniorTeacher: '', 
                associateTeacher: '', 
                middleTeacher: '', 
                seniorTech: '', 
                associateTech: '', 
                middleTech: '', 
                others: '' 
            },
            { 
                category: '专职', 
                isMainCategory: false,
                total: '', 
                seniorTeacher: '', 
                associateTeacher: '', 
                middleTeacher: '', 
                seniorTech: '', 
                associateTech: '', 
                middleTech: '', 
                others: '' 
            },
            { 
                category: '兼职', 
                isMainCategory: false,
                total: '', 
                seniorTeacher: '', 
                associateTeacher: '', 
                middleTeacher: '', 
                seniorTech: '', 
                associateTech: '', 
                middleTech: '', 
                others: '' 
            },
            { 
                category: '61岁及以上', 
                isMainCategory: false,
                total: '', 
                seniorTeacher: '', 
                associateTeacher: '', 
                middleTeacher: '', 
                seniorTech: '', 
                associateTech: '', 
                middleTech: '', 
                others: '' 
            },
            { 
                category: '45-60岁', 
                isMainCategory: false,
                total: '', 
                seniorTeacher: '', 
                associateTeacher: '', 
                middleTeacher: '', 
                seniorTech: '', 
                associateTech: '', 
                middleTech: '', 
                others: '' 
            },
            { 
                category: '45岁以下', 
                isMainCategory: false,
                total: '', 
                seniorTeacher: '', 
                associateTeacher: '', 
                middleTeacher: '', 
                seniorTech: '', 
                associateTech: '', 
                middleTech: '', 
                others: '' 
            }
        ],
        // 人才数量统计
        talentStatistics: [
            { 
                category: '', 
                nationalHighLevel: '', 
                nationalYoung: '', 
                provincial: '' 
            }
        ],
        // 步骤2: 建设基础
        foundation: {
            foundation: ''
        },
        // 步骤3: 重点任务
        keyTasks: {
            keyTasks: ''
        },
        // 步骤4: 制度建设
        systemBuilding: {
            systemBuilding: ''
        },
        // 步骤5: 组织保障
        organization: {
            organization: ''
        },
        // 步骤6: 预算安排
         budget: {
             yearlyBudgets: [
                 { year: '2024', provincialFunds: '', schoolFunds: '', otherFunds: '', total: '' },
                 { year: '2025', provincialFunds: '', schoolFunds: '', otherFunds: '', total: '' },
                 { year: '2026', provincialFunds: '', schoolFunds: '', otherFunds: '', total: '' },
                 { year: '2027', provincialFunds: '', schoolFunds: '', otherFunds: '', total: '' },
                 { year: '2028', provincialFunds: '', schoolFunds: '', otherFunds: '', total: '' }
             ],
             totalProvincialFunds: '',
             totalSchoolFunds: '',
             totalOtherFunds: '',
             grandTotal: '',
             description: ''
         },
        // 步骤7: 附件材料
        attachments: { 
            files: [] 
        },
        // 保留原有的buildings结构（用于某些功能）
        buildings: {
            construacts: [{ name: '', leader: '', position: '' }]
        }
    };
}

const getFileName = (fileUrl) => {
    return fileUrl.split('-').pop();
};

// 获取字段在非独占字段中的索引（用于两列布局计算）
const getFieldIndexInPairedFields = (fields, currentIndex) => {
    let pairedIndex = 0;
    for (let i = 0; i < currentIndex; i++) {
        const field = fields[i];
        if (field.prop !== 'researchDirection' && field.prop !== 'academicHonors') {
            pairedIndex++;
        }
    }
    return pairedIndex;
};

// 获取下一个配对字段（用于两列布局）
const getNextPairedField = (fields, currentIndex) => {
    for (let i = currentIndex + 1; i < fields.length; i++) {
        const field = fields[i];
        if (field.prop !== 'researchDirection' && field.prop !== 'academicHonors') {
            return field;
        }
    }
    return null;
};

// 安全提醒确认处理
const handleSecurityConfirm = () => {
    showSecurityAlert.value = false;
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
    margin: 10px 15px 0 15px;
    padding: 10px 20px 10px 10px;
    border-right: 1px solid #eaeaea;
}

.right-content {
    flex: 1;
    padding: 0 25px 0 0;
    display: flex;
    flex-direction: column;
    /* 使内容垂直排列 */
    justify-content: space-between;
    /* 使按钮固定在底部 */
    overflow-y: auto;
    height: 100%;
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
    min-height: 400px;
}

/* 经费预算表格样式 */
.budget-table-container {
    margin: 20px 0;
}

.budget-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #c4c4c4;
    font-size: 14px;
    margin-bottom: 20px;
}

.budget-table th,
.budget-table td {
    border: 1px solid #c4c4c4;
    padding: 8px 12px;
    text-align: center;
    vertical-align: middle;
}

.budget-table th {
    background-color: #f0f5f9;
    font-weight: bold;
    font-size: 14px;
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

.input-cell {
    padding: 4px;
}

.input-cell .el-input {
    width: 100%;
}

.input-cell .el-input__wrapper {
    border: none;
    box-shadow: none;
    background: transparent;
}

.input-cell .el-input__inner {
    text-align: center;
    padding: 4px 8px;
    font-size: 13px;
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

.budget-note {
    margin-top: 15px;
    font-size: 12px;
    color: #666;
    line-height: 1.5;
}

.budget-note p {
    margin: 2px 0;
}

/* 人员队伍统计表格样式 */
.team-table-container {
    margin-top: 20px;
}

.team-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #c4c4c4;
    font-size: 14px;
}

.team-table th,
.team-table td {
    border: 1px solid #c4c4c4;
    padding: 8px 12px;
    text-align: center;
    vertical-align: middle;
}

.team-table th {
    background-color: #f0f5f9;
    font-weight: bold;
    font-size: 14px;
}

.category-header {
    width: 120px;
    background-color: #f0f5f9;
}

.teacher-header,
.tech-header {
    background-color: #f0f5f9;
}

.other-header {
    width: 80px;
    background-color: #f0f5f9;
}

.category-cell {
    font-weight: bold;
    background-color: #f0f5f9;
    width: 160px;
}

.team-table .input-cell {
    padding: 4px;
}

.team-table .input-cell .el-input {
    width: 100%;
}

.team-table .input-cell .el-input__wrapper {
    border: none;
    box-shadow: none;
    background: transparent;
}

.team-table .input-cell .el-input__inner {
    text-align: center;
    padding: 4px 8px;
    font-size: 13px;
}

.section-header {
    background-color: #e6f3ff;
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
    width: 120px;
}

.statistics-table .label-cell {
    background-color: #f0f5f9;
    font-size: 13px;
    color: #333;
    width: 150px;
}

.statistics-table .input-cell {
    padding: 4px;
    width: 120px;
}

.statistics-table .input-cell .el-input {
    width: 80px;
    display: inline-block;
}

.statistics-table .input-cell .el-input__wrapper {
    border: none;
    box-shadow: none;
    background: transparent;
}

.statistics-table .input-cell .el-input__inner {
    text-align: center;
    padding: 4px 8px;
    font-size: 13px;
}

.statistics-table .empty-cell {
    background-color: #f9f9f9;
}

.section-title {
    font-weight: bold;
    color: #1890ff;
    background-color: #e6f3ff;
}

.empty-cell {
    background-color: #f9f9f9;
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