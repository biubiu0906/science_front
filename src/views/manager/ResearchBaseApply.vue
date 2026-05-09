<template>
    <div>
        <div class="card" style="margin-bottom: 5px">
            <el-input v-model="searchId" :prefix-icon="Search" style="width: 240px; margin-right: 10px" placeholder="请输入申请编号查询" clearable @clear="resetSearch"></el-input>
            <el-input v-model="searchBaseName" :prefix-icon="Search" style="width: 220px; margin-right: 10px" placeholder="请输入基地名称查询" clearable @clear="resetSearch"></el-input>
            <el-select v-model="searchState" placeholder="审核状态" clearable style="width: 140px; margin-right: 10px">
                <el-option label="草稿" :value="1" />
                <el-option label="待审核" :value="0" />
                <el-option label="校审通过" :value="2" />
                <el-option label="校审驳回" :value="3" />
                <el-option label="终审通过" :value="4" />
                <el-option label="终审驳回" :value="5" />
            </el-select>
            <el-button type="info" plain size="small" @click="handleSearch">查询</el-button>
            <el-button type="warning" plain size="small" style="margin: 0 10px" @click="resetSearch">重置</el-button>
        </div>

        <div class="card" style="margin-bottom: 5px">
            <div style="margin-bottom: 10px; margin-left: 10px; display: flex; align-items: center;">
                <h3 style="margin-right: 20px; margin-top: 0; margin-bottom: 0;">重点研究基地申请</h3>
                <el-button type="primary" plain size="small" @click="addHandle" v-if="data.user.role === 'NORMAL_LABORATORY'">新增</el-button>
            </div>
            <el-table stripe :data="applyList" :header-cell-style="{ backgroundColor: '#e9edf2', color: '#333' }" class="table-center" empty-text="暂无数据">
                <el-table-column prop="id" label="申请编号" />
                <el-table-column prop="base_name" label="基地名称" />
                <el-table-column prop="establish_time" label="成立日期" width="120" />
                <el-table-column label="附件">
                    <template v-slot="scope">
                        <div v-if="scope.row.attachments_list?.length">
                            <div v-for="(file, index) in scope.row.attachments_list" :key="index">
                                <a :href="file.url" target="_blank" download class="file-link">
                                    {{ file.name }}
                                </a>
                            </div>
                        </div>
                        <span v-else>无附件</span>
                    </template>
                </el-table-column>

                <el-table-column prop="create_time" label="申请时间" width="120" />

                <el-table-column label="审核状态" width="110">
                    <template v-slot="scope">
                        <el-tag v-if="scope.row.state === 1 || scope.row.state === '1'" type="info">草稿</el-tag>
                        <el-tag v-else-if="scope.row.state === 0 || scope.row.state === '0'" type="warning">待审核</el-tag>
                        <el-tag v-else-if="scope.row.state === 2 || scope.row.state === '2'" type="success">校审通过</el-tag>
                        <el-tag v-else-if="scope.row.state === 3 || scope.row.state === '3'" type="danger">校审驳回</el-tag>
                        <el-tag v-else-if="scope.row.state === 4 || scope.row.state === '4'" type="success">终审通过</el-tag>
                        <el-tag v-else-if="scope.row.state === 5 || scope.row.state === '5'" type="danger">终审驳回</el-tag>
                        <el-tag v-else type="info">未知状态</el-tag>
                    </template>
                </el-table-column>

                <el-table-column label="审核意见">
                    <template v-slot="scope">
                        <div>{{ getReviewComments(scope.row) }}</div>
                    </template>
                </el-table-column>

                <!-- 操作列 -->
                <el-table-column label="操作" width="150" fixed="right">
                    <template v-slot="scope">
                        <el-tooltip content="查看申请信息" placement="bottom" effect="light">
                            <el-button @click="viewDetails(scope.row.id)" size="small" type="primary" circle :icon="View"></el-button>
                        </el-tooltip>
                        <el-tooltip content="修改申请信息" placement="bottom" effect="light">
                            <el-button @click="updateDetails(scope.row.id)" size="small" type="warning" circle :icon="EditPen"></el-button>
                        </el-tooltip>
                        <el-tooltip content="删除申请" placement="bottom" effect="light">
                            <el-button @click="deleteApply(scope.row.laboratory_id)" size="small" type="danger" circle :icon="Delete"></el-button>
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
                    layout="total, prev, pager, next, jumper"
                    :total="data.total">
                </el-pagination>
            </div>
        </div>
    </div>

    <transition name="fade" mode="out-in">
        <div v-if="pageStatus === 'add' || pageStatus === 'update'">
            <el-card class="main-card" style="margin-top:20px;">
                <div class="content-wrapper">
                    <!-- 左侧步骤条 -->
                    <div class="left-sidebar">
                        <el-steps :active="activeStep" finish-status="success" align-center direction="vertical">
                            <el-step title="基本情况" />
                            <el-step title="基地负责人情况" />
                            <el-step title="基地成员情况" />
                            <el-step title="现有基础" />
                            <el-step title="目标任务" />
                            <el-step title="建设思路举措" />
                            <el-step title="主要研究方向" />
                            <el-step title="依托高校支持举措" />
                            <el-step title="其他材料附件" />
                        </el-steps>
                    </div>

                <!-- 右侧内容 -->
                <div class="right-content">
                    <div v-if="activeStep === 0">
                        <h3>基本情况</h3>
                        <el-form :model="formData" label-width="120px">
                            <el-row :gutter="15">
                                <el-col :span="24">
                                    <el-form-item label="基地名称">
                                        <el-input v-model="formData.base_name" placeholder="请输入基地名称"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row :gutter="15">
                                <el-col :span="12">
                                    <el-form-item label="基地负责人">
                                        <el-input v-model="formData.base_leader_name" placeholder="请输入基地负责人"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="依托高校">
                                        <el-input v-model="formData.rely_university" placeholder="请输入依托高校"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row :gutter="15">
                                <el-col :span="12">
                                    <el-form-item label="联系人">
                                        <el-input v-model="formData.contact_person" placeholder="请输入联系人"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="联系电话">
                                        <el-input v-model="formData.contact_phone" placeholder="请输入联系电话"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row :gutter="15">
                                <el-col :span="12">
                                    <el-form-item label="成立时间">
                                        <el-date-picker v-model="formData.establish_time" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%;"></el-date-picker>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="是否实体">
                                        <el-radio-group v-model="formData.is_entity">
                                            <el-radio value="是">是</el-radio>
                                            <el-radio value="否">否</el-radio>
                                        </el-radio-group>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row :gutter="15">
                                <el-col :span="12">
                                    <el-form-item label="专兼职人员总数">
                                        <el-input-number v-model="formData.staff_count_full_part_time" :min="0" style="width: 100%;"></el-input-number>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="办公面积(平米)">
                                        <el-input-number v-model="formData.office_area" :min="0" :precision="2" style="width: 100%;"></el-input-number>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <el-row :gutter="15">
                                <el-col :span="24">
                                    <el-form-item label="主要依托学科">
                                        <div style="display: flex; gap: 10px; width: 100%; border: 1px solid #dcdfe6; padding: 10px; border-radius: 4px; background-color: #f9f9f9;">
                                            <el-input v-model="formData.main_rely_subject" placeholder="请输入学科名称" style="width: 40%"></el-input>
                                            <el-input v-model="formData.main_subject_desc" placeholder="请输入学科说明" style="width: 60%"></el-input>
                                        </div>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <el-row :gutter="15" v-for="(item, index) in formData.other_rely_subjects" :key="index">
                                <el-col :span="24">
                                    <el-form-item :label="index === 0 ? '其他依托学科' : ''">
                                        <div style="display: flex; align-items: center; gap: 10px; width: 100%; border: 1px solid #dcdfe6; padding: 10px; border-radius: 4px; background-color: #f9f9f9;">
                                            <el-input v-model="item.subject_name" placeholder="请输入学科名称" style="width: 40%"></el-input>
                                            <el-input v-model="item.subject_desc" placeholder="请输入学科说明" style="width: 50%"></el-input>
                                            <div style="display: flex; gap: 5px;">
                                                <el-button type="primary" circle :icon="Plus" size="small" @click="addOtherSubject"></el-button>
                                                <el-button type="danger" circle :icon="Minus" size="small" @click="removeOtherSubject(index)" v-if="formData.other_rely_subjects.length > 1"></el-button>
                                            </div>
                                        </div>
                                     </el-form-item>
                                 </el-col>
                             </el-row>
                         </el-form>

                        <div style="margin-top: 20px; display: flex; align-items: center;">
                            <h3 style="margin: 0; margin-right: 10px;">基地主要研究方向信息</h3>
                        </div>
                        <el-table :data="formData.main_research_directions" border style="margin-top: 10px;">
                            <el-table-column label="研究方向名称">
                                <template v-slot="scope"><el-input v-model="scope.row.direction_name"></el-input></template>
                            </el-table-column>
                            <el-table-column label="学术带头人姓名">
                                <template v-slot="scope"><el-input v-model="scope.row.academic_leader_name"></el-input></template>
                            </el-table-column>
                            <el-table-column label="职务 / 职称">
                                <template v-slot="scope"><el-input v-model="scope.row.leader_title_post"></el-input></template>
                            </el-table-column>
                            <el-table-column width="80" align="center">
                                <template #header>
                                    <el-button type="primary" circle :icon="Plus" size="small" @click="addResearchDirection"></el-button>
                                </template>
                                <template v-slot="scope">
                                    <el-button type="danger" circle :icon="Minus" size="small" @click="removeResearchDirection(scope.$index)"></el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                     </div>

                    <div v-if="activeStep === 1">
                        <h3>基地负责人基本信息</h3>
                        <el-form :model="formData" label-width="140px">
                            <el-row :gutter="15">
                                <el-col :span="12">
                                    <el-form-item label="姓名"><el-input v-model="formData.base_leader_name"></el-input></el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="性别">
                                        <el-select v-model="formData.base_leader_gender" style="width: 100%;">
                                            <el-option label="男" value="男"></el-option>
                                            <el-option label="女" value="女"></el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row :gutter="15">
                                <el-col :span="12">
                                    <el-form-item label="出生日期">
                                        <el-date-picker v-model="formData.base_leader_birth_date" type="date" value-format="YYYY-MM-DD" style="width: 100%;"></el-date-picker>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12"><el-form-item label="学位"><el-input v-model="formData.base_leader_degree"></el-input></el-form-item></el-col>
                            </el-row>
                            <el-row :gutter="15">
                                <el-col :span="12"><el-form-item label="职称"><el-input v-model="formData.base_leader_title"></el-input></el-form-item></el-col>
                                <el-col :span="12"><el-form-item label="行政职务"><el-input v-model="formData.base_leader_admin_post"></el-input></el-form-item></el-col>
                            </el-row>
                            <el-row :gutter="15">
                                <el-col :span="12"><el-form-item label="手机号码"><el-input v-model="formData.base_leader_mobile"></el-input></el-form-item></el-col>
                                <el-col :span="12"><el-form-item label="电子邮箱"><el-input v-model="formData.base_leader_email"></el-input></el-form-item></el-col>
                            </el-row>
                            <el-row :gutter="15">
                                <el-col :span="12"><el-form-item label="所在部门/院系"><el-input v-model="formData.base_leader_department"></el-input></el-form-item></el-col>
                                <el-col :span="12">
                                    <el-form-item label="主要研究方向">
                                        <el-input v-model="formData.base_leader_research_direction"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row :gutter="15">
                                <el-col :span="24">
                                    <el-form-item label="已入选省部级及以上重要人才计划">
                                        <el-input v-model="formData.base_leader_talent_plan" type="textarea" :rows="3"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </el-form>

                        <h3 style="margin-top: 30px;">负责人主要简介</h3>
                        <el-form :model="formData">
                            <el-form-item>
                                <Editor v-model="formData.leader_main_intro" placeholder="（基地负责人学习工作经历、在相关研究领域的学术积累和贡献、重要学术职务及在国内外重要学术会议主旨报告情况等，限600字）" style="width: 100%;" />
                                <div class="word-counter">字数：{{ countText(formData.leader_main_intro) }}/600</div>
                            </el-form-item>
                        </el-form>

                        <div style="display: flex; align-items: center; margin-top: 15px;">
                            <h3 style="margin: 0; margin-right: 10px;">主持重要科研项目（限5项以内）</h3>
                        </div>
                        <el-table :data="formData.leader_hosted_projects" border style="margin-top: 10px;">
                            <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
                            <el-table-column label="项目名称"><template v-slot="scope"><el-input v-model="scope.row.project_name"></el-input></template></el-table-column>
                            <el-table-column label="项目来源"><template v-slot="scope"><el-input v-model="scope.row.project_source"></el-input></template></el-table-column>
                            <el-table-column label="资助经费"><template v-slot="scope"><el-input v-model="scope.row.funding"></el-input></template></el-table-column>
                            <el-table-column label="起止时间" width="260">
                                <template v-slot="scope">
                                    <el-date-picker v-model="scope.row.start_end_time" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 100%;"></el-date-picker>
                                </template>
                            </el-table-column>
                            <el-table-column label="是否完成"><template v-slot="scope"><el-input v-model="scope.row.is_completed"></el-input></template></el-table-column>
                            <el-table-column width="80" align="center">
                                <template #header>
                                    <el-button type="primary" circle :icon="Plus" size="small" @click="addProject" :disabled="formData.leader_hosted_projects.length >= 5"></el-button>
                                </template>
                                <template v-slot="scope">
                                    <el-button type="danger" circle :icon="Minus" size="small" @click="removeProject(scope.$index)"></el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                        <div style="display: flex; align-items: center; margin-top: 15px;">
                            <h3 style="margin: 0; margin-right: 10px;">以第一完成人获科研成果奖励情况（限5项以内）</h3>
                        </div>
                        <el-table :data="formData.leader_awards" border style="margin-top: 10px;">
                            <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
                            <el-table-column label="成果名称"><template v-slot="scope"><el-input v-model="scope.row.achievement_name"></el-input></template></el-table-column>
                            <el-table-column label="奖励名称"><template v-slot="scope"><el-input v-model="scope.row.award_name"></el-input></template></el-table-column>
                            <el-table-column label="等级"><template v-slot="scope"><el-input v-model="scope.row.award_level"></el-input></template></el-table-column>
                            <el-table-column label="授予单位"><template v-slot="scope"><el-input v-model="scope.row.award_unit"></el-input></template></el-table-column>
                            <el-table-column label="授予时间" width="160">
                                <template v-slot="scope">
                                    <el-date-picker v-model="scope.row.award_time" type="date" value-format="YYYY-MM-DD" style="width: 100%;"></el-date-picker>
                                </template>
                            </el-table-column>
                            <el-table-column width="80" align="center">
                                <template #header>
                                    <el-button type="primary" circle :icon="Plus" size="small" @click="addAward" :disabled="formData.leader_awards.length >= 5"></el-button>
                                </template>
                                <template v-slot="scope">
                                    <el-button type="danger" circle :icon="Minus" size="small" @click="removeAward(scope.$index)"></el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                        <div style="display: flex; align-items: center; margin-top: 15px;">
                            <h3 style="margin: 0; margin-right: 10px;">以第一作者或通讯作者身份发表标志性著作、论文情况（限10项以内）</h3>
                        </div>
                        <el-table :data="formData.leader_publications" border style="margin-top: 10px;">
                            <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
                            <el-table-column label="论文或著作名称"><template v-slot="scope"><el-input v-model="scope.row.publication_name"></el-input></template></el-table-column>
                            <el-table-column label="期刊或出版社名称"><template v-slot="scope"><el-input v-model="scope.row.journal_publisher"></el-input></template></el-table-column>
                            <el-table-column label="发表时间" width="160">
                                <template v-slot="scope">
                                    <el-date-picker v-model="scope.row.publish_time" type="date" value-format="YYYY-MM-DD" style="width: 100%;"></el-date-picker>
                                </template>
                            </el-table-column>
                            <el-table-column label="作者情况（第一/通讯）"><template v-slot="scope"><el-input v-model="scope.row.author_role"></el-input></template></el-table-column>
                            <el-table-column label="引用、收录、转载情况"><template v-slot="scope"><el-input v-model="scope.row.citation_index_info"></el-input></template></el-table-column>
                            <el-table-column width="80" align="center">
                                <template #header>
                                    <el-button type="primary" circle :icon="Plus" size="small" @click="addPublication" :disabled="formData.leader_publications.length >= 10"></el-button>
                                </template>
                                <template v-slot="scope">
                                    <el-button type="danger" circle :icon="Minus" size="small" @click="removePublication(scope.$index)"></el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                        <div style="display: flex; align-items: center; margin-top: 15px;">
                            <h3 style="margin: 0; margin-right: 10px;">以第一完成人身份完成咨政建言情况（限5项以内）</h3>
                        </div>
                        <el-table :data="formData.leader_policy_reports" border style="margin-top: 10px;">
                            <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
                            <el-table-column label="咨政报告名称"><template v-slot="scope"><el-input v-model="scope.row.report_name"></el-input></template></el-table-column>
                            <el-table-column label="作者"><template v-slot="scope"><el-input v-model="scope.row.author"></el-input></template></el-table-column>
                            <el-table-column label="采纳时间" width="160">
                                <template v-slot="scope">
                                    <el-date-picker v-model="scope.row.adopt_time" type="date" value-format="YYYY-MM-DD" style="width: 100%;"></el-date-picker>
                                </template>
                            </el-table-column>
                            <el-table-column label="采纳批示及社会效益情况"><template v-slot="scope"><el-input v-model="scope.row.adopt_feedback"></el-input></template></el-table-column>
                            <el-table-column width="80" align="center">
                                <template #header>
                                    <el-button type="primary" circle :icon="Plus" size="small" @click="addPolicyReport" :disabled="formData.leader_policy_reports.length >= 5"></el-button>
                                </template>
                                <template v-slot="scope">
                                    <el-button type="danger" circle :icon="Minus" size="small" @click="removePolicyReport(scope.$index)"></el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                        <div style="display: flex; align-items: center; margin-top: 15px;">
                            <h3 style="margin: 0;">完成其他重要成果（限5项以内）</h3>
                            <el-tooltip content="包括社会服务、成果转化、专利授权、参与国家政策文件或行业标准起草、荣誉等" placement="top" effect="light">
                                <el-icon color="#909399" style="cursor: help; margin-top: 2px;"><Warning /></el-icon>
                            </el-tooltip>
                        </div>
                        <el-table :data="formData.leader_other_achievements" border style="margin-top: 10px;">
                            <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
                            <el-table-column label="成果名称"><template v-slot="scope"><el-input v-model="scope.row.achievement_name"></el-input></template></el-table-column>
                            <el-table-column label="作者"><template v-slot="scope"><el-input v-model="scope.row.author"></el-input></template></el-table-column>
                            <el-table-column label="发表时间" width="160">
                                <template v-slot="scope">
                                    <el-date-picker v-model="scope.row.publish_time" type="date" value-format="YYYY-MM-DD" style="width: 100%;"></el-date-picker>
                                </template>
                            </el-table-column>
                            <el-table-column label="成果类型"><template v-slot="scope"><el-input v-model="scope.row.achievement_type"></el-input></template></el-table-column>
                            <el-table-column label="成果简介"><template v-slot="scope"><el-input v-model="scope.row.achievement_intro"></el-input></template></el-table-column>
                            <el-table-column width="80" align="center">
                                <template #header>
                                    <el-button type="primary" circle :icon="Plus" size="small" @click="addOtherAchievement" :disabled="formData.leader_other_achievements.length >= 5"></el-button>
                                </template>
                                <template v-slot="scope">
                                    <el-button type="danger" circle :icon="Minus" size="small" @click="removeOtherAchievement(scope.$index)"></el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>

                    <div v-if="activeStep === 2">
                        <h3 style="margin-top: 20px;">主要学术骨干情况</h3>
                        <div style="display: flex; align-items: center; margin-bottom: 10px;">
                            <h4 style="margin: 0;">专职核心成员</h4>
                        </div>
                        <el-table :data="formData.full_time_core_members" border>
                            <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
                            <el-table-column label="姓名" width="90"><template v-slot="scope"><el-input autosize type="textarea" v-model="scope.row.name"></el-input></template></el-table-column>
                            <el-table-column label="性别" width="90">
                                <template v-slot="scope">
                                    <el-select v-model="scope.row.gender">
                                        <el-option label="男" value="男"></el-option>
                                        <el-option label="女" value="女"></el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <el-table-column label="出生年月" width="140">
                                <template v-slot="scope">
                                    <el-date-picker v-model="scope.row.birth_date" type="month" value-format="YYYY-MM" style="width: 100%;"></el-date-picker>
                                </template>
                            </el-table-column>
                            <el-table-column label="职称/学位" min-width="120"><template v-slot="scope"><el-input autosize type="textarea" v-model="scope.row.title_degree"></el-input></template></el-table-column>
                            <el-table-column label="研究方向" min-width="120"><template v-slot="scope"><el-input autosize type="textarea" v-model="scope.row.research_direction"></el-input></template></el-table-column>
                            <el-table-column label="所在单位" min-width="120"><template v-slot="scope"><el-input autosize type="textarea" v-model="scope.row.affiliation"></el-input></template></el-table-column>
                            <el-table-column label="成员分工" min-width="120"><template v-slot="scope"><el-input autosize type="textarea" v-model="scope.row.duty"></el-input></template></el-table-column>
                            <el-table-column label="本人签字" width="100" align="center">
                                <template v-slot="scope">
                                    <el-upload
                                        class="avatar-uploader"
                                        :action="baseUrl + '/files/upload'"
                                        :show-file-list="false"
                                        :on-success="(res) => handleSignatureSuccess(res, scope.row)"
                                    >
                                        <img v-if="scope.row.signature" :src="scope.row.signature" class="signature-img" />
                                        <el-button v-else type="primary" size="small">上传签名</el-button>
                                    </el-upload>
                                </template>
                            </el-table-column>
                            <el-table-column width="80" align="center" fixed="right">
                                <template #header>
                                    <el-button type="primary" circle :icon="Plus" size="small" @click="addFullTimeMember"></el-button>
                                </template>
                                <template v-slot="scope">
                                    <el-button type="danger" circle :icon="Minus" size="small" @click="removeFullTimeMember(scope.$index)"></el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                        <div style="display: flex; align-items: center; margin-top: 30px; margin-bottom: 10px;">
                            <h4 style="margin: 0;">兼职核心成员</h4>
                        </div>
                        <el-table :data="formData.part_time_core_members" border>
                            <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
                            <el-table-column label="姓名" width="90"><template v-slot="scope"><el-input v-model="scope.row.name"></el-input></template></el-table-column>
                            <el-table-column label="性别" width="90">
                                <template v-slot="scope">
                                    <el-select v-model="scope.row.gender">
                                        <el-option label="男" value="男"></el-option>
                                        <el-option label="女" value="女"></el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <el-table-column label="出生年月" width="140">
                                <template v-slot="scope">
                                    <el-date-picker v-model="scope.row.birth_date" type="month" value-format="YYYY-MM" style="width: 100%;"></el-date-picker>
                                </template>
                            </el-table-column>
                            <el-table-column label="职称/学位" min-width="120"><template v-slot="scope"><el-input v-model="scope.row.title_degree"></el-input></template></el-table-column>
                            <el-table-column label="研究方向" min-width="120"><template v-slot="scope"><el-input v-model="scope.row.research_direction"></el-input></template></el-table-column>
                            <el-table-column label="所在单位" min-width="120"><template v-slot="scope"><el-input v-model="scope.row.affiliation"></el-input></template></el-table-column>
                            <el-table-column label="成员分工" min-width="120"><template v-slot="scope"><el-input autosize type="textarea" v-model="scope.row.duty"></el-input></template></el-table-column>
                            <el-table-column label="本人签字" width="100" align="center">
                                <template v-slot="scope">
                                    <el-upload
                                        class="avatar-uploader"
                                        :action="baseUrl + '/files/upload'"
                                        :show-file-list="false"
                                        :on-success="(res) => handleSignatureSuccess(res, scope.row)"
                                    >
                                        <img v-if="scope.row.signature" :src="scope.row.signature" class="signature-img" />
                                        <el-button v-else type="primary" size="small">上传签名</el-button>
                                    </el-upload>
                                </template>
                            </el-table-column>
                            <el-table-column width="80" align="center" fixed="right">
                                <template #header>
                                    <el-button type="primary" circle :icon="Plus" size="small" @click="addPartTimeMember"></el-button>
                                </template>
                                <template v-slot="scope">
                                    <el-button type="danger" circle :icon="Minus" size="small" @click="removePartTimeMember(scope.$index)"></el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                        <h3 style="margin-top: 20px;">专职秘书</h3>
                        <el-form :model="formData" label-width="100px">
                            <el-row :gutter="15">
                                <el-col :span="8"><el-form-item label="姓名"><el-input v-model="formData.full_time_secretary_name"></el-input></el-form-item></el-col>
                                <el-col :span="8"><el-form-item label="性别"><el-input v-model="formData.full_time_secretary_gender"></el-input></el-form-item></el-col>
                                <el-col :span="8">
                                    <el-form-item label="出生年月">
                                        <el-date-picker v-model="formData.full_time_secretary_birth_date" type="month" value-format="YYYY-MM" style="width: 100%;"></el-date-picker>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row :gutter="15">
                                <el-col :span="8"><el-form-item label="电话"><el-input v-model="formData.full_time_secretary_telephone"></el-input></el-form-item></el-col>
                                <el-col :span="8"><el-form-item label="手机"><el-input v-model="formData.full_time_secretary_mobile"></el-input></el-form-item></el-col>
                                <el-col :span="8"><el-form-item label="电子邮箱"><el-input v-model="formData.full_time_secretary_email"></el-input></el-form-item></el-col>
                            </el-row>
                            <el-row :gutter="15">
                                <el-col :span="8"><el-form-item label="专业职称"><el-input v-model="formData.full_time_secretary_title"></el-input></el-form-item></el-col>
                                <el-col :span="8"><el-form-item label="学历"><el-input v-model="formData.full_time_secretary_education"></el-input></el-form-item></el-col>
                                <el-col :span="8"><el-form-item label="学位"><el-input v-model="formData.full_time_secretary_degree"></el-input></el-form-item></el-col>
                            </el-row>
                        </el-form>
                    </div>

                    <div v-if="activeStep === 3">
                        <h3>现有基础</h3>
                        <el-form :model="formData">
                            <el-form-item>
                                <Editor v-model="formData.existing_foundation" placeholder="现有基础、功能定位、主要特色、标志性成果与贡献，开展该领域研究的重大意义与实际价值等（限2000字）" style="width: 100%;" />
                                <div class="word-counter">字数：{{ countText(formData.existing_foundation) }}/2000</div>
                            </el-form-item>
                        </el-form>
                    </div>

                    <div v-if="activeStep === 4">
                        <h3>目标任务</h3>
                        <el-form :model="formData">
                            <el-form-item>
                                <Editor v-model="formData.target_task" placeholder="建设目标和主要任务（限1000字）" style="width: 100%;" />
                                <div class="word-counter">字数：{{ countText(formData.target_task) }}/1000</div>
                            </el-form-item>
                        </el-form>
                    </div>

                    <div v-if="activeStep === 5">
                        <h3>建设思路举措</h3>
                        <el-form :model="formData">
                            <el-form-item>
                                <Editor v-model="formData.construction_measures" placeholder="建设思路和具体措施（限2000字）" style="width: 100%;" />
                                <div class="word-counter">字数：{{ countText(formData.construction_measures) }}/2000</div>
                            </el-form-item>
                        </el-form>
                    </div>

                    <div v-if="activeStep === 6">
                        <h3 style="margin-bottom: 20px;">主要研究方向与内容</h3>
                        
                        <el-tabs v-if="formData.research_directions_detail.length > 0" v-model="activeDirectionIndex" type="card" closable @tab-remove="removeResearchDetail" @tab-add="addResearchDetail" addable>
                            <el-tab-pane 
                                v-for="(item, index) in formData.research_directions_detail" 
                                :key="index" 
                                :label="item.direction_name || `方向 ${index + 1}`" 
                                :name="String(index)">
                                <el-form label-width="100px" style="margin-top: 20px;">
                                    <el-form-item label="方向名称">
                                        <el-input v-model="item.direction_name" placeholder="请输入方向名称"></el-input>
                                    </el-form-item>
                                    <el-form-item label="主要内容">
                                        <Editor v-model="item.content" placeholder="本研究方向的特色、研究方法、学术价值、实践意义、预期成果和实际贡献等（限1000字）" style="width: 100%;" />
                                        <div class="word-counter">字数：{{ countText(item.content) }}/1000</div>
                                    </el-form-item>
                                </el-form>
                            </el-tab-pane>
                        </el-tabs>
                        <div v-else style="text-align: center; color: #909399; padding: 40px 0; border: 1px dashed #ebeef5;">
                            暂无研究方向，请点击上方按钮添加
                            <br><br>
                            <el-button type="primary" size="small" @click="addResearchDetail">添加方向</el-button>
                        </div>
                    </div>

                    <div v-if="activeStep === 7">
                        <h3>学校保障措施</h3>
                        <el-form :model="formData">
                            <el-form-item>
                                <Editor v-model="formData.university_support" placeholder="（依托高校为研究基地提供的资金、办公用房、招生指标、学术交流、制度建设等方面的支持情况，限1000字）" style="width: 100%;" />
                                <div class="word-counter">字数：{{ countText(formData.university_support) }}/1000</div>
                            </el-form-item>
                        </el-form>
                    </div>

                    <div v-if="activeStep === 8">
                        <h3>其他材料附件</h3>
                        <el-upload
                            class="upload-demo"
                            drag
                            :file-list="fileList"
                            :action="baseUrl + '/files/upload'"
                            :on-success="handleFileUpload"
                            :on-remove="handleRemove"
                            multiple
                        >
                            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                            <div class="el-upload__text">
                                将文件拖到此处，或 <em>点击上传</em>
                            </div>
                        </el-upload>
                    </div>

                    <div v-if="activeStep === 9" class="success-container">
                        <el-icon :size="200" color="#67c23a"><Check /></el-icon>
                        <h1>{{ formData.state === 1 ? '暂存成功' : '提交成功' }}</h1>
                        <el-button type="primary" @click="pageStatus = ''; securityAlertManager.hide()" style="margin-top: 20px;">返回列表</el-button>
                    </div>

                    <!-- 页面底部的导航按钮 -->
                    <div v-if="activeStep !== 9" class="navigation-buttons">
                        <el-button :style="{ opacity: activeStep === 0 ? 0 : 1 }" @click="prevTab" size="small">上一页</el-button>
                        <el-button v-if="activeStep !== 8" type="primary" @click="nextTab" size="small">下一页</el-button>
                        <el-button v-if="activeStep === 8" type="warning" @click="saveDraft" size="small">暂存</el-button>
                        <el-button v-if="activeStep === 8" type="success" @click="submitForm" size="small">提交</el-button>
                    </div>
                </div>
            </div>
            </el-card>
        </div>

        <div v-else-if="pageStatus === 'view'">
            <ResearchBaseCom :id="currentViewId" style="margin-top: 20px" />
        </div>
    </transition>

    <!-- 安全提醒组件 -->
    <SecurityAlert v-model="showSecurityAlert" @confirm="showSecurityAlert = false" />
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Check, Plus, Minus, Warning, View, EditPen, Delete, Search, UploadFilled } from '@element-plus/icons-vue';
import request from "@/utils/request.js";
import { usePaginationQuery } from '@/utils/paginationQuery.js';
import Editor from '@/components/Editor.vue';
import ResearchBaseCom from './componets/ResearchBaseCom.vue';
import SecurityAlert from '@/components/SecurityAlert.vue';
import { securityAlertManager } from '@/utils/securityAlert.js';

const baseUrl = import.meta.env?.VITE_BASE_URL || '';

const pageStatus = ref('');
const activeStep = ref(0);
const showSecurityAlert = ref(false);

watch(activeStep, (newVal) => {
    if (newVal === 8) {
        showSecurityAlert.value = true;
        securityAlertManager.show();
    } else {
        showSecurityAlert.value = false;
        securityAlertManager.hide();
    }
});

const activeDirectionIndex = ref('0');
const applyList = ref([]);
const fileList = ref([]);
const currentViewId = ref(null);
const searchId = ref('');
const searchBaseName = ref('');
const searchState = ref(null);

const data = reactive({
    user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
    pageNum: 1,
    pageSize: 5,
    total: 0
});

const paginationQuery = usePaginationQuery(data);

const handleSizeChange = (val) => {
    data.pageSize = val;
    data.pageNum = 1;
    paginationQuery.sync();
    fetchApplyList();
};

const handleCurrentChange = (val) => {
    data.pageNum = val;
    paginationQuery.sync();
    fetchApplyList();
};

const defaultFormData = {
    id: null,
    state: 1,
    base_name: '',
    rely_university: '', // 依托高校
    contact_person: '', // 联系人
    contact_phone: '', // 联系电话
    main_rely_subject: '',
    main_subject_desc: '',
    other_rely_subjects: [
        { subject_name: '', subject_desc: '' } // 默认有一个其他依托学科表单
    ],
    establish_time: '',
    is_entity: '是',
    staff_count_full_part_time: 0,
    office_area: 0,
    base_leader_name: '',
    base_leader_gender: '',
    base_leader_birth_date: '',
    base_leader_degree: '',
    base_leader_title: '',
    base_leader_admin_post: '',
    base_leader_mobile: '',
    base_leader_email: '',
    base_leader_talent_plan: '',
    base_leader_research_direction: '',
    base_leader_department: '',
    main_research_directions: [],
    leader_main_intro: '',
    leader_hosted_projects: [],
    leader_awards: [],
    leader_publications: [],
    leader_policy_reports: [],
    leader_other_achievements: [],
    full_time_core_members: [],
    part_time_core_members: [],
    full_time_secretary_name: '',
    full_time_secretary_gender: '',
    full_time_secretary_birth_date: '',
    full_time_secretary_telephone: '',
    full_time_secretary_mobile: '',
    full_time_secretary_email: '',
    full_time_secretary_title: '',
    full_time_secretary_education: '',
    full_time_secretary_degree: '',
    existing_foundation: '',
    target_task: '',
    construction_measures: '',
    research_directions_detail: [],
    university_support: '',
    attachments_list: []
};

const formData = ref(JSON.parse(JSON.stringify(defaultFormData)));

const fetchApplyList = async () => {
    try {
        paginationQuery.sync();
        const response = await request.get('/research_base_application_record/list', {
            params: {
                pageNum: data.pageNum,
                pageSize: data.pageSize,
                id: searchId.value || undefined,
                baseName: searchBaseName.value || undefined,
                state: searchState.value ?? undefined
            }
        });
        let resData = response?.data || response;
        if (resData) {
            if (Array.isArray(resData)) {
                applyList.value = resData;
                data.total = resData.length;
            } else if (resData.list && Array.isArray(resData.list)) {
                applyList.value = resData.list;
                data.total = resData.total || resData.list.length;
            } else if (resData.records && Array.isArray(resData.records)) {
                applyList.value = resData.records;
                data.total = resData.total || resData.records.length;
            } else {
                applyList.value = [resData];
                data.total = 1;
            }
        } else {
            applyList.value = [];
            data.total = 0;
        }
    } catch (error) {
        console.error('获取申请列表失败', error);
        applyList.value = [];
        data.total = 0;
    }
};

const handleSearch = async () => {
    paginationQuery.reset();
    fetchApplyList();
};

const resetSearch = () => {
    searchId.value = '';
    searchBaseName.value = '';
    searchState.value = null;
    paginationQuery.reset();
    fetchApplyList();
};

onMounted(fetchApplyList);

onUnmounted(() => {
    securityAlertManager.hide();
});

const getReviewComments = (row) => {
    const records = row.application_record_list || row.applicationRecordList || [];
    if (records.length > 0) {
        return records[0].reviewComments || records[0].review_comments || '';
    }
    return '';
};

const addHandle = () => {
    pageStatus.value = 'add';
    activeStep.value = 0;
    formData.value = JSON.parse(JSON.stringify(defaultFormData));
    fileList.value = [];
};

const updateDetails = async (id) => {
    pageStatus.value = 'update';
    activeStep.value = 0;
    try {
        const response = await request.get(`/research_base_apply_for/select/${id}`);
        formData.value = response.data;
        
        // 解析 JSON 字符串字段（兼容后端返回字符串或对象的情况）
        const jsonFields = [
            'other_rely_subjects', 'main_research_directions', 'leader_hosted_projects',
            'leader_awards', 'leader_publications', 'leader_policy_reports',
            'leader_other_achievements', 'full_time_core_members', 'part_time_core_members', 
            'research_directions_detail', 'attachments_list'
        ];
        jsonFields.forEach(field => {
            if (typeof formData.value[field] === 'string') {
                try {
                    formData.value[field] = JSON.parse(formData.value[field]);
                } catch (e) {
                    console.error(`解析 ${field} 失败`, e);
                    formData.value[field] = [];
                }
            } else if (!formData.value[field]) {
                formData.value[field] = [];
            }
        });

        if (!formData.value.attachments_list) formData.value.attachments_list = [];
        fileList.value = formData.value.attachments_list.map(f => ({ name: f.name, url: f.url }));

        // 处理 start_end_time，将其转回数组以便 el-date-picker 渲染
        if (formData.value.leader_hosted_projects) {
            formData.value.leader_hosted_projects.forEach(project => {
                if (typeof project.start_end_time === 'string' && project.start_end_time.includes(' 至 ')) {
                    project.start_end_time = project.start_end_time.split(' 至 ');
                } else if (typeof project.start_end_time === 'string' && project.start_end_time.includes(',')) {
                    project.start_end_time = project.start_end_time.split(',');
                } else if (typeof project.start_end_time === 'string' && project.start_end_time) {
                    // 如果不是上面的格式，可能需要处理成数组
                    project.start_end_time = [project.start_end_time, project.start_end_time];
                }
            });
        }
    } catch (error) {
        console.error('获取详细信息失败', error);
    }
};

const viewDetails = (id) => {
    currentViewId.value = id;
    pageStatus.value = 'view';
};

const deleteApply = async (laboratoryId) => {
    try {
        await ElMessageBox.confirm('确定要删除该申请吗？该操作不可恢复', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const response = await request.delete(`/research_base_apply_for/delete/${laboratoryId}`);
        if (response.code === '200') {
            ElMessage.success('删除成功');
            fetchApplyList();
        } else {
            ElMessage.error(response.msg || '删除失败');
        }
    } catch (error) {
        if (error !== 'cancel') {
            console.error('删除失败', error);
            ElMessage.error('删除失败，请稍后重试');
        }
    }
};

const nextTab = () => activeStep.value += 1;
const prevTab = () => { if (activeStep.value > 0) activeStep.value -= 1; };

const addOtherSubject = () => formData.value.other_rely_subjects.push({ subject_name: '', subject_desc: '' });
const removeOtherSubject = (idx) => formData.value.other_rely_subjects.splice(idx, 1);

const addResearchDirection = () => formData.value.main_research_directions.push({ direction_name: '', academic_leader_name: '', leader_title_post: '' });
const removeResearchDirection = (idx) => formData.value.main_research_directions.splice(idx, 1);

const addProject = () => formData.value.leader_hosted_projects.push({ project_name: '', project_source: '', funding: '', start_end_time: '', is_completed: '' });
const removeProject = (idx) => formData.value.leader_hosted_projects.splice(idx, 1);

const addAward = () => { if(formData.value.leader_awards.length < 5) formData.value.leader_awards.push({ achievement_name: '', award_name: '', award_level: '', award_unit: '', award_time: '' })};
const removeAward = (idx) => formData.value.leader_awards.splice(idx, 1);

const addPublication = () => { if(formData.value.leader_publications.length < 10) formData.value.leader_publications.push({ publication_name: '', journal_publisher: '', publish_time: '', author_role: '', citation_index_info: '' })};
const removePublication = (idx) => formData.value.leader_publications.splice(idx, 1);

const addPolicyReport = () => { if(formData.value.leader_policy_reports.length < 5) formData.value.leader_policy_reports.push({ report_name: '', author: '', adopt_time: '', adopt_feedback: '' })};
const removePolicyReport = (idx) => formData.value.leader_policy_reports.splice(idx, 1);

const addOtherAchievement = () => { if(formData.value.leader_other_achievements.length < 5) formData.value.leader_other_achievements.push({ achievement_name: '', author: '', publish_time: '', achievement_type: '', achievement_intro: '' })};
const removeOtherAchievement = (idx) => formData.value.leader_other_achievements.splice(idx, 1);

const addFullTimeMember = () => formData.value.full_time_core_members.push({ name: '', gender: '男', birth_date: '', title_degree: '', research_direction: '', affiliation: '', duty: '', signature: '' });
const removeFullTimeMember = (idx) => formData.value.full_time_core_members.splice(idx, 1);

const addPartTimeMember = () => formData.value.part_time_core_members.push({ name: '', gender: '男', birth_date: '', title_degree: '', research_direction: '', affiliation: '', duty: '', signature: '' });
const removePartTimeMember = (idx) => formData.value.part_time_core_members.splice(idx, 1);

const handleSignatureSuccess = (res, row) => {
    if (res.code === "200") {
        row.signature = res.data;
        ElMessage.success("签名上传成功");
    } else {
        ElMessage.error("签名上传失败");
    }
};

const addResearchDetail = () => {
    formData.value.research_directions_detail.push({ direction_name: '', content: '' });
    activeDirectionIndex.value = String(formData.value.research_directions_detail.length - 1);
};
const removeResearchDetail = (idx) => {
    const index = parseInt(idx, 10);
    formData.value.research_directions_detail.splice(index, 1);
    if (formData.value.research_directions_detail.length === 0) {
        activeDirectionIndex.value = '0';
    } else if (index <= parseInt(activeDirectionIndex.value, 10)) {
        activeDirectionIndex.value = String(Math.max(0, parseInt(activeDirectionIndex.value, 10) - 1));
    }
};

const handleFileUpload = (res, file) => {
    if (res.code === "200") {
        const url = res.data;
        const name = url.split("-").pop() || file.name;
        formData.value.attachments_list.push({ name, url, type: 'file' });
        fileList.value.push({ name, url });
    } else {
        ElMessage.error("文件上传失败");
    }
};

const handleRemove = (file) => {
    formData.value.attachments_list = formData.value.attachments_list.filter(f => f.url !== file.url);
    fileList.value = fileList.value.filter(item => item.url !== file.url);
};

// 辅助函数：计算纯文本字数
const countText = (html) => {
    if (!html) return 0;
    // 移除 HTML 标签
    let text = html.replace(/<[^>]+>/g, '');
    // 移除 HTML 实体如 &nbsp;
    text = text.replace(/&[a-z]+;/gi, '');
    // 移除所有的空格、换行符等空白字符
    text = text.replace(/\s+/g, '');
    return text.length;
};

// 辅助函数：过滤掉全空的行，并将空字符串替换为 null
const cleanPayload = (data) => {
    const payload = { ...data };
    const arrayFields = [
        'other_rely_subjects', 'main_research_directions', 'leader_hosted_projects',
        'leader_awards', 'leader_publications', 'leader_policy_reports',
        'leader_other_achievements', 'full_time_core_members', 'part_time_core_members',
        'research_directions_detail'
    ];

    // 处理对象根级别的富文本空标签
    for (const key in payload) {
        if (payload[key] === '<p><br></p>' || payload[key] === '') {
            payload[key] = null;
        }
    }

    arrayFields.forEach(field => {
        if (Array.isArray(payload[field])) {
            payload[field] = payload[field]
                .map(item => {
                    const newItem = {};
                    let hasValue = false;
                    for (const key in item) {
                        if (item[key] === '' || item[key] === undefined || item[key] === '<p><br></p>') {
                            newItem[key] = null;
                        } else if (Array.isArray(item[key]) && key === 'start_end_time') {
                            newItem[key] = item[key].join(' 至 ');
                            hasValue = true;
                        } else {
                            newItem[key] = item[key];
                            if (item[key] !== null) {
                                hasValue = true;
                            }
                        }
                    }
                    return hasValue ? newItem : null;
                })
                .filter(item => item !== null); // 过滤掉全空的行
        }
    });
    return payload;
};

const submitData = (stateValue) => {
    formData.value.state = stateValue;
    const isUpdate = !!formData.value.id;
    const apiPath = isUpdate ? `/research_base_apply_for/update/${formData.value.id}` : '/research_base_apply_for/add';
    const method = isUpdate ? request.put : request.post;

    const payload = cleanPayload(formData.value);

    method(apiPath, payload).then(res => {
        if (res.code === '200') {
            ElMessage.success(stateValue === 1 ? '已暂存！' : '提交成功！');
            activeStep.value = 9;
            fetchApplyList();
            setTimeout(() => {
                pageStatus.value = '';
                securityAlertManager.hide();
            }, 2000);
        } else {
            ElMessage.error(res.msg || '操作失败');
        }
    }).catch(error => {
        console.error('提交失败', error);
        ElMessage.error('网络或服务器错误');
    });
};

const saveDraft = () => submitData(1);
const submitForm = () => submitData(0);
</script>

<style scoped>
.main-card {
    display: flex;
    width: 100%;
    margin: 0 auto;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    flex: 1;
    flex-direction: column;
}
.content-wrapper {
    display: flex;
    width: 100%;
    height: 100%;
}
.left-sidebar {
    margin: 10px 15px 0 15px;
    padding: 10px 20px 10px 10px;
    border-right: 1px solid #eaeaea;
    width: 200px;
}
.right-content {
    flex: 1;
    padding: 0 25px 0 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow-y: auto;
    min-height: 500px;
}
.navigation-buttons {
    display: flex;
    justify-content: flex-end;
    padding: 10px 0;
    gap: 10px;
    margin-top: 20px;
}
.success-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #67c23a;
}

:deep(.el-table) {
    --el-table-header-bg-color: #f5f7fa;
    --el-table-header-text-color: #333;
}
:deep(.el-table th.el-table__cell) {
    background-color: var(--el-table-header-bg-color) !important;
}

:deep(.el-tabs__new-tab) {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--el-color-primary);
    height: 25px;
    width: 25px;
    line-height: 28px;
    margin: 6px 0 6px 10px;
    border-radius: 4px;
    text-align: center;
    font-size: 16px;
    color: var(--el-color-primary);
    cursor: pointer;
    transition: all 0.15s;
    background-color: #ecf5ff;
}
:deep(.el-tabs__new-tab:hover) {
    background-color: var(--el-color-primary);
    color: #fff;
}

.avatar-uploader {
    height: auto !important;
}
.avatar-uploader .el-upload {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    min-height: 40px;
    padding: 5px;
}
.avatar-uploader .el-upload:hover {
    border-color: var(--el-color-primary);
}

.signature-img {
    width: 80px;
    height: 40px;
    display: block;
    object-fit: contain;
}

.word-counter {
    font-size: 13px;
    color: #999;
    margin-top: 5px;
    text-align: right;
    width: 100%;
}
.word-counter.text-danger {
    color: #f56c6c;
    font-weight: bold;
}
</style>
