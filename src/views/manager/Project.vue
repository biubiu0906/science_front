<template>
  <div class="project-page">
    <div class="card" style="margin-bottom: 5px">
      <el-input v-model="data.code" :prefix-icon="Search" style="width: 200px; margin-right: 10px"
        placeholder="请输入立项编号查询"></el-input>
      <el-input v-model="data.name" :prefix-icon="Search" style="width: 200px; margin-right: 10px"
        placeholder="请输入项目名称查询"></el-input>
      <el-input v-model="data.teacherName" :prefix-icon="Search" style="width: 180px; margin-right: 10px"
        placeholder="请输入申请教师查询"></el-input>
      <el-select v-if="canFilterBySchool" v-model="data.schoolId" placeholder="请选择学校" clearable filterable
        style="width: 180px; margin-right: 10px">
        <el-option v-for="school in data.schools" :key="school.id" :label="school.name" :value="school.id" />
      </el-select>
      <el-select v-model="data.researchType" placeholder="研究类型" clearable style="width: 140px; margin-right: 10px">
        <el-option label="基础研究" value="基础研究" />
        <el-option label="应用研究" value="应用研究" />
        <el-option label="开发研究" value="开发研究" />
        <el-option label="其他" value="其他" />
      </el-select>
      <el-select v-model="data.projectStatus" placeholder="项目状态" clearable style="width: 130px; margin-right: 10px">
        <el-option label="在研" value="0" />
        <el-option label="结项" value="1" />
        <el-option label="未开始" value="2" />
      </el-select>
      <el-button type="info" plain size="small" @click="search">查询</el-button>
      <el-button type="warning" plain size="small" style="margin: 0 10px" @click="reset">重置</el-button>
    </div>

    <div class="card project-table-card" style="margin-bottom: 5px" v-loading="data.loading" element-loading-text="数据加载中...">
      <div style="margin-bottom: 10px; margin-left: 10px;" v-if="data.laboratoryLevel === 2">
        <el-button type="primary" plain size="small" @click="handleAdd">新增</el-button>
      </div>
      <el-table stripe :data="data.tableData" :header-cell-style="{ backgroundColor: '#e9edf2' }" class="table-center project-table" empty-text="暂无数据">
        <el-table-column label="序号" type="index" :index="indexMethod" width="60"/>
        <el-table-column prop="name" label="项目名称" min-width="150" sortable />
        <el-table-column prop="code" label="立项编号" min-width="140" sortable />
        <el-table-column prop="researchType" label="研究类型" min-width="120" sortable />
        <el-table-column prop="subjectCategory" label="学科" min-width="100" sortable />
        <el-table-column prop="projectNature" label="项目性质" min-width="150" sortable />
        <el-table-column prop="projectLevel" label="课题类别" min-width="120" sortable />
        <el-table-column prop="projectStatus" label="项目状态" min-width="110" sortable>
          <template v-slot="scope">
            <el-tag v-if="scope.row.projectStatus === '0'" type="primary">在研</el-tag>
            <el-tag v-if="scope.row.projectStatus === '1'" type="success">结项</el-tag>
            <el-tag v-if="scope.row.projectStatus === '2'" type="info">未开始</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="teacherName" label="申请教师" min-width="110" sortable />
        <el-table-column prop="status" label="审核状态" min-width="110" sortable>
          <template v-slot="scope">
            <el-tag :type="getApprovalStatusTagType(scope.row.status)">{{ getApprovalStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="审核信息" min-width="110" show-overflow-tooltip sortable>
          <template v-slot="scope">
            <div :class="getContentAlignClass(scope.row.reason)">
              {{ scope.row.reason }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="审核时间" min-width="160" show-overflow-tooltip sortable />
        <el-table-column label="操作" width="120" fixed="right">
          <template v-slot="scope">
            <el-tooltip content="查看详情" placement="bottom" effect="light">
              <el-button type="primary" circle :icon="View" size="small" @click="handleQuery(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip v-if="canEditProject(data.user.role, scope.row.status)" :content="isRejectedProjectStatus(scope.row.status) ? '修改后重新提交' : '编辑项目'" placement="bottom" effect="light">
              <el-button type="primary" circle :icon="Edit" size="small" @click="handleEdit(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip v-if="canReviewProjectOrAchievement(data.user.role, scope.row.status)" content="审核项目" placement="bottom" effect="light">
              <el-button type="warning" circle :icon="Tickets" size="small" @click="handleCheck(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除项目" placement="bottom" effect="light">
              <el-button type="danger" circle :icon="Delete" size="small" @click="del(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="card project-pagination-card">
      <el-pagination
        @current-change="load"
        @size-change="(size) => (paginationQuery.setPageSize(size), load())"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[5, 10, 20, 50, 100]"
        v-model:page-size="data.pageSize"
        v-model:current-page="data.pageNum"
        :total="data.total"
      />
    </div>

    <!-- 科研项目新增/查看抽屉 -->
    <el-drawer 
      v-model="data.formVisible" 
      direction="rtl" 
      size="55%" 
      destroy-on-close
      @close="handleDrawerClose"
      @opened="handleDrawerOpened"
      :before-close="handleBeforeClose">
      <template #header>
        <div style="font-size: 18px; color: #303133; font-weight: 500;">
          {{ data.isViewMode ? '科研项目详情' : '科研项目新增' }}
        </div>
      </template>
      <div style="display: flex; height: 100%;">
        <!-- 左侧标签页 -->
        <div>
          <el-tabs 
            v-model="data.activeTab" 
            tab-position="left" 
            style="height: 100%;"
            @tab-change="handleTabChange">
            <el-tab-pane label="项目信息" name="projectInfo"></el-tab-pane>
            <el-tab-pane label="团队成员" name="teamMembers"></el-tab-pane>
            <el-tab-pane label="合作研究单位" name="cooperativeUnits"></el-tab-pane>
            <el-tab-pane label="立项/结项信息" name="projectStatus"></el-tab-pane>
            <el-tab-pane label="项目经费预算" name="budgetInfo"></el-tab-pane>
            <el-tab-pane label="附件材料" name="attachments"></el-tab-pane>
          </el-tabs>
        </div>
        
        <!-- 右侧内容区域 -->
        <div class="tab-content-wrapper" style="flex: 1; padding-left: 20px; overflow-y: auto;">
          <!-- 项目信息标签页内容 -->
          <div v-show="data.activeTab === 'projectInfo'" :key="'projectInfo'">
            <el-form ref="formRef" :rules="data.isViewMode ? {} : rules" :model="data.form" label-width="120px">
              <el-form-item prop="name" label="项目名称" :required="!data.isViewMode">
                <el-input
                  v-model="data.form.name"
                  :disabled="data.isViewMode"
                  :maxlength="PROJECT_NAME_MAX_LENGTH"
                  :show-word-limit="!data.isViewMode"
                  :placeholder="data.isViewMode && !data.form.name ? '暂无信息' : `请输入项目名称，最多${PROJECT_NAME_MAX_LENGTH}个字符`"
                  style="width: 70%;"
                ></el-input>
              </el-form-item>
              <el-form-item prop="researchType" label="研究类型" :required="!data.isViewMode">
                <el-select v-model="data.form.researchType" :disabled="data.isViewMode" :placeholder="data.isViewMode && !data.form.researchType ? '暂无信息' : '请选择研究类型'" style="width: 70%;">
                  <el-option label="基础研究" value="基础研究"></el-option>
                  <el-option label="应用研究" value="应用研究"></el-option>
                  <el-option label="开发研究" value="开发研究"></el-option>
                  <el-option label="其他" value="其他"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="subjectCategory" label="学科分类" :required="!data.isViewMode">
                <el-select v-model="data.form.subjectCategory" :disabled="data.isViewMode" :placeholder="data.isViewMode && !data.form.subjectCategory ? '暂无信息' : '请选择学科分类'" style="width: 70%;">
                  <el-option label="哲学" value="哲学"></el-option>
                  <el-option label="经济学" value="经济学"></el-option>
                  <el-option label="法学" value="法学"></el-option>
                  <el-option label="教育学" value="教育学"></el-option>
                  <el-option label="文学" value="文学"></el-option>
                  <el-option label="历史学" value="历史学"></el-option>
                  <el-option label="理学" value="理学"></el-option>
                  <el-option label="工学" value="工学"></el-option>
                  <el-option label="农学" value="农学"></el-option>
                  <el-option label="医学" value="医学"></el-option>
                  <el-option label="军事学" value="军事学"></el-option>
                  <el-option label="管理学" value="管理学"></el-option>
                  <el-option label="艺术学" value="艺术学"></el-option>
                  <el-option label="交叉学科" value="交叉学科"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="projectNature" label="项目性质" :required="!data.isViewMode">
                <el-select v-model="data.form.projectNature" :disabled="data.isViewMode" :placeholder="data.isViewMode && !data.form.projectNature ? '暂无信息' : '请选择项目性质'" style="width: 70%;">
                  <el-option label="纵向课题" value="纵向课题" />
                  <el-option label="横向课题" value="横向课题" />
                </el-select>
              </el-form-item>
              <el-form-item prop="projectLevel" label="课题类别" :required="!data.isViewMode">
                <el-select v-model="data.form.projectLevel" :disabled="data.isViewMode" :placeholder="data.isViewMode && !data.form.projectLevel ? '暂无信息' : '请选择课题类别'" style="width: 70%;">
                  <el-option label="国社科" value="国社科"></el-option>
                  <el-option label="国自科" value="国自科"></el-option>
                  <el-option label="国社科单列" value="国社科单列"></el-option>
                  <el-option label="省社科" value="省社科"></el-option>
                  <el-option label="省自科" value="省自科"></el-option>
                  <el-option label="其他" value="其他"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="expectedResults" label="预期成果">
                <el-input
                  v-model="data.form.expectedResults"
                  :disabled="data.isViewMode"
                  type="textarea"
                  :rows="4"
                  :maxlength="EXPECTED_RESULTS_MAX_LENGTH"
                  :show-word-limit="!data.isViewMode"
                  :placeholder="data.isViewMode && !data.form.expectedResults ? '暂无信息' : `请输入预期成果描述，最多${EXPECTED_RESULTS_MAX_LENGTH}个字符`"
                  style="width: 70%;"
                ></el-input>
              </el-form-item>
            </el-form>
          </div>
          

          
          <!-- 团队成员标签页内容 -->
          <div v-show="data.activeTab === 'teamMembers'" :key="'teamMembers'">
            <div v-if="!data.isViewMode" style="margin-bottom: 20px; text-align: right;">
              <el-button type="primary" size="small" @click="data.showTeamMemberDialog = true">
                新增
              </el-button>
            </div>
            
            <!-- 团队成员表格 -->
            <el-table :data="data.form.teamMembers" border style="width: 100%" :header-cell-style="{ backgroundColor: '#e9edf2' }" class="table-center" empty-text="暂无团队成员">
              <el-table-column prop="name" label="姓名" width="80"></el-table-column>
              <el-table-column prop="role" label="参与角色" width="95"></el-table-column>
              <el-table-column prop="affiliation" label="署名/代表单位" min-width="200"></el-table-column>
              <el-table-column v-if="!data.isViewMode" label="操作" width="60">
                <template #default="{ $index }">
                  <el-tooltip content="删除团队成员" placement="bottom" effect="light">
                    <el-button type="danger" circle :icon="Delete" size="small" @click="removeTeamMember($index)"></el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
            
            <div v-if="data.form.teamMembers.length === 0" style="text-align: center; color: #999; padding: 40px;">
              暂无团队成员信息
            </div>
          </div>
          
          <!-- 合作研究单位标签页内容 -->
          <div v-show="data.activeTab === 'cooperativeUnits'" :key="'cooperativeUnits'">
            <div v-if="!data.isViewMode" style="margin-bottom: 20px; text-align: right;">
              <el-button type="primary" size="small" @click="data.showCooperativeUnitDialog = true">
                新增
              </el-button>
            </div>
            
            <!-- 合作研究单位表格 -->
            <el-table :data="data.form.cooperativeUnits" border style="width: 100%" :header-cell-style="{ backgroundColor: '#e9edf2' }" class="table-center" empty-text="暂无合作单位">
              <el-table-column prop="unitName" label="单位名称" width="370"></el-table-column>
              <el-table-column prop="completionUnit" label="完成单位" min-width="200"></el-table-column>
              <el-table-column v-if="!data.isViewMode" label="操作" width="60">
                <template #default="{ $index }">
                  <el-tooltip content="删除合作单位" placement="bottom" effect="light">
                    <el-button type="danger" circle :icon="Delete" size="small" @click="removeCooperativeUnit($index)"></el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
            
            <div v-if="data.form.cooperativeUnits.length === 0" style="text-align: center; color: #999; padding: 40px;">
              暂无合作研究单位信息
            </div>
          </div>
          
          <!-- 立项/结项信息标签页内容 -->
          <div v-show="data.activeTab === 'projectStatus'" :key="'projectStatus'">
            <el-form ref="formRef" :rules="data.isViewMode ? {} : rules" :model="data.form" label-width="120px">
              <el-form-item prop="establishmentTime" label="立项时间" :required="!data.isViewMode">
                <el-date-picker 
                  v-model="data.form.establishmentTime" 
                  :disabled="data.isViewMode"
                  type="date" 
                  :placeholder="data.isViewMode && !data.form.establishmentTime ? '暂无信息' : '请选择立项时间'"
                  value-format="YYYY-MM-DD"
                  style="width: 70%;">
                </el-date-picker>
              </el-form-item>
              <el-form-item prop="midCheckTime" label="中检时间">
                <el-date-picker 
                  v-model="data.form.midCheckTime" 
                  :disabled="data.isViewMode"
                  type="date" 
                  :placeholder="data.isViewMode && !data.form.midCheckTime ? '暂无信息' : '请选择中检时间'"
                  value-format="YYYY-MM-DD"
                  style="width: 70%;">
                </el-date-picker>
              </el-form-item>
              <el-form-item prop="projectStatus" label="项目当前状态" :required="!data.isViewMode">
                <template v-if="data.isViewMode && (data.form.projectStatus === null || data.form.projectStatus === undefined || data.form.projectStatus === '')">
                  <el-input disabled placeholder="暂无信息" style="width: 70%;"></el-input>
                </template>
                <el-radio-group v-else v-model="data.form.projectStatus" :disabled="data.isViewMode" style="width: 70%;">
                  <el-radio value="0">在研</el-radio>
                  <el-radio value="1">结项</el-radio>
                  <el-radio value="2">未开始</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item prop="completionAppraisal" label="结项鉴定情况">
                <el-select v-model="data.form.completionAppraisal" :disabled="data.isViewMode" :placeholder="data.isViewMode && !data.form.completionAppraisal ? '暂无信息' : '请选择结项鉴定情况'" style="width: 70%;">
                  <el-option label="未鉴定" value="未鉴定"></el-option>
                  <el-option label="合格" value="合格"></el-option>
                  <el-option label="不合格" value="不合格"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="plannedCompletionTime" label="计划完成时间" :required="!data.isViewMode">
                <el-date-picker 
                  v-model="data.form.plannedCompletionTime" 
                  :disabled="data.isViewMode"
                  type="date" 
                  :placeholder="data.isViewMode && !data.form.plannedCompletionTime ? '暂无信息' : '请选择计划完成时间'"
                  value-format="YYYY-MM-DD"
                  :disabled-date="disableCompletionDate"
                  style="width: 70%;">
                </el-date-picker>
              </el-form-item>
              <el-form-item prop="actualCompletionTime" label="实际结项时间">
                <el-date-picker 
                  v-model="data.form.actualCompletionTime" 
                  :disabled="data.isViewMode"
                  type="date" 
                  :placeholder="data.isViewMode && !data.form.actualCompletionTime ? '暂无信息' : '请选择实际结项时间'"
                  value-format="YYYY-MM-DD"
                  :disabled-date="disableCompletionDate"
                  style="width: 70%;">
                </el-date-picker>
              </el-form-item>
            </el-form>
          </div>
          
          <!-- 项目经费预算标签页内容 -->
          <div v-show="data.activeTab === 'budgetInfo'" :key="'budgetInfo'">
            <el-form ref="formRef" :rules="data.isViewMode ? {} : rules" :model="data.form" label-width="120px">
              <el-form-item prop="approvedFunding" label="获批经费(万元)" :required="!data.isViewMode">
                <template v-if="data.isViewMode && (data.form.approvedFunding === null || data.form.approvedFunding === undefined || data.form.approvedFunding === '')">
                  <el-input disabled placeholder="暂无信息" style="width: 70%;"></el-input>
                </template>
                <el-input-number 
                  v-else
                  v-model="data.form.approvedFunding" 
                  :disabled="data.isViewMode"
                  :min="0" 
                  :precision="2"
                  placeholder="请输入获批经费"
                  style="width: 70%;">
                  <template #append>万元</template>
                </el-input-number>
              </el-form-item>
              <el-form-item prop="matchingFunding" label="配套经费(万元)">
                <template v-if="data.isViewMode && (data.form.matchingFunding === null || data.form.matchingFunding === undefined || data.form.matchingFunding === '')">
                  <el-input disabled placeholder="暂无信息" style="width: 70%;"></el-input>
                </template>
                <el-input-number 
                  v-else
                  v-model="data.form.matchingFunding" 
                  :disabled="data.isViewMode"
                  :min="0" 
                  :precision="2"
                  placeholder="请输入配套经费"
                  style="width: 70%;">
                  <template #append>万元</template>
                </el-input-number>
              </el-form-item>
              <el-form-item prop="receivedFunding" label="到账经费(万元)">
                <template v-if="data.isViewMode && (data.form.receivedFunding === null || data.form.receivedFunding === undefined || data.form.receivedFunding === '')">
                  <el-input disabled placeholder="暂无信息" style="width: 70%;"></el-input>
                </template>
                <el-input-number 
                  v-else
                  v-model="data.form.receivedFunding" 
                  :disabled="data.isViewMode"
                  :min="0" 
                  :precision="2"
                  placeholder="请输入到账经费"
                  style="width: 70%;">
                  <template #append>万元</template>
                </el-input-number>
              </el-form-item>
              <el-form-item prop="longitudinalFunding" label="纵向经费(万元)">
                <template v-if="data.isViewMode && (data.form.longitudinalFunding === null || data.form.longitudinalFunding === undefined || data.form.longitudinalFunding === '')">
                  <el-input disabled placeholder="暂无信息" style="width: 70%;"></el-input>
                </template>
                <el-input-number 
                  v-else
                  v-model="data.form.longitudinalFunding" 
                  :disabled="data.isViewMode"
                  :min="0" 
                  :precision="2"
                  placeholder="请输入纵向经费"
                  style="width: 70%;">
                  <template #append>万元</template>
                </el-input-number>
              </el-form-item>
              <el-form-item prop="transverseFunding" label="横向经费(万元)">
                <template v-if="data.isViewMode && (data.form.transverseFunding === null || data.form.transverseFunding === undefined || data.form.transverseFunding === '')">
                  <el-input disabled placeholder="暂无信息" style="width: 70%;"></el-input>
                </template>
                <el-input-number 
                  v-else
                  v-model="data.form.transverseFunding" 
                  :disabled="data.isViewMode"
                  :min="0" 
                  :precision="2"
                  placeholder="请输入横向经费"
                  style="width: 70%;">
                  <template #append>万元</template>
                </el-input-number>
              </el-form-item>
              <el-form-item prop="projectFinanceAccount" label="项目财务账号">
                <el-input v-model="data.form.projectFinanceAccount" :disabled="data.isViewMode" :placeholder="data.isViewMode && !data.form.projectFinanceAccount ? '暂无信息' : '请输入项目财务账号'" style="width: 70%;"></el-input>
              </el-form-item>
            </el-form>
          </div>


          
          <!-- 附件材料标签页内容 -->
          <div v-show="data.activeTab === 'attachments'" :key="'attachments'">
            <div v-if="!data.isViewMode" style="margin-bottom: 20px; text-align: right;">
              <el-button type="primary" size="small" @click="openAttachmentDialog">
                新增
              </el-button>
            </div>
            
            <!-- 附件材料表格 -->
            <el-table :data="data.form.attachments" border style="width: 100%" :header-cell-style="{ backgroundColor: '#e9edf2' }" class="table-center" empty-text="暂无附件">
              <el-table-column label="文件名" min-width="120">
                <template #default="scope">
                  {{ getDisplayFileName(scope.row.fileName) }}
                </template>
              </el-table-column>
              <el-table-column prop="fileCategory" label="文件类别" min-width="120"></el-table-column>
              <el-table-column prop="fileDescription" label="文件简介" min-width="150"></el-table-column>
              <el-table-column label="操作" width="130">
                <template #default="scope">
                  <el-tooltip content="预览文件" placement="bottom" effect="light">
                    <el-button type="primary" :icon="View" circle size="small" @click="previewFile(scope.row)">
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="下载文件" placement="bottom" effect="light">
                    <el-button type="success" :icon="Download" circle size="small" @click="downloadAttachment(scope.row)">
                    </el-button>
                  </el-tooltip>
                  <el-tooltip v-if="!data.isViewMode" content="删除附件" placement="bottom" effect="light">
                    <el-button type="danger" circle :icon="Delete" size="small" @click="removeAttachment(scope.$index)"></el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
            
            <div v-if="data.form.attachments.length === 0" style="text-align: center; color: #999; padding: 40px;">
              暂无附件材料信息
            </div>
          </div>
        </div>
      </div>
      
      <!-- 抽屉底部操作按钮 -->
      <template #footer>
        <div style="text-align: center;">
          <template v-if="!data.isViewMode">
            <el-button size="small" @click="resetCurrentTab">重 置</el-button>
            <el-button v-if="!isLastProjectTab()" type="primary" size="small" @click="saveCurrentTab">下一步</el-button>
            <el-button v-else type="primary" size="small" @click="submitForm">{{ isRejectedProjectStatus(data.form.status) ? '重新提交' : '提 交' }}</el-button>
          </template>
          <template v-else>
            <el-button
              v-if="canEditProject(data.user.role, data.form.status)"
              type="primary"
              size="small"
              :icon="Edit"
              @click="switchViewToEdit"
            >
              编 辑
            </el-button>
          </template>
        </div>
      </template>
    </el-drawer>

    <!-- 新增团队成员对话框 -->
    <el-dialog v-model="data.showTeamMemberDialog" title="新增团队成员" width="500px">
        <el-form :model="data.tempTeamMember" label-width="120px">
        <el-form-item label="姓名" required>
          <el-input
            v-model="data.tempTeamMember.name"
            :maxlength="TEAM_MEMBER_NAME_MAX_LENGTH"
            show-word-limit
            :placeholder="`请输入姓名，最多${TEAM_MEMBER_NAME_MAX_LENGTH}个字符`"
          ></el-input>
        </el-form-item>
        <el-form-item label="参与角色" required>
          <el-select v-model="data.tempTeamMember.role" placeholder="请选择参与角色" style="width: 100%;">
            <el-option label="项目负责人" value="项目负责人"></el-option>
            <el-option label="主要参与者" value="主要参与者"></el-option>
            <el-option label="一般参与者" value="一般参与者"></el-option>
            <el-option label="其他" value="其他"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="署名/代表单位">
          <el-input
            v-model="data.tempTeamMember.affiliation"
            :maxlength="TEAM_MEMBER_AFFILIATION_MAX_LENGTH"
            show-word-limit
            :placeholder="`请输入署名/代表单位，最多${TEAM_MEMBER_AFFILIATION_MAX_LENGTH}个字符`"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button size="small" @click="data.showTeamMemberDialog = false">取 消</el-button>
          <el-button type="primary" size="small" @click="addTeamMember">确 定</el-button>
        </span>
      </template>
    </el-dialog>

     <!-- 新增合作研究单位对话框 -->
     <el-dialog v-model="data.showCooperativeUnitDialog" title="新增合作研究单位" width="500px">
         <el-form :model="data.tempCooperativeUnit" label-width="120px">
         <el-form-item label="单位名称">
           <el-input
             v-model="data.tempCooperativeUnit.unitName"
             :maxlength="COOPERATIVE_UNIT_NAME_MAX_LENGTH"
             show-word-limit
             :placeholder="`请输入单位名称，最多${COOPERATIVE_UNIT_NAME_MAX_LENGTH}个字符`"
           ></el-input>
         </el-form-item>
         <el-form-item label="完成单位">
           <el-select v-model="data.tempCooperativeUnit.completionUnit" placeholder="请选择完成单位" style="width: 100%;">
             <el-option label="第一完成单位" value="第一完成单位"></el-option>
             <el-option label="第二完成单位" value="第二完成单位"></el-option>
             <el-option label="第三完成单位" value="第三完成单位"></el-option>
           </el-select>
         </el-form-item>
       </el-form>
       <template #footer>
         <span class="dialog-footer">
           <el-button size="small" @click="data.showCooperativeUnitDialog = false">取 消</el-button>
           <el-button type="primary" size="small" @click="addCooperativeUnit">确 定</el-button>
         </span>
       </template>
     </el-dialog>

     <!-- 新增附件材料对话框 -->
     <el-dialog v-model="data.showAttachmentDialog" title="新增附件材料" width="500px" @closed="resetAttachmentDialogState">
       <el-form :model="data.tempAttachment" label-width="120px">
         <el-form-item label="文件类别" required>
           <el-select v-model="data.tempAttachment.fileCategory" placeholder="请选择文件类别" style="width: 100%;">
             <el-option label="成果原件/扫描件" value="成果原件/扫描件"></el-option>
             <el-option label="立/结项证明" value="立/结项证明"></el-option>
           </el-select>
         </el-form-item>
         <el-form-item label="文件简介">
           <el-input
             v-model="data.tempAttachment.fileDescription"
             type="textarea"
             :rows="3"
             :maxlength="ATTACHMENT_DESCRIPTION_MAX_LENGTH"
             show-word-limit
             :placeholder="`请输入文件简介，最多${ATTACHMENT_DESCRIPTION_MAX_LENGTH}个字符`"
           ></el-input>
         </el-form-item>
         <el-form-item label="上传文件" required>
           <el-upload 
             ref="attachmentUploadRef"
             :action="baseUrl + '/files/upload'" 
             :on-success="handleAttachmentUpload"
             :on-error="handleAttachmentUploadError"
             :on-remove="handleAttachmentRemove"
             :before-upload="beforeAttachmentUpload"
             :limit="1"
             v-model:file-list="data.tempAttachment.fileList"
             accept=".pdf,.jpg,.jpeg,.png,.txt,.docx">
             <el-button type="primary" size="small">点击上传</el-button>
           </el-upload>
         </el-form-item>
         
         <!-- 文件校验状态显示 -->
         <el-form-item v-if="data.fileValidationStatus" label="文件校验">
           <div style="display: flex; align-items: center;">
             <el-icon v-if="data.fileValidationStatus === 'validating'" class="is-loading" style="margin-right: 8px;">
               <Loading />
             </el-icon>
             <el-icon v-else-if="data.fileValidationStatus === 'success'" style="color: #67c23a; margin-right: 8px;">
               <SuccessFilled />
             </el-icon>
             <el-icon v-else-if="data.fileValidationStatus === 'failed'" style="color: #f56c6c; margin-right: 8px;">
               <CircleCloseFilled />
             </el-icon>
             <span v-if="data.fileValidationStatus === 'validating'" style="color: #409eff;">正在校验...</span>
             <span v-else-if="data.fileValidationStatus === 'success'" style="color: #67c23a;">校验通过</span>
             <span v-else-if="data.fileValidationStatus === 'failed'" style="color: #f56c6c;">校验失败</span>
           </div>
         </el-form-item>
       </el-form>
       <template #footer>
           <span class="dialog-footer">
             <el-button size="small" @click="cancelAttachmentDialog" :disabled="data.validationLoading">取 消</el-button>
           <el-button 
             type="primary" 
             size="small" 
             @click="addAttachment" 
             :loading="data.validationLoading"
             :disabled="data.validationLoading">
             {{ data.validationLoading ? '校验中...' : '确 定' }}
           </el-button>
         </span>
       </template>
     </el-dialog>

     <!-- 查询详情对话框 -->
      <el-dialog v-model="data.checkVisible" title="审核项目" width="500px">
          <el-form :model="data.form" label-width="70px" style="padding: 20px">
          <el-form-item prop="status" label="审核结果">
            <el-select v-model="data.form.status" placeholder="请选择审核结果">
              <el-option label="通过" value="通过"></el-option>
              <el-option label="驳回" value="驳回"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="reason" label="审核理由">
            <el-input
              v-model="data.form.reason"
              type="textarea"
              :rows="4"
              :maxlength="PROJECT_REVIEW_REASON_MAX_LENGTH"
              show-word-limit
              :placeholder="`请输入审核理由，最多${PROJECT_REVIEW_REASON_MAX_LENGTH}个字符`"
            ></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button size="small" @click="data.checkVisible = false">取 消</el-button>
            <el-button type="primary" size="small" @click="submit">提 交</el-button>
          </span>
        </template>
      </el-dialog>

    <!-- 文件预览组件 -->
    <FilePreviewCom 
      v-model="data.showFilePreview"
      :file-url="data.previewFileData.url"
      :file-name="data.previewFileData.name"
      :file-type="data.previewFileData.type"
      @download="handleFileDownload"
    />

    <!-- 安全提醒组件 -->
    <SecurityAlert v-model="data.showSecurityAlert" @confirm="handleSecurityConfirm" />

  </div>
</template>

<script setup>

import { reactive, ref, onMounted, computed } from "vue";
import request from "@/utils/request.js";
import { getSchools } from '@/utils/dict.js';
import { usePaginationQuery } from '@/utils/paginationQuery.js';
import { clearTableQuery, tableQueryParams } from '@/utils/tableQuery.js';
import { ElMessage, ElMessageBox } from "@/utils/element-plus";
import { Delete, Edit, View, Tickets, Loading, SuccessFilled, CircleCloseFilled, Search, Download } from "@element-plus/icons-vue";
import FilePreviewCom from "./componets/FilePreviewCom.vue";
import SecurityAlert from "@/components/SecurityAlert.vue";
import { securityAlertManager } from "@/utils/securityAlert.js";
import { fetchLaboratoryLevel, getCachedLaboratoryLevel, getUserLaboratoryId } from "@/utils/laboratoryLevel.js";
const baseUrl = import.meta.env.VITE_BASE_URL
const PROJECT_NAME_MAX_LENGTH = 255
const EXPECTED_RESULTS_MAX_LENGTH = 255
const TEAM_MEMBER_NAME_MAX_LENGTH = 20
const TEAM_MEMBER_AFFILIATION_MAX_LENGTH = 100
const COOPERATIVE_UNIT_NAME_MAX_LENGTH = 100
const ATTACHMENT_DESCRIPTION_MAX_LENGTH = 256
const PROJECT_REVIEW_REASON_MAX_LENGTH = 5000
const PROJECT_TAB_ORDER = ['projectInfo', 'teamMembers', 'cooperativeUnits', 'projectStatus', 'budgetInfo', 'attachments']
const PROJECT_DRAFT_PREFIX = 'project-form-draft'
const queryFields = ['code', 'name', 'teacherName', 'schoolId', 'researchType', 'subjectCategory', 'projectNature', 'projectLevel', 'projectStatus', 'status', 'reason', 'time']
const formRef = ref()
const attachmentUploadRef = ref()
const createEmptyAttachment = () => ({ fileCategory: '', fileDescription: '', fileName: '', fileUrl: '', fileList: [] })
const data = reactive({
  user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
  formVisible: false,
  checkVisible: false,
  isViewMode: false, // 是否为查看模式
  activeTab: 'projectInfo', // 默认激活项目信息标签页
  // 控制各种弹窗显示
  showTeamMemberDialog: false,
  showCooperativeUnitDialog: false,
  showAttachmentDialog: false,
  // 文件预览相关
  showFilePreview: false,
  previewFileData: {
    url: '',
    name: '',
    type: ''
  },
  // 临时编辑数据
  tempTeamMember: {},
  tempCooperativeUnit: {},
  tempAttachment: createEmptyAttachment(),
  // 文件校验状态
  fileValidationStatus: '', // 'validating', 'success', 'failed'
  validationLoading: false, // 校验加载状态
  form: {
    // 项目信息
    name: '',
    researchType: '',
    subjectCategory: '',
    projectNature: '',
    projectLevel: '',
    expectedResults: '',
    // 立项/结项信息
    establishmentTime: '',
    midCheckTime: '',
    projectStatus: '',
    completionAppraisal: '',
    plannedCompletionTime: '',
    actualCompletionTime: '',
    // 项目经费预算
    approvedFunding: null,
    projectFinanceAccount: '',
    matchingFunding: null,
    receivedFunding: null,
    longitudinalFunding: null,
    transverseFunding: null,
    // 数组字段
    teamMembers: [], // 团队成员
    cooperativeUnits: [], // 合作研究单位
    attachments: [], // 附件材料
  },
  tableData: [],
  loading: false,
  pageNum: 1,
  pageSize: 10,
  total: 0,
  code: null,
  name: null,
  teacherName: null,
  schoolId: null,
  schools: [],
  researchType: null,
  subjectCategory: null,
  projectNature: null,
  projectLevel: null,
  projectStatus: null,
  status: null,
  reason: null,
  time: null,
  showSecurityAlert: false,
  securityAlertShown: false, // 标记是否已经显示过安全提醒，避免重复弹出
  laboratoryLevel: getCachedLaboratoryLevel(getUserLaboratoryId(JSON.parse(localStorage.getItem('xm-user') || '{}'))),
  savedTabData: {}, // 临时保存的标签页数据
  skipDraftSaveOnClose: false,
})

const paginationQuery = usePaginationQuery(data)

const canFilterBySchool = computed(() => ['SUPER_ADMIN', 'ADMIN'].includes(data.user.role))

const loadSchools = () => {
  if (!canFilterBySchool.value) return
  getSchools().then(res => {
    data.schools = res || []
  }).catch(err => {
    ElMessage.error(err.message || '学校列表加载失败')
  })
}

const createEmptyProjectForm = () => ({
  // 项目信息
  name: '',
  researchType: '',
  subjectCategory: '',
  projectNature: '',
  projectLevel: '',
  expectedResults: '',
  // 立项/结项信息
  establishmentTime: '',
  midCheckTime: '',
  projectStatus: '',
  completionAppraisal: '',
  plannedCompletionTime: '',
  actualCompletionTime: '',
  // 项目经费预算
  approvedFunding: null,
  projectFinanceAccount: '',
  matchingFunding: null,
  receivedFunding: null,
  longitudinalFunding: null,
  transverseFunding: null,
  // 数组字段
  teamMembers: [],
  cooperativeUnits: [],
  attachments: [],
})

const normalizeProjectForm = (form = {}) => {
  const normalized = {
    ...createEmptyProjectForm(),
    ...form,
  }
  normalized.teamMembers = Array.isArray(normalized.teamMembers) ? normalized.teamMembers : []
  normalized.cooperativeUnits = Array.isArray(normalized.cooperativeUnits) ? normalized.cooperativeUnits : []
  normalized.attachments = Array.isArray(normalized.attachments) ? normalized.attachments : []
  return normalized
}

const getProjectDraftKey = (projectId = data.form?.id) => {
  return `${PROJECT_DRAFT_PREFIX}:${data.user.id || 'anonymous'}:${projectId || 'new'}`
}

const readProjectDraft = (projectId) => {
  try {
    const rawDraft = localStorage.getItem(getProjectDraftKey(projectId))
    return rawDraft ? JSON.parse(rawDraft) : null
  } catch (error) {
    console.warn('读取项目草稿失败:', error)
    return null
  }
}

const saveProjectDraft = () => {
  if (data.isViewMode) return
  try {
    localStorage.setItem(getProjectDraftKey(), JSON.stringify({
      form: data.form,
      activeTab: data.activeTab,
    }))
  } catch (error) {
    console.warn('保存项目草稿失败:', error)
  }
}

const clearProjectDraft = (projectId = data.form?.id) => {
  try {
    localStorage.removeItem(getProjectDraftKey(projectId))
  } catch (error) {
    console.warn('清除项目草稿失败:', error)
  }
}

const isLastProjectTab = () => {
  return data.activeTab === PROJECT_TAB_ORDER[PROJECT_TAB_ORDER.length - 1]
}

const moveToNextProjectTab = () => {
  const currentIndex = PROJECT_TAB_ORDER.indexOf(data.activeTab)
  const nextTab = PROJECT_TAB_ORDER[currentIndex + 1]
  if (nextTab) {
    data.activeTab = nextTab
    saveProjectDraft()
    if (nextTab === 'attachments' && !data.securityAlertShown) {
      securityAlertManager.show()
      data.securityAlertShown = true
    }
  }
}

const toDateStartTime = (value) => {
  if (!value) return null
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()
  }
  const parts = String(value).split('-').map(Number)
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null
  return new Date(parts[0], parts[1] - 1, parts[2]).getTime()
}

const isAfterDate = (value, baseValue) => {
  const valueTime = toDateStartTime(value)
  const baseTime = toDateStartTime(baseValue)
  if (valueTime === null || baseTime === null) return true
  return valueTime > baseTime
}

const disableCompletionDate = (date) => {
  if (!data.form.establishmentTime) return false
  return !isAfterDate(date, data.form.establishmentTime)
}

const getCompletionDateError = () => {
  if (!data.form.establishmentTime) return ''
  if (data.form.plannedCompletionTime && !isAfterDate(data.form.plannedCompletionTime, data.form.establishmentTime)) {
    return '计划完成时间必须在立项时间之后'
  }
  if (data.form.actualCompletionTime && !isAfterDate(data.form.actualCompletionTime, data.form.establishmentTime)) {
    return '实际结项时间必须在立项时间之后'
  }
  return ''
}

const rules = reactive({
  // 项目信息验证规则
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { max: PROJECT_NAME_MAX_LENGTH, message: `项目名称不能超过${PROJECT_NAME_MAX_LENGTH}个字符`, trigger: 'blur' },
  ],
  researchType: [
    { required: true, message: '请选择研究类型', trigger: 'change' },
  ],
  subjectCategory: [
    { required: true, message: '请选择学科分类', trigger: 'change' },
  ],
  projectNature: [
    { required: true, message: '请选择项目性质', trigger: 'change' },
  ],
  projectLevel: [
    { required: true, message: '请选择课题类别', trigger: 'change' },
  ],
  expectedResults: [
    { max: EXPECTED_RESULTS_MAX_LENGTH, message: `预期成果不能超过${EXPECTED_RESULTS_MAX_LENGTH}个字符`, trigger: 'blur' },
  ],
  // 立项/结项信息验证规则
  establishmentTime: [
    { required: true, message: '请选择立项时间', trigger: 'change' },
  ],
  projectStatus: [
    { required: true, message: '请选择项目当前状态', trigger: 'change' },
  ],
  plannedCompletionTime: [
    { required: true, message: '请选择计划完成时间', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (value && data.form.establishmentTime && !isAfterDate(value, data.form.establishmentTime)) {
          callback(new Error('计划完成时间必须在立项时间之后'))
          return
        }
        callback()
      },
      trigger: 'change',
    },
  ],
  actualCompletionTime: [
    {
      validator: (rule, value, callback) => {
        if (value && data.form.establishmentTime && !isAfterDate(value, data.form.establishmentTime)) {
          callback(new Error('实际结项时间必须在立项时间之后'))
          return
        }
        callback()
      },
      trigger: 'change',
    },
  ],
  // 项目经费预算验证规则
  approvedFunding: [
    { required: true, message: '请输入获批经费', trigger: 'blur' },
  ],
})

const indexMethod = (index) => {
  return (data.pageNum - 1) * data.pageSize + index + 1
}

const isLaboratoryReviewRole = (role) => {
  return role === 'KEY_LABORATORY' || role === 'NORMAL_LABORATORY'
}

const getTodoStatusByRole = (role) => {
  if (isLaboratoryReviewRole(role)) return '待审核'
  if (role === 'SCHOOL_ADMIN') return '实验室审核通过'
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') return '校审通过'
  return null
}

const canReviewProjectOrAchievement = (role, status) => {
  if (isLaboratoryReviewRole(role) && status === '待审核') return true
  if (role === 'SCHOOL_ADMIN' && status === '实验室审核通过') return true
  if ((role === 'SUPER_ADMIN' || role === 'ADMIN') && status === '校审通过') return true
  return false
}

const isRejectedProjectStatus = (status) => {
  return ['实验室审核驳回', '校审驳回', '审核未通过', '不通过'].includes(status)
}

const canEditProject = (role, status) => {
  return role === 'TEACHER' && (status === '待审核' || isRejectedProjectStatus(status))
}

const getApprovalStatusTagType = (status) => {
  const map = {
    '待审核': 'warning',
    '实验室审核通过': 'primary',
    '实验室审核驳回': 'danger',
    '校审通过': 'primary',
    '校审驳回': 'danger',
    '审核通过': 'success',
    '审核未通过': 'danger',
    '不通过': 'danger'
  }
  return map[status] || 'info'
}

const getApprovalStatusText = (status) => {
  return status === '待审核' ? '待实验室审核' : status
}

const decodeFileName = (fileName) => {
  if (!fileName) return ''
  try {
    return decodeURIComponent(String(fileName).replace(/\+/g, '%20'))
  } catch (error) {
    return String(fileName)
  }
}

const getFileNameFromUrl = (fileUrl) => {
  if (!fileUrl) return ''
  try {
    const pathname = new URL(fileUrl).pathname
    return decodeFileName(pathname.split('/').pop())
  } catch (error) {
    return decodeFileName(String(fileUrl).split('/').pop())
  }
}

// 处理文件名显示，先解码URL文件名，再去掉时间戳前缀
const getDisplayFileName = (fileName) => {
  if (!fileName) return ''
  const decodedFileName = decodeFileName(fileName)
  // 匹配时间戳模式：数字-文件名
  const match = decodedFileName.match(/^\d+-(.+)$/)
  return match ? match[1] : decodedFileName
}

const load = () => {
  paginationQuery.sync()
  console.log('load 函数被调用')
  const queryParams = tableQueryParams(data, queryFields)
  if (Object.keys(queryParams).length === 0) {
    const todoStatus = getTodoStatusByRole(data.user.role)
    if (todoStatus) {
      queryParams.status = todoStatus
    }
  }
  data.loading = true
  request.get('/project/selectPage', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      ...queryParams
    }
  }).then(res => {
    console.log('load 响应数据:', res)
    if (res.code === '200') {
      data.tableData = res.data?.list || []
      data.total = res.data?.total
      console.log('表格数据已加载:', data.tableData)
      console.log('数据总数:', data.total)
    }
  }).finally(() => {
    data.loading = false
  })
}
const handleAdd = () => {
  console.log('handleAdd 被调用')
  console.log('当前 formVisible 状态:', data.formVisible)
  console.log('当前 laboratoryLevel:', data.laboratoryLevel)
  
  // 确保先关闭抽屉，然后重新打开
  data.formVisible = false
  
  // 使用 nextTick 确保状态更新完成
  setTimeout(() => {
    const draft = readProjectDraft(null)
    data.form = normalizeProjectForm(draft?.form)
    data.isViewMode = false // 设置为编辑模式
    data.activeTab = draft?.activeTab || 'projectInfo' // 恢复草稿页签
    data.securityAlertShown = false // 重置安全提醒标记，允许在附件材料标签页显示
    data.skipDraftSaveOnClose = false
    data.formVisible = true
    console.log('新增抽屉应该已打开，formVisible:', data.formVisible)
  }, 10)
}
const handleEdit = (row) => {
  const draft = readProjectDraft(row.id)
  data.form = normalizeProjectForm(draft?.form || JSON.parse(JSON.stringify(row)))
  data.isViewMode = false // 设置为编辑模式
  data.activeTab = draft?.activeTab || 'projectInfo' // 恢复草稿页签
  data.securityAlertShown = false // 重置安全提醒标记，允许在附件材料标签页显示
  data.skipDraftSaveOnClose = false
  data.formVisible = true
}

const switchViewToEdit = () => {
  if (!canEditProject(data.user.role, data.form.status)) {
    ElMessage.warning('当前项目不允许编辑')
    return
  }

  const currentTab = data.activeTab
  const draft = readProjectDraft(data.form.id)
  data.form = normalizeProjectForm(draft?.form || JSON.parse(JSON.stringify(data.form)))
  data.isViewMode = false
  data.activeTab = draft?.activeTab || currentTab
  data.securityAlertShown = false
  data.skipDraftSaveOnClose = false
}

const handleCheck = (row) => {
  data.form = {
    id: row.id,
    status: '通过',
    reason: ''
  }
  data.checkVisible = true
}
const handleQuery = (row) => {
  console.log('handleQuery 被调用', row)
  console.log('当前 formVisible 状态:', data.formVisible)
  console.log('当前 laboratoryLevel:', data.laboratoryLevel)
  
  // 确保先关闭抽屉，然后重新打开
  data.formVisible = false
  
  // 使用 setTimeout 确保状态更新完成
  setTimeout(() => {
    // 深拷贝行数据到表单，用于显示详情
    data.form = normalizeProjectForm(JSON.parse(JSON.stringify(row)))
    data.isViewMode = true  // 设置为查看模式
    data.activeTab = 'projectInfo'  // 重置到第一个标签页
    data.skipDraftSaveOnClose = false
    data.formVisible = true  // 使用统一的抽屉显示
    console.log('查询抽屉应该已打开，formVisible:', data.formVisible)
  }, 10)
}
const add = () => {
  // 打印传给后端的表单数据
  console.log('=== 新增项目提交数据 ===')
  console.log('完整表单数据:', JSON.stringify(data.form, null, 2))
  console.log('========================')
  
  request.post('/project/add', data.form).then(res => {
    if (res.code === '200') {
      ElMessage.success('操作成功')
      clearProjectDraft()
      data.skipDraftSaveOnClose = true
      data.formVisible = false
      load()
    } else {
      ElMessage.error(res.msg)
    }
  })
}

const update = () => {
  const resubmit = isRejectedProjectStatus(data.form.status)
  request.put('/project/update', data.form).then(res => {
    if (res.code === '200') {
      ElMessage.success(resubmit ? '重新提交成功' : '操作成功')
      clearProjectDraft(data.form.id)
      data.skipDraftSaveOnClose = true
      data.formVisible = false
      load()
    }
  })
}

const save = () => {
  formRef.value.validate(valid => {
    if (valid) {
      data.form.id ? update() : add()
    }
  })
}

const submit = () => {
  if (data.form.status === '驳回' && !String(data.form.reason || '').trim()) {
    ElMessage.warning('请输入驳回理由')
    return
  }
  if (data.form.reason && data.form.reason.length > PROJECT_REVIEW_REASON_MAX_LENGTH) {
    ElMessage.warning(`审核理由不能超过${PROJECT_REVIEW_REASON_MAX_LENGTH}个字符`)
    return
  }
  request.put('/project/check', data.form).then(res => {
    if (res.code === '200') {
      ElMessage.success('操作成功')
      data.checkVisible = false
      load()
    } else {
      ElMessage.error(res.msg)
    }
  })
}

const del = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(res => {
    request.delete('/project/delete/' + id).then(res => {
      if (res.code === '200') {
        ElMessage.success("删除成功")
        load()
      } else {
        ElMessage.error(res.msg)
      }
    })
  }).catch(err => {
    console.error(err)
  })
}

const search = () => {
  paginationQuery.reset()
  load()
}

const reset = () => {
  clearTableQuery(data, queryFields)
  paginationQuery.reset()
  load()
}

// 团队成员相关方法
const getTeamMemberLengthError = (members = []) => {
  for (const member of members) {
    if (member.name && member.name.length > TEAM_MEMBER_NAME_MAX_LENGTH) {
      return `团队成员姓名不能超过${TEAM_MEMBER_NAME_MAX_LENGTH}个字符`
    }
    if (member.affiliation && member.affiliation.length > TEAM_MEMBER_AFFILIATION_MAX_LENGTH) {
      return `团队成员署名/代表单位不能超过${TEAM_MEMBER_AFFILIATION_MAX_LENGTH}个字符`
    }
  }
  return ''
}

const addTeamMember = () => {
  // 验证必填字段
  if (!data.tempTeamMember.name || !data.tempTeamMember.role) {
    ElMessage.warning('请填写姓名和参与角色')
    return
  }
  const lengthError = getTeamMemberLengthError([data.tempTeamMember])
  if (lengthError) {
    ElMessage.warning(lengthError)
    return
  }
  
  // 添加到团队成员列表
  data.form.teamMembers.push({
    name: data.tempTeamMember.name,
    role: data.tempTeamMember.role,
    affiliation: data.tempTeamMember.affiliation || ''
  })
  saveProjectDraft()
  
  // 重置临时数据并关闭对话框
  data.tempTeamMember = { name: '', role: '', affiliation: '' }
  data.showTeamMemberDialog = false
  ElMessage.success('团队成员添加成功')
}

const removeTeamMember = (index) => {
  ElMessageBox.confirm('确定要删除该团队成员吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(() => {
    data.form.teamMembers.splice(index, 1)
    saveProjectDraft()
    ElMessage.success('删除成功')
  }).catch(() => {
    // 用户取消删除
  })
}

// 合作研究单位相关方法
const getCooperativeUnitLengthError = (units = []) => {
  for (const unit of units) {
    if (unit.unitName && unit.unitName.length > COOPERATIVE_UNIT_NAME_MAX_LENGTH) {
      return `合作研究单位名称不能超过${COOPERATIVE_UNIT_NAME_MAX_LENGTH}个字符`
    }
  }
  return ''
}

 const addCooperativeUnit = () => {
   const lengthError = getCooperativeUnitLengthError([data.tempCooperativeUnit])
   if (lengthError) {
     ElMessage.warning(lengthError)
     return
   }
   // 添加到合作研究单位列表（字段均为非必填）
   data.form.cooperativeUnits.push({
     unitName: data.tempCooperativeUnit.unitName || '',
     completionUnit: data.tempCooperativeUnit.completionUnit || ''
   })
   saveProjectDraft()
   
   // 重置临时数据并关闭对话框
   data.tempCooperativeUnit = { unitName: '', completionUnit: '' }
   data.showCooperativeUnitDialog = false
   ElMessage.success('合作研究单位添加成功')
 }



// 附件材料相关方法
const openAttachmentDialog = () => {
  data.tempAttachment = createEmptyAttachment()
  data.fileValidationStatus = ''
  data.validationLoading = false
  data.showAttachmentDialog = true
  attachmentUploadRef.value?.clearFiles()
}

const clearAttachmentUpload = () => {
  data.tempAttachment.fileName = ''
  data.tempAttachment.fileUrl = ''
  data.tempAttachment.fileList = []
  attachmentUploadRef.value?.clearFiles()
}

const resetAttachmentDialogState = () => {
  data.fileValidationStatus = ''
  data.validationLoading = false
  data.tempAttachment = createEmptyAttachment()
  attachmentUploadRef.value?.clearFiles()
}

const getAttachmentLengthError = (attachments = []) => {
  for (const attachment of attachments) {
    if (attachment.fileDescription && attachment.fileDescription.length > ATTACHMENT_DESCRIPTION_MAX_LENGTH) {
      return `文件简介不能超过${ATTACHMENT_DESCRIPTION_MAX_LENGTH}个字符`
    }
  }
  return ''
}

const addAttachment = async () => {
  // 验证必填字段
  if (!data.tempAttachment.fileCategory || !data.tempAttachment.fileName || !data.tempAttachment.fileUrl) {
    ElMessage.warning('请选择文件类别并上传文件')
    return
  }
  const lengthError = getAttachmentLengthError([data.tempAttachment])
  if (lengthError) {
    ElMessage.warning(lengthError)
    return
  }

  // 开始文件校验
  data.validationLoading = true
  data.fileValidationStatus = 'validating'

  try {
    // 调用文件校验接口
    const result = await validateFile(data.tempAttachment.fileUrl)

    if (result.status === 'SUCCESS') {
      data.fileValidationStatus = 'success'

      // 校验成功，添加到附件材料列表
      data.form.attachments.push({
        fileName: data.tempAttachment.fileName,
        fileCategory: data.tempAttachment.fileCategory,
        fileDescription: data.tempAttachment.fileDescription || '',
        fileUrl: data.tempAttachment.fileUrl
      })
      saveProjectDraft()

      // 重置临时数据并关闭对话框
      data.tempAttachment = { fileCategory: '', fileDescription: '', fileName: '', fileUrl: '', fileList: [] }
      data.showAttachmentDialog = false
      data.fileValidationStatus = ''
      ElMessage.success('附件材料添加成功')
    } else {
      // 校验失败,仅仅提示下，依然让提交
      data.fileValidationStatus = 'failed'
      ElMessage.error('文件校验失败，请检查文件是否满足要求')


      data.form.attachments.push({
        fileName: data.tempAttachment.fileName,
        fileCategory: data.tempAttachment.fileCategory,
        fileDescription: data.tempAttachment.fileDescription || '',
        fileUrl: data.tempAttachment.fileUrl
      })
      saveProjectDraft()

      // 重置临时数据并关闭对话框
      data.tempAttachment = { fileCategory: '', fileDescription: '', fileName: '', fileUrl: '', fileList: [] }
      data.showAttachmentDialog = false
      data.fileValidationStatus = ''
      ElMessage.success('附件材料添加成功')


    }
  } catch (error) {
    // 校验接口调用失败
    data.fileValidationStatus = 'failed'
    ElMessage.error('文件校验失败，请重试')
    console.error('文件校验错误:', error)
  } finally {
    data.validationLoading = false
  }
}

// ✅ 改进的 validateFile
const validateFile = async (fileUrl) => {
  return request
      .post('/api/file/upload', { file: fileUrl })
      .then(res => {
        // 注意：这里假设后端返回的就是 {status, authors, error}
        if (res && res.status) {
          return res
        } else {
          throw new Error(res?.msg || '校验响应格式错误')
        }
      })
}


const removeAttachment = (index) => {
  ElMessageBox.confirm('确定要删除该附件材料吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(() => {
    data.form.attachments.splice(index, 1)
    saveProjectDraft()
    ElMessage.success('删除成功')
  }).catch(() => {
    // 用户取消删除
  })
}

/**
 * 取消附件材料对话框
 */
const cancelAttachmentDialog = () => {
  // 重置文件校验状态
  data.fileValidationStatus = ''
  data.validationLoading = false
  clearAttachmentUpload()
  // 关闭对话框
  data.showAttachmentDialog = false
}

const handleAttachmentUpload = (res) => {
  if (String(res?.code) === '200' && res?.data) {
    data.tempAttachment.fileName = getFileNameFromUrl(res.data) // 从URL中提取并解码文件名
    data.tempAttachment.fileUrl = res.data
    ElMessage.success('文件上传成功')
  } else {
    clearAttachmentUpload()
    ElMessage.error(res?.msg || '文件上传失败')
  }
}

const handleAttachmentUploadError = (error) => {
  clearAttachmentUpload()
  let message = '文件上传失败'
  try {
    const response = error?.response || (error?.message ? JSON.parse(error.message) : null)
    message = response?.data?.msg || response?.msg || message
  } catch (parseError) {
    // 保持默认提示
  }
  ElMessage.error(message)
}

const handleAttachmentRemove = () => {
  data.tempAttachment.fileName = ''
  data.tempAttachment.fileUrl = ''
  data.tempAttachment.fileList = []
}

const beforeAttachmentUpload = (file) => {
  // 根据FilePreviewCom组件支持的文件格式定义允许的文件类型
  const allowedTypes = [
    // PDF文件
    'application/pdf',
    // 图片文件
    'image/jpeg', 'image/jpg', 'image/png',
    // 文本文件
    'text/plain',
    // Word文档
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]
  
  const isAllowedType = allowedTypes.includes(file.type)
  const isLt10M = file.size / 1024 / 1024 < 10
  const isNotEmpty = file.size > 0

  if (!isNotEmpty) {
    clearAttachmentUpload()
    ElMessage.error('上传文件不能为空')
    return false
  }
  if (!isAllowedType) {
    clearAttachmentUpload()
    ElMessage.error('支持png,jpg,jpeg,txt,pdf,docx文件格式')
    return false
  }
  if (!isLt10M) {
    clearAttachmentUpload()
    ElMessage.error('上传文件大小不能超过 10MB!')
    return false
  }
  return true
}

/**
 * 预览文件
 * @param {Object} attachment 附件对象
 */
const previewFile = (attachment) => {
  console.log('预览文件被点击，附件数据:', attachment)
  
  if (!attachment.fileUrl) {
    ElMessage.warning('文件链接不存在')
    return
  }
  
  // 清理文件URL，去除空格和特殊字符
  let cleanFileUrl = attachment.fileUrl.toString()
  // 去除前后空格
  cleanFileUrl = cleanFileUrl.trim()
  // 去除反引号、单引号、双引号
  cleanFileUrl = cleanFileUrl.replace(/[`'"]/g, '')
  // 再次去除可能残留的空格
  cleanFileUrl = cleanFileUrl.trim()
  
  console.log('原始URL:', attachment.fileUrl)
  console.log('清理后的文件URL:', cleanFileUrl)

  // 获取文件扩展名
  const fileName = attachment.fileName || ''
  const fileExtension = fileName.toLowerCase().split('.').pop()
  
  // 根据文件扩展名确定文件类型
  let fileType = 'unsupported'
  
  // 图片文件
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
    fileType = 'image'
  }
  // PDF文件
  else if (fileExtension === 'pdf') {
    fileType = 'pdf'
  }
  // Word文档
  else if (fileExtension === 'docx') {
    fileType = 'docx'
  }
  // 文本文件
  else if (['txt', 'md', 'json', 'xml', 'csv'].includes(fileExtension)) {
    fileType = 'text'
  }

  // 先清空预览数据
  data.previewFileData = {
    url: '',
    name: '',
    type: ''
  }
  
  // 重新设置预览数据
  data.previewFileData.url = cleanFileUrl
  data.previewFileData.name = getDisplayFileName(fileName)
  data.previewFileData.type = fileType
  
  console.log('设置预览数据:', {
    url: data.previewFileData.url,
    name: data.previewFileData.name,
    type: data.previewFileData.type
  })
  console.log('文件类型判断结果:', fileType)
  
  // 显示预览对话框
  data.showFilePreview = true
  console.log('显示预览对话框:', data.showFilePreview)
}

const downloadAttachment = (attachment) => {
  if (!attachment?.fileUrl) {
    ElMessage.warning('文件链接不存在')
    return
  }

  handleFileDownload({
    url: String(attachment.fileUrl).trim().replace(/[`'"]/g, '').trim(),
    fileName: getDisplayFileName(attachment.fileName || '下载文件')
  })
}

/**
 * 处理文件下载
 * @param {Object} downloadData 下载数据对象，包含url和fileName
 */
const handleFileDownload = async (downloadData) => {
  if (!downloadData.url) {
    ElMessage.error('下载链接不存在')
    return
  }
  
  try {
    const response = await fetch(downloadData.url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const blob = await response.blob()
    if (!blob.size) {
      ElMessage.error('文件内容为空，无法下载')
      return
    }

    const objectUrl = URL.createObjectURL(blob)
    // 创建一个临时的a标签来触发下载
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = downloadData.fileName || '下载文件'
    
    // 添加到DOM并触发点击
    document.body.appendChild(link)
    link.click()
    
    // 清理DOM
    document.body.removeChild(link)
    URL.revokeObjectURL(objectUrl)
    
    ElMessage.success('文件下载已开始')
  } catch (error) {
    console.error('文件下载失败:', error)
    ElMessage.error('文件下载失败，请重试')
  }
}

const removeCooperativeUnit = (index) => {
  ElMessageBox.confirm('确定要删除该合作研究单位吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(() => {
    data.form.cooperativeUnits.splice(index, 1)
    saveProjectDraft()
    ElMessage.success('删除成功')
  }).catch(() => {
    // 用户取消删除
  })
}

const handleFileUpload = (res) => {
  data.form.file = res.data
}
const down = (url) => {
  window.open(url)
}

// 重置当前标签页的数据
const resetCurrentTab = () => {
  ElMessageBox.confirm('确定要重置当前标签页的数据吗？', '重置确认', { type: 'warning', buttonSize: 'small' }).then(() => {
    switch (data.activeTab) {
      case 'projectInfo':
        // 重置项目信息
        data.form.name = ''
        data.form.researchType = ''
        data.form.subjectCategory = ''
        data.form.projectNature = ''
        data.form.projectLevel = ''
        data.form.expectedResults = ''
        break
      case 'teamMembers':
        // 重置团队成员
        data.form.teamMembers = []
        break
      case 'cooperativeUnits':
        // 重置合作研究单位
        data.form.cooperativeUnits = []
        break
      case 'projectStatus':
        // 重置立项/结项信息
        data.form.establishmentTime = ''
        data.form.midCheckTime = ''
        data.form.projectStatus = ''
        data.form.completionAppraisal = ''
        data.form.plannedCompletionTime = ''
        data.form.actualCompletionTime = ''
        break
      case 'budgetInfo':
        // 重置项目经费预算
        data.form.approvedFunding = null
        data.form.projectFinanceAccount = ''
        data.form.matchingFunding = null
        break
      case 'attachments':
        // 重置附件材料
        data.form.attachments = []
        break
    }
    saveProjectDraft()
    ElMessage.success('重置成功')
  }).catch(() => {
    // 用户取消重置
  })
}

const validateCurrentTab = () => {
  let isValid = true
  let errorMessage = ''

  switch (data.activeTab) {
    case 'projectInfo':
      if (!data.form.name) {
        isValid = false
        errorMessage = '请输入项目名称'
      } else if (data.form.name.length > PROJECT_NAME_MAX_LENGTH) {
        isValid = false
        errorMessage = `项目名称不能超过${PROJECT_NAME_MAX_LENGTH}个字符`
      } else if (!data.form.researchType) {
        isValid = false
        errorMessage = '请选择研究类型'
      } else if (!data.form.subjectCategory) {
        isValid = false
        errorMessage = '请选择学科分类'
      } else if (!data.form.projectNature) {
        isValid = false
        errorMessage = '请输入项目性质'
      } else if (!data.form.projectLevel) {
        isValid = false
        errorMessage = '请选择课题类别'
      } else if (data.form.expectedResults && data.form.expectedResults.length > EXPECTED_RESULTS_MAX_LENGTH) {
        isValid = false
        errorMessage = `预期成果不能超过${EXPECTED_RESULTS_MAX_LENGTH}个字符`
      }
      break
    case 'teamMembers':
      errorMessage = getTeamMemberLengthError(data.form.teamMembers)
      if (errorMessage) {
        isValid = false
      }
      break
    case 'cooperativeUnits':
      errorMessage = getCooperativeUnitLengthError(data.form.cooperativeUnits)
      if (errorMessage) {
        isValid = false
      }
      break
    case 'projectStatus':
      // 验证立项/结项信息必填项
      if (!data.form.establishmentTime) {
        isValid = false
        errorMessage = '请选择立项时间'
      } else if (!data.form.projectStatus) {
        isValid = false
        errorMessage = '请选择项目当前状态'
      } else if (!data.form.plannedCompletionTime) {
        isValid = false
        errorMessage = '请选择计划完成时间'
      } else if (getCompletionDateError()) {
        isValid = false
        errorMessage = getCompletionDateError()
      }
      break
    case 'budgetInfo':
      // 验证项目经费预算必填项
      if (!data.form.approvedFunding) {
        isValid = false
        errorMessage = '请输入获批经费'
      }
      break
  }

  if (!isValid) {
    ElMessage.warning(errorMessage)
    return false
  }

  return true
}

// 下一步：验证当前页签，自动保存草稿并跳转到下一项
const saveCurrentTab = () => {
  if (!validateCurrentTab()) return
  saveProjectDraft()
  moveToNextProjectTab()
}

// 提交整个表单
const submitForm = () => {
  // 验证所有必填项
  let isValid = true
  let errorMessage = ''
  
  // 验证项目信息
  if (!data.form.name) {
    isValid = false
    errorMessage = '请输入项目名称'
  } else if (data.form.name.length > PROJECT_NAME_MAX_LENGTH) {
    isValid = false
    errorMessage = `项目名称不能超过${PROJECT_NAME_MAX_LENGTH}个字符`
  } else if (!data.form.researchType) {
    isValid = false
    errorMessage = '请选择研究类型'
  } else if (!data.form.subjectCategory) {
    isValid = false
    errorMessage = '请选择学科分类'
  } else if (!data.form.projectNature) {
    isValid = false
    errorMessage = '请输入项目性质'
  } else if (!data.form.projectLevel) {
    isValid = false
    errorMessage = '请选择课题类别'
  } else if (data.form.expectedResults && data.form.expectedResults.length > EXPECTED_RESULTS_MAX_LENGTH) {
    isValid = false
    errorMessage = `预期成果不能超过${EXPECTED_RESULTS_MAX_LENGTH}个字符`
  } else if (getTeamMemberLengthError(data.form.teamMembers)) {
    isValid = false
    errorMessage = getTeamMemberLengthError(data.form.teamMembers)
  } else if (getCooperativeUnitLengthError(data.form.cooperativeUnits)) {
    isValid = false
    errorMessage = getCooperativeUnitLengthError(data.form.cooperativeUnits)
  } else if (getAttachmentLengthError(data.form.attachments)) {
    isValid = false
    errorMessage = getAttachmentLengthError(data.form.attachments)
  }
  // 验证立项/结项信息
  else if (!data.form.establishmentTime) {
    isValid = false
    errorMessage = '请选择立项时间'
  } else if (!data.form.projectStatus) {
    isValid = false
    errorMessage = '请选择项目当前状态'
  } else if (!data.form.plannedCompletionTime) {
    isValid = false
    errorMessage = '请选择计划完成时间'
  } else if (getCompletionDateError()) {
    isValid = false
    errorMessage = getCompletionDateError()
  }
  // 验证项目经费预算
  else if (!data.form.approvedFunding) {
    isValid = false
    errorMessage = '请输入获批经费'
  }
  
  if (!isValid) {
    ElMessage.warning(errorMessage)
    return
  }

  saveProjectDraft()
  
  // 提交数据到后端
  if (data.form.id) {
    update()
  } else {
    add()
  }
  
  // 清空临时保存的数据
  data.savedTabData = {}
}

// 抽屉关闭事件处理
const handleDrawerClose = () => {
  console.log('抽屉关闭事件被触发')
  if (!data.skipDraftSaveOnClose && !data.isViewMode) {
    saveProjectDraft()
  }
  // 确保抽屉状态正确关闭
  data.formVisible = false
  // 隐藏安全提醒
  securityAlertManager.hide()
  // 重置表单状态
  data.activeTab = 'projectInfo'
  data.isViewMode = false
  data.savedTabData = {}
  data.skipDraftSaveOnClose = false
  // 清空临时数据
  data.tempTeamMember = {}
  data.tempCooperativeUnit = {}
  data.tempAttachment = createEmptyAttachment()
  // 重置文件校验状态
  data.fileValidationStatus = ''
  data.validationLoading = false
  // 关闭所有子对话框
  data.showTeamMemberDialog = false
  data.showCooperativeUnitDialog = false
  data.showAttachmentDialog = false
}

// 抽屉关闭前的处理
const handleBeforeClose = (done) => {
  // 直接关闭，不做额外验证
  done()
}

// 标签页切换处理（防抖优化）
let tabChangeTimer = null
const handleTabChange = (tabName) => {
  // 清除之前的定时器
  if (tabChangeTimer) {
    clearTimeout(tabChangeTimer)
  }
  
  // 设置防抖延迟
  tabChangeTimer = setTimeout(() => {
    // 确保标签页状态正确更新
    data.activeTab = tabName
    saveProjectDraft()
    
    // 关闭所有子对话框，避免状态冲突
    data.showTeamMemberDialog = false
    data.showCooperativeUnitDialog = false
    data.showAttachmentDialog = false
    
    // 清空临时编辑数据
    data.tempTeamMember = {}
    data.tempCooperativeUnit = {}
    data.tempAttachment = createEmptyAttachment()
    // 重置文件校验状态
    data.fileValidationStatus = ''
    data.validationLoading = false
    
    // 在新增模式下，切换到附件材料标签页时弹出安全提醒
    if (!data.isViewMode && tabName === 'attachments' && !data.securityAlertShown) {
      securityAlertManager.show()
      data.securityAlertShown = true
    }
  }, 50) // 50ms防抖延迟
}

const getLaboratoryLevel = () => {
  const laboratoryId = getUserLaboratoryId(data.user)
  if (!laboratoryId) {
    return
  }

  const cached = getCachedLaboratoryLevel(laboratoryId)
  if (cached !== null) {
    data.laboratoryLevel = cached
    return
  }

  fetchLaboratoryLevel(laboratoryId, data.user.token).then(level => {
    if (level !== null) data.laboratoryLevel = level
  })
}

// 根据内容长度判断对齐方式的方法
const getContentAlignClass = (content) => {
  if (!content) return 'content-center'
  // 判断内容是否超过一行（这里以50个字符为基准，可根据实际情况调整）
  const isMultiLine = content.length > 50 || content.includes('\n')
  return isMultiLine ? 'content-justify' : 'content-center'
}

// 处理抽屉打开事件
const handleDrawerOpened = () => {
  // 不再自动弹出安全提醒，改为在特定条件下弹出
}

// 处理安全提醒确认
const handleSecurityConfirm = () => {
  data.showSecurityAlert = false
}

onMounted(() => {
  if (data.user.id) {
    getLaboratoryLevel()
  }
  loadSchools()
  load()
})
</script>

<style scoped>
/* 标签页容器优化 */
.el-tabs {
  transition: all 0.2s ease-in-out;
}

/* 标签页内容区域优化 */
.el-tabs__content {
  overflow: hidden;
}

/* 标签页面板优化 */
.el-tab-pane {
  transition: opacity 0.2s ease-in-out;
}

/* 抽屉内容区域优化 */
.el-drawer__body {
  overflow: hidden;
}

/* 表单容器优化 */
.el-form {
  transition: all 0.2s ease-in-out;
}

/* 主列表保留稳定高度，避免初次加载和最后一页行数不足时页面高度跳动 */
.project-table-card {
  min-height: 590px;
}

.project-table {
  min-height: 540px;
  transition: none;
}

.project-pagination-card {
  min-height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-pagination-card :deep(.el-pagination) {
  flex-wrap: wrap;
  row-gap: 8px;
}

/* 防止内容闪烁 */
[v-show] {
  transition: opacity 0.15s ease-in-out;
}

/* 标签页切换时的平滑过渡 */
.tab-content-wrapper {
  min-height: 400px;
  transition: all 0.2s ease-in-out;
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
