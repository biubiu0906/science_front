<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input v-model="data.code" prefix-icon="Search" style="width: 200px; margin-right: 10px"
        placeholder="请输入立项编号查询"></el-input>
      <el-input v-model="data.name" prefix-icon="Search" style="width: 200px; margin-right: 10px"
        placeholder="请输入项目名称查询"></el-input>
      <el-button type="info" plain size="small" @click="load">查询</el-button>
      <el-button type="warning" plain size="small" style="margin: 0 10px" @click="reset">重置</el-button>
    </div>

    <div class="card" style="margin-bottom: 5px">
      <div style="margin-bottom: 10px; margin-left: 10px;" v-if="data.laboratoryLevel === 2">
        <el-button type="primary" plain size="small" @click="handleAdd">新增</el-button>
      </div>
      <el-table stripe :data="data.tableData" :header-cell-style="{ backgroundColor: '#e9edf2' }" class="table-center" empty-text="暂无数据">
        <el-table-column label="序号" type="index" :index="indexMethod" width="60"/>
        <el-table-column prop="name" label="项目名称" min-width="150" sortable />
        <el-table-column prop="code" label="立项编号" min-width="140" sortable />
        <el-table-column prop="researchType" label="研究类型" min-width="120" sortable />
        <el-table-column prop="subjectCategory" label="学科" min-width="100" sortable />
        <el-table-column prop="projectCategory" label="项目类别" min-width="150" sortable />
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
            <el-tag v-if="scope.row.status === '审核通过'" type="success">{{ scope.row.status }}</el-tag>
            <el-tag v-if="scope.row.status === '待审核'" type="warning">{{ scope.row.status }}</el-tag>
            <el-tag v-if="scope.row.status === '不通过'" type="danger">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="审核原因" min-width="110" show-overflow-tooltip sortable>
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
            <el-tooltip v-if="data.user.role === 'TEACHER' && scope.row.status === '待审核'" content="编辑项目" placement="bottom" effect="light">
              <el-button type="primary" circle :icon="Edit" size="small" @click="handleEdit(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip v-if="data.user.role === 'ADMIN'" content="审核项目" placement="bottom" effect="light">
              <el-button type="warning" circle :icon="Tickets" size="small" @click="handleCheck(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除项目" placement="bottom" effect="light">
              <el-button type="danger" circle :icon="Delete" size="small" @click="del(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="card" v-if="data.total">
      <el-pagination @current-change="load" background layout="prev, pager, next" :page-size="data.pageSize"
        v-model:current-page="data.pageNum" :total="data.total" />
    </div>

    <!-- 科研项目新增/查看抽屉 -->
    <el-drawer 
      v-model="data.formVisible" 
      direction="rtl" 
      size="65%" 
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
                <el-input v-model="data.form.name" :disabled="data.isViewMode" :placeholder="data.isViewMode && !data.form.name ? '暂无信息' : '请输入项目名称'" style="width: 70%;"></el-input>
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
                </el-select>
              </el-form-item>
              <el-form-item prop="projectCategory" label="项目类别" :required="!data.isViewMode">
                <el-input v-model="data.form.projectCategory" :disabled="data.isViewMode" :placeholder="data.isViewMode && !data.form.projectCategory ? '暂无信息' : '请输入项目类别'" style="width: 70%;"></el-input>
              </el-form-item>
              <el-form-item prop="expectedResults" label="预期成果">
                <el-input v-model="data.form.expectedResults" :disabled="data.isViewMode" type="textarea" :rows="4" :placeholder="data.isViewMode && !data.form.expectedResults ? '暂无信息' : '请输入预期成果描述'" style="width: 70%;"></el-input>
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
                  style="width: 70%;">
                </el-date-picker>
              </el-form-item>
            </el-form>
          </div>
          
          <!-- 项目经费预算标签页内容 -->
          <div v-show="data.activeTab === 'budgetInfo'" :key="'budgetInfo'">
            <el-form ref="formRef" :rules="data.isViewMode ? {} : rules" :model="data.form" label-width="120px">
              <el-form-item prop="approvedFunding" label="批准经费(万元)" :required="!data.isViewMode">
                <template v-if="data.isViewMode && (data.form.approvedFunding === null || data.form.approvedFunding === undefined || data.form.approvedFunding === '')">
                  <el-input disabled placeholder="暂无信息" style="width: 70%;"></el-input>
                </template>
                <el-input-number 
                  v-else
                  v-model="data.form.approvedFunding" 
                  :disabled="data.isViewMode"
                  :min="0" 
                  :precision="2"
                  placeholder="请输入批准经费"
                  style="width: 70%;">
                  <template #append>万元</template>
                </el-input-number>
              </el-form-item>
              <el-form-item prop="projectFinanceAccount" label="项目财务账号">
                <el-input v-model="data.form.projectFinanceAccount" :disabled="data.isViewMode" :placeholder="data.isViewMode && !data.form.projectFinanceAccount ? '暂无信息' : '请输入项目财务账号'" style="width: 70%;"></el-input>
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
            </el-form>
          </div>


          
          <!-- 附件材料标签页内容 -->
          <div v-show="data.activeTab === 'attachments'" :key="'attachments'">
            <div v-if="!data.isViewMode" style="margin-bottom: 20px; text-align: right;">
              <el-button type="primary" size="small" @click="data.showAttachmentDialog = true">
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
              <el-table-column label="操作" width="90">
                <template #default="scope">
                  <el-tooltip content="预览文件" placement="bottom" effect="light">
                    <el-button type="primary" :icon="View" circle size="small" @click="previewFile(scope.row)">
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
            <el-button v-if="data.activeTab !== 'attachments'" type="primary" size="small" @click="saveCurrentTab">保 存</el-button>
            <el-button v-else type="primary" size="small" @click="submitForm">提 交</el-button>
          </template>
        </div>
      </template>
    </el-drawer>

    <!-- 新增团队成员对话框 -->
    <el-dialog v-model="data.showTeamMemberDialog" title="新增团队成员" width="500px">
      <el-form :model="data.tempTeamMember" label-width="120px">
        <el-form-item label="姓名" required>
          <el-input v-model="data.tempTeamMember.name" placeholder="请输入姓名"></el-input>
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
          <el-input v-model="data.tempTeamMember.affiliation" placeholder="请输入署名/代表单位"></el-input>
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
           <el-input v-model="data.tempCooperativeUnit.unitName" placeholder="请输入单位名称"></el-input>
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
     <el-dialog v-model="data.showAttachmentDialog" title="新增附件材料" width="500px">
       <el-form :model="data.tempAttachment" label-width="120px">
         <el-form-item label="文件类别" required>
           <el-select v-model="data.tempAttachment.fileCategory" placeholder="请选择文件类别" style="width: 100%;">
             <el-option label="成果原件/扫描件" value="成果原件/扫描件"></el-option>
             <el-option label="立/结项证明" value="立/结项证明"></el-option>
           </el-select>
         </el-form-item>
         <el-form-item label="文件简介">
           <el-input v-model="data.tempAttachment.fileDescription" type="textarea" :rows="3" placeholder="请输入文件简介"></el-input>
         </el-form-item>
         <el-form-item label="上传文件" required>
           <el-upload 
             :action="baseUrl + '/files/upload'" 
             :on-success="handleAttachmentUpload"
             :before-upload="beforeAttachmentUpload"
             :limit="1"
             :file-list="data.tempAttachment.fileList || []"
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
          <el-form-item prop="status" label="提交状态">
            <el-select v-model="data.form.status" placeholder="请选择审核结果">
              <el-option label="待审核" value="待审核"></el-option>
              <el-option label="审核通过" value="审核通过"></el-option>
              <el-option label="不通过" value="不通过"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="reason" label="审核理由">
            <el-input v-model="data.form.reason" placeholder="请输入审核理由"></el-input>
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

import { reactive, ref, onMounted } from "vue";
import request from "@/utils/request.js";
import { ElMessage, ElMessageBox } from "@/utils/element-plus";
import { Delete, Edit, View, Tickets, Loading, SuccessFilled, CircleCloseFilled } from "@element-plus/icons-vue";
import FilePreviewCom from "./componets/FilePreviewCom.vue";
import SecurityAlert from "@/components/SecurityAlert.vue";
import { securityAlertManager } from "@/utils/securityAlert.js";
const baseUrl = import.meta.env.VITE_BASE_URL
const formRef = ref()
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
  tempAttachment: {},
  // 文件校验状态
  fileValidationStatus: '', // 'validating', 'success', 'failed'
  validationLoading: false, // 校验加载状态
  form: {
    // 项目信息
    name: '',
    researchType: '',
    subjectCategory: '',
    projectCategory: '',
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
    // 数组字段
    teamMembers: [], // 团队成员
    cooperativeUnits: [], // 合作研究单位
    attachments: [], // 附件材料
  },
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  code: null,
  name: null,
  showSecurityAlert: false,
  securityAlertShown: false, // 标记是否已经显示过安全提醒，避免重复弹出
  laboratoryLevel: null,
  savedTabData: {}, // 临时保存的标签页数据
})

const rules = reactive({
  // 项目信息验证规则
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
  ],
  researchType: [
    { required: true, message: '请选择研究类型', trigger: 'change' },
  ],
  subjectCategory: [
    { required: true, message: '请选择学科分类', trigger: 'change' },
  ],
  projectCategory: [
    { required: true, message: '请选择项目类别', trigger: 'change' },
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
  ],
  // 项目经费预算验证规则
  approvedFunding: [
    { required: true, message: '请输入批准经费', trigger: 'blur' },
  ],
})

const indexMethod = (index) => {
  return (data.pageNum - 1) * data.pageSize + index + 1
}

// 处理文件名显示，去掉时间戳前缀
const getDisplayFileName = (fileName) => {
  if (!fileName) return ''
  // 匹配时间戳模式：数字-文件名
  const match = fileName.match(/^\d+-(.+)$/)
  return match ? match[1] : fileName
}

const load = () => {
  console.log('load 函数被调用')
  request.get('/project/selectPage', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      code: data.code,
      name: data.name
    }
  }).then(res => {
    console.log('load 响应数据:', res)
    if (res.code === '200') {
      data.tableData = res.data?.list || []
      data.total = res.data?.total
      console.log('表格数据已加载:', data.tableData)
      console.log('数据总数:', data.total)
    }
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
    // 重置表单数据
    data.form = {
      // 项目信息
      name: '',
      researchType: '',
      subjectCategory: '',
      projectCategory: '',
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
      // 数组字段
      teamMembers: [],
      cooperativeUnits: [],
      attachments: [],
    }
    data.isViewMode = false // 设置为编辑模式
    data.activeTab = 'projectInfo' // 重置到项目信息标签页
    data.securityAlertShown = false // 重置安全提醒标记，允许在附件材料标签页显示
    data.formVisible = true
    console.log('新增抽屉应该已打开，formVisible:', data.formVisible)
  }, 10)
}
const handleEdit = (row) => {
  data.form = JSON.parse(JSON.stringify(row))
  // 确保数组字段存在
  if (!data.form.teamMembers) data.form.teamMembers = []
  if (!data.form.cooperativeUnits) data.form.cooperativeUnits = []
  if (!data.form.attachments) data.form.attachments = []
  data.isViewMode = false // 设置为编辑模式
  data.activeTab = 'projectInfo' // 重置到第一个标签页
  data.securityAlertShown = false // 重置安全提醒标记，允许在附件材料标签页显示
  data.formVisible = true
}
const handleCheck = (row) => {
  data.form = JSON.parse(JSON.stringify(row))
  // 确保数组字段存在
  if (!data.form.teamMembers) data.form.teamMembers = []
  if (!data.form.cooperativeUnits) data.form.cooperativeUnits = []
  if (!data.form.attachments) data.form.attachments = []
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
    data.form = JSON.parse(JSON.stringify(row))
    // 确保数组字段存在
    if (!data.form.teamMembers) data.form.teamMembers = []
    if (!data.form.cooperativeUnits) data.form.cooperativeUnits = []
    if (!data.form.attachments) data.form.attachments = []
    data.isViewMode = true  // 设置为查看模式
    data.activeTab = 'projectInfo'  // 重置到第一个标签页
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
      data.formVisible = false
      load()
    } else {
      ElMessage.error(res.msg)
    }
  })
}

const update = () => {
  request.put('/project/update', data.form).then(res => {
    if (res.code === '200') {
      ElMessage.success('操作成功')
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

const reset = () => {
  data.code = null
  data.name = null
  load()
}

// 团队成员相关方法
const addTeamMember = () => {
  // 验证必填字段
  if (!data.tempTeamMember.name || !data.tempTeamMember.role) {
    ElMessage.warning('请填写姓名和参与角色')
    return
  }
  
  // 添加到团队成员列表
  data.form.teamMembers.push({
    name: data.tempTeamMember.name,
    role: data.tempTeamMember.role,
    affiliation: data.tempTeamMember.affiliation || ''
  })
  
  // 重置临时数据并关闭对话框
  data.tempTeamMember = { name: '', role: '', affiliation: '' }
  data.showTeamMemberDialog = false
  ElMessage.success('团队成员添加成功')
}

const removeTeamMember = (index) => {
  ElMessageBox.confirm('确定要删除该团队成员吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(() => {
    data.form.teamMembers.splice(index, 1)
    ElMessage.success('删除成功')
  }).catch(() => {
    // 用户取消删除
  })
}

// 合作研究单位相关方法
 const addCooperativeUnit = () => {
   // 添加到合作研究单位列表（字段均为非必填）
   data.form.cooperativeUnits.push({
     unitName: data.tempCooperativeUnit.unitName || '',
     completionUnit: data.tempCooperativeUnit.completionUnit || ''
   })
   
   // 重置临时数据并关闭对话框
   data.tempCooperativeUnit = { unitName: '', completionUnit: '' }
   data.showCooperativeUnitDialog = false
   ElMessage.success('合作研究单位添加成功')
 }



// 附件材料相关方法
const addAttachment = async () => {
  // 验证必填字段
  if (!data.tempAttachment.fileCategory || !data.tempAttachment.fileName || !data.tempAttachment.fileUrl) {
    ElMessage.warning('请选择文件类别并上传文件')
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
  // 关闭对话框
  data.showAttachmentDialog = false
}

const handleAttachmentUpload = (res) => {
  if (res.code === '200') {
    data.tempAttachment.fileName = res.data.split('/').pop() // 从URL中提取文件名
    data.tempAttachment.fileUrl = res.data
    ElMessage.success('文件上传成功')
  } else {
    ElMessage.error('文件上传失败')
  }
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

  if (!isAllowedType) {
    ElMessage.error('支持png,jpg,jpeg,txt,pdf,docx文件格式')
    return false
  }
  if (!isLt10M) {
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

/**
 * 处理文件下载
 * @param {Object} downloadData 下载数据对象，包含url和fileName
 */
const handleFileDownload = (downloadData) => {
  if (!downloadData.url) {
    ElMessage.error('下载链接不存在')
    return
  }
  
  try {
    // 创建一个临时的a标签来触发下载
    const link = document.createElement('a')
    link.href = downloadData.url
    link.download = downloadData.fileName || '下载文件'
    link.target = '_blank'
    
    // 添加到DOM并触发点击
    document.body.appendChild(link)
    link.click()
    
    // 清理DOM
    document.body.removeChild(link)
    
    ElMessage.success('文件下载已开始')
  } catch (error) {
    console.error('文件下载失败:', error)
    ElMessage.error('文件下载失败，请重试')
  }
}

const removeCooperativeUnit = (index) => {
  ElMessageBox.confirm('确定要删除该合作研究单位吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(() => {
    data.form.cooperativeUnits.splice(index, 1)
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
        data.form.projectCategory = ''
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
    ElMessage.success('重置成功')
  }).catch(() => {
    // 用户取消重置
  })
}

// 保存当前标签页的数据（验证必填项）
const saveCurrentTab = () => {
  let isValid = true
  let errorMessage = ''
  
  switch (data.activeTab) {
    case 'projectInfo':
      // 验证项目信息必填项
      if (!data.form.name) {
        isValid = false
        errorMessage = '请输入项目名称'
      } else if (!data.form.researchType) {
        isValid = false
        errorMessage = '请选择研究类型'
      } else if (!data.form.subjectCategory) {
        isValid = false
        errorMessage = '请选择学科分类'
      } else if (!data.form.projectCategory) {
        isValid = false
        errorMessage = '请输入项目类别'
      }
      break
    case 'teamMembers':
      // 团队成员没有必填项验证，直接保存
      break
    case 'cooperativeUnits':
      // 合作研究单位没有必填项验证，直接保存
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
      }
      break
    case 'budgetInfo':
      // 验证项目经费预算必填项
      if (!data.form.approvedFunding) {
        isValid = false
        errorMessage = '请输入批准经费'
      }
      break
  }
  
  if (!isValid) {
    ElMessage.warning(errorMessage)
    return
  }
  
  // 保存当前标签页数据到临时存储
  const tabData = {}
  switch (data.activeTab) {
    case 'projectInfo':
      tabData.projectInfo = {
        name: data.form.name,
        researchType: data.form.researchType,
        subjectCategory: data.form.subjectCategory,
        projectCategory: data.form.projectCategory,
        expectedResults: data.form.expectedResults
      }
      break
    case 'teamMembers':
      tabData.teamMembers = [...data.form.teamMembers]
      break
    case 'cooperativeUnits':
      tabData.cooperativeUnits = [...data.form.cooperativeUnits]
      break
    case 'projectStatus':
      tabData.projectStatus = {
        establishmentTime: data.form.establishmentTime,
        midCheckTime: data.form.midCheckTime,
        projectStatus: data.form.projectStatus,
        completionAppraisal: data.form.completionAppraisal,
        plannedCompletionTime: data.form.plannedCompletionTime,
        actualCompletionTime: data.form.actualCompletionTime
      }
      break
    case 'budgetInfo':
      tabData.budgetInfo = {
        approvedFunding: data.form.approvedFunding,
        projectFinanceAccount: data.form.projectFinanceAccount,
        matchingFunding: data.form.matchingFunding
      }
      break
  }
  
  // 将数据保存到localStorage或者data中的临时字段
  if (!data.savedTabData) {
    data.savedTabData = {}
  }
  data.savedTabData[data.activeTab] = tabData[data.activeTab]
  
  ElMessage.success('保存成功')
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
  } else if (!data.form.researchType) {
    isValid = false
    errorMessage = '请选择研究类型'
  } else if (!data.form.subjectCategory) {
    isValid = false
    errorMessage = '请选择学科分类'
  } else if (!data.form.projectCategory) {
    isValid = false
    errorMessage = '请输入项目类别'
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
  }
  // 验证项目经费预算
  else if (!data.form.approvedFunding) {
    isValid = false
    errorMessage = '请输入批准经费'
  }
  
  if (!isValid) {
    ElMessage.warning(errorMessage)
    return
  }
  
  // 合并保存的标签页数据
  if (data.savedTabData) {
    Object.keys(data.savedTabData).forEach(tabKey => {
      if (tabKey === 'projectInfo') {
        Object.assign(data.form, data.savedTabData[tabKey])
      } else if (tabKey === 'teamMembers') {
        data.form.teamMembers = data.savedTabData[tabKey]
      } else if (tabKey === 'cooperativeUnits') {
        data.form.cooperativeUnits = data.savedTabData[tabKey]
      } else if (tabKey === 'projectStatus') {
        Object.assign(data.form, data.savedTabData[tabKey])
      } else if (tabKey === 'budgetInfo') {
        Object.assign(data.form, data.savedTabData[tabKey])
      }
    })
  }
  
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
  // 确保抽屉状态正确关闭
  data.formVisible = false
  // 隐藏安全提醒
  securityAlertManager.hide()
  // 重置表单状态
  data.activeTab = 'projectInfo'
  data.isViewMode = false
  data.savedTabData = {}
  // 清空临时数据
  data.tempTeamMember = {}
  data.tempCooperativeUnit = {}
  data.tempAttachment = {}
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
    
    // 关闭所有子对话框，避免状态冲突
    data.showTeamMemberDialog = false
    data.showCooperativeUnitDialog = false
    data.showAttachmentDialog = false
    
    // 清空临时编辑数据
    data.tempTeamMember = {}
    data.tempCooperativeUnit = {}
    data.tempAttachment = {}
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
  console.log('getLaboratoryLevel 被调用')
  console.log('用户信息:', data.user)
  // 检查用户是否有实验室ID
  if (!data.user.laboratoryId) {
    console.log('用户没有实验室ID')
    return
  }
  
  request.get('/teacher/selectLaboratoryById/' + data.user.laboratoryId).then(res => {
    console.log('获取实验室级别响应:', res)
    if (res.code === '200') {
      data.laboratoryLevel = res.data.type
      console.log('设置 laboratoryLevel 为:', data.laboratoryLevel)
    } else {
      ElMessage.error(res.msg)
    }
  }).catch(error => {
    console.error('获取实验室级别失败:', error)
    ElMessage.error('获取实验室信息失败')
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

/* 表格容器优化 */
.el-table {
  transition: all 0.2s ease-in-out;
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