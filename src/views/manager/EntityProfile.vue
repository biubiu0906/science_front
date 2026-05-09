<template>
  <div>
    <div class="card" style="margin-bottom: 8px; top: 0; z-index: 3">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px">
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap">
          <el-radio-group v-model="query.type" size="small">
            <el-radio-button value="school">学校</el-radio-button>
            <el-radio-button value="laboratory">实验室</el-radio-button>
            <el-radio-button value="base">基地</el-radio-button>
            <el-radio-button value="team">团队</el-radio-button>
          </el-radio-group>

          <el-select v-if="query.type === 'school'" v-model="query.schoolId" filterable style="width: 260px" placeholder="请选择学校">
            <el-option v-for="s in mockSchools" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>

          <el-select v-else v-model="query.laboratoryId" filterable style="width: 260px" :placeholder="`请选择${typeLabel}`">
            <el-option v-for="l in currentTypeLaboratories" :key="l.id" :label="l.laboratoryName" :value="l.id" />
          </el-select>

          <el-date-picker
            v-model="query.dateRange"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            range-separator="至"
            value-format="YYYY-MM-DD"
          />
        </div>

        <div style="display: flex; align-items: center; gap: 8px">
          <el-button type="warning" plain size="small" @click="reset">重置</el-button>
          <el-button type="primary" plain size="small" @click="refresh">刷新</el-button>
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 8px">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
          <div style="font-size: 18px; font-weight: 600; color: #303133">
            {{ headerTitle }}
          </div>
        </div>
      </div>
      <el-descriptions class="entity-detail-descriptions" border :column="6" style="margin-top: 10px">
        <el-descriptions-item v-for="(item, idx) in entityDetailItems" :key="`${item.label}-${idx}`" :label="item.label" :span="item.span">
          <template v-if="Array.isArray(item.value)">
            <div class="desc-list">
              <div v-for="(v, i) in item.value" :key="i">{{i + 1}}. {{ v }}</div>
            </div>
          </template>
          <template v-else>
            {{ item.value || '暂无数据' }}
          </template>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="kpi-row">
      <div class="card kpi-card">
        <div class="kpi-title">科研项目</div>
        <div class="kpi-value">{{ kpis.project.total }}</div>
        <div class="kpi-sub">
          <el-tag size="small" type="warning" effect="light">待审 {{ kpis.project.pending }}</el-tag>
          <el-tag size="small" type="success" effect="light">通过 {{ kpis.project.approved }}</el-tag>
        </div>
      </div>
      <div class="card kpi-card">
        <div class="kpi-title">科研成果</div>
        <div class="kpi-value">{{ kpis.achievement.total }}</div>
        <div class="kpi-sub">
          <el-tag size="small" type="warning" effect="light">待审 {{ kpis.achievement.pending }}</el-tag>
          <el-tag size="small" type="success" effect="light">通过 {{ kpis.achievement.approved }}</el-tag>
        </div>
      </div>
      <div class="card kpi-card">
        <div class="kpi-title">阶段报告</div>
        <div class="kpi-value">{{ kpis.phaseReport.total }}</div>
        <div class="kpi-sub">
          <el-tag size="small" type="warning" effect="light">待审 {{ kpis.phaseReport.pending }}</el-tag>
          <el-tag size="small" type="success" effect="light">通过 {{ kpis.phaseReport.approved }}</el-tag>
        </div>
      </div>
    </div>

    <div class="chart-row">
      <div class="card chart-span-2">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px">
          <div style="font-weight: 600; color: #303133">趋势</div>
          <el-text type="info" size="small">近 6 个月</el-text>
        </div>
        <div ref="trendChartEl" style="height: 260px; width: 100%"></div>
      </div>
      <div class="card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px">
          <div style="font-weight: 600; color: #303133">项目状态</div>
          <el-text type="info" size="small">在研/结项</el-text>
        </div>
        <div ref="statusChartEl" style="height: 260px; width: 100%"></div>
      </div>
      <div class="card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px">
          <div style="font-weight: 600; color: #303133">学科分布</div>
          <el-text type="info" size="small">项目</el-text>
        </div>
        <div ref="subjectChartEl" style="height: 260px; width: 100%"></div>
      </div>
    </div>

    <div class="card">
      <el-tabs v-model="activeTab" type="border-card" @tab-change="onTabChange">
        <el-tab-pane label="总览" name="overview">
          <div style="display: flex; gap: 10px; flex-wrap: wrap">
            <div class="card" style="flex: 1; min-width: 380px; box-shadow: none">
              <div style="font-weight: 600; margin-bottom: 10px">待办</div>
              <div v-if="todos.length === 0" style="color: #909399; padding: 18px; text-align: center">暂无待办</div>
              <div v-else style="display: flex; flex-direction: column; gap: 10px">
                <div
                  v-for="t in todos"
                  :key="t.key"
                  style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #f5f7fa; border-radius: 6px; cursor: pointer"
                  @click="jumpTo(t)"
                >
                  <div style="display: flex; align-items: center; gap: 8px">
                    <el-tag size="small" :type="t.tagType" effect="light">{{ t.tagText }}</el-tag>
                    <div style="font-weight: 500">{{ t.title }}</div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px">
                    <el-text type="info">{{ t.count }}</el-text>
                    <el-icon><ArrowRight /></el-icon>
                  </div>
                </div>
              </div>
            </div>

            <div class="card" style="flex: 1.2; min-width: 460px; box-shadow: none">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px">
                <div style="font-weight: 600">最近更新</div>
              </div>
              <div v-if="recentList.length === 0" style="color: #909399; padding: 18px; text-align: center">暂无动态</div>
              <el-timeline v-else>
                <el-timeline-item v-for="item in recentList" :key="item.key" :timestamp="item.time" placement="top">
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px">
                    <div style="display: flex; align-items: center; gap: 10px; min-width: 0">
                      <el-tag size="small" :type="item.tagType" effect="light">{{ item.tagText }}</el-tag>
                      <el-text style="max-width: 420px" line-clamp="1">{{ item.title }}</el-text>
                    </div>
                    <el-button size="small" type="primary" @click="jumpTo(item.jump)" plain>查看</el-button>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="科研项目" name="project">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 10px">
            <el-input v-model="filters.project.keyword" style="width: 260px" placeholder="项目名称/编号" clearable />
            <el-select v-model="filters.project.status" style="width: 180px" placeholder="审核状态" clearable>
              <el-option label="待实验室审核" value="待审核" />
              <el-option label="审核通过" value="审核通过" />
              <el-option label="不通过" value="不通过" />
            </el-select>
            <el-select v-model="filters.project.projectStatus" style="width: 180px" placeholder="项目状态" clearable>
              <el-option label="在研" value="0" />
              <el-option label="结项" value="1" />
              <el-option label="未开始" value="2" />
            </el-select>
          </div>
          <el-table :data="pagedProjects" stripe :header-cell-style="{ backgroundColor: '#e9edf2' }" class="table-center" empty-text="暂无数据">
            <el-table-column type="index" label="序号" width="60" :index="indexMethod(projectPager.pageNum, projectPager.pageSize)" />
            <el-table-column prop="name" label="项目名称" min-width="150" sortable show-overflow-tooltip />
            <el-table-column prop="code" label="立项编号" min-width="140" sortable />
            <el-table-column prop="researchType" label="研究类型" min-width="120" sortable />
            <el-table-column prop="subjectCategory" label="学科" min-width="100" sortable />
            <el-table-column prop="projectNature" label="项目性质" min-width="150" sortable />
            <el-table-column prop="projectLevel" label="课题类别" min-width="120" sortable />
            <el-table-column prop="projectStatus" label="项目状态" width="110">
              <template #default="{ row }">
                <el-tag v-if="row.projectStatus === '0'" type="primary">在研</el-tag>
                <el-tag v-else-if="row.projectStatus === '1'" type="success">结项</el-tag>
                <el-tag v-else type="info">未开始</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="teacherName" label="申请教师" min-width="110" sortable />
            <el-table-column prop="status" label="审核状态" min-width="110" sortable>
              <template #default="{ row }">
                <el-tag v-if="row.status === '待审核'" type="warning">待实验室审核</el-tag>
                <el-tag v-else-if="row.status === '不通过'" type="danger">不通过</el-tag>
                <el-tag v-else type="success">审核通过</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="审核信息" min-width="110" show-overflow-tooltip sortable />
            <el-table-column prop="time" label="审核时间" min-width="160" show-overflow-tooltip sortable />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-tooltip content="查看详情" placement="bottom" effect="light">
                  <el-button type="primary" circle :icon="View" size="small" @click="handleProjectView(row)"></el-button>
                </el-tooltip>
                <el-tooltip v-if="canReviewProjectOrAchievement(row.status)" content="审核项目" placement="bottom" effect="light">
                  <el-button type="warning" circle :icon="Tickets" size="small" @click="handleProjectCheck(row)"></el-button>
                </el-tooltip>
                <el-tooltip content="删除项目" placement="bottom" effect="light">
                  <el-button type="danger" circle :icon="Delete" size="small" @click="handleProjectDelete(row)"></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-top: 10px; text-align: center" v-if="filteredProjects.length">
            <el-pagination
              background
              layout="prev, pager, next"
              :page-size="projectPager.pageSize"
              v-model:current-page="projectPager.pageNum"
              @current-change="syncToRoute"
              :total="filteredProjects.length"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="科研成果" name="achievement">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 10px">
            <el-input v-model="filters.achievement.keyword" style="width: 260px" placeholder="成果名称/项目名称" clearable />
            <el-select v-model="filters.achievement.status" style="width: 180px" placeholder="审核状态" clearable>
              <el-option label="待实验室审核" value="待审核" />
              <el-option label="审核通过" value="审核通过" />
              <el-option label="不通过" value="不通过" />
            </el-select>
            <el-select v-model="filters.achievement.typeName" style="width: 180px" placeholder="成果类型" clearable>
              <el-option v-for="t in achievementTypes" :key="t" :label="t" :value="t" />
            </el-select>
          </div>
          <el-table :data="pagedAchievements" stripe :header-cell-style="{ backgroundColor: '#e9edf2' }" class="table-center" empty-text="暂无数据">
            <el-table-column type="index" label="序号" width="60" :index="indexMethod(achievementPager.pageNum, achievementPager.pageSize)" />
            <el-table-column prop="name" label="成果名称" min-width="110" sortable show-overflow-tooltip />
            <el-table-column prop="typeName" label="成果类型" min-width="110" show-overflow-tooltip sortable />
            <el-table-column prop="description" label="成果描述" min-width="110" sortable show-overflow-tooltip />
            <el-table-column prop="teacherName" label="教师" min-width="100" sortable />
            <el-table-column prop="projectName" label="项目名称" min-width="150" show-overflow-tooltip sortable />
            <el-table-column prop="projectCode" label="立项编号" min-width="120" show-overflow-tooltip sortable />
            <el-table-column prop="evidence" label="证明材料" min-width="120" sortable>
              <template #default="{ row }">
                <template v-if="row.evidence">
                  <el-tooltip content="下载证明材料" placement="bottom" effect="light">
                    <el-button type="primary" size="small" @click="handleDownloadEvidence(row)">下载文件</el-button>
                  </el-tooltip>
                </template>
                <span v-else style="color: #999">暂无数据</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="审核状态" min-width="120" sortable>
              <template #default="{ row }">
                <el-tag v-if="row.status === '待审核'" type="warning">待实验室审核</el-tag>
                <el-tag v-else-if="row.status === '不通过'" type="danger">不通过</el-tag>
                <el-tag v-else type="success">审核通过</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="审核信息" min-width="110" sortable show-overflow-tooltip />
            <el-table-column prop="time" label="审核时间" min-width="160" show-overflow-tooltip sortable />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-tooltip content="查看详情" placement="bottom" effect="light">
                  <el-button type="primary" circle :icon="View" size="small" @click="handleAchievementView(row)"></el-button>
                </el-tooltip>
                <el-tooltip v-if="canReviewProjectOrAchievement(row.status)" content="审核成果" placement="bottom" effect="light">
                  <el-button type="warning" circle :icon="Tickets" size="small" @click="handleAchievementCheck(row)"></el-button>
                </el-tooltip>
                <el-tooltip content="删除成果" placement="bottom" effect="light">
                  <el-button type="danger" circle size="small" :icon="Delete" @click="handleAchievementDelete(row)"></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-top: 10px; text-align: center" v-if="filteredAchievements.length">
            <el-pagination
              background
              layout="prev, pager, next"
              :page-size="achievementPager.pageSize"
              v-model:current-page="achievementPager.pageNum"
              @current-change="syncToRoute"
              :total="filteredAchievements.length"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="阶段报告" name="phaseReport">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 10px">
            <el-input v-model="filters.phaseReport.keyword" style="width: 260px" placeholder="实验室名称/编号" clearable />
            <el-select v-model="filters.phaseReport.reviewStatus" style="width: 200px" placeholder="审核状态" clearable>
              <el-option label="已提交" value="SUBMITTED" />
              <el-option label="校审通过" value="SCHOOL_APPROVED" />
              <el-option label="校审驳回" value="SCHOOL_REJECTED" />
              <el-option label="审核通过" value="SUPER_APPROVED" />
              <el-option label="审核未通过" value="SUPER_REJECTED" />
            </el-select>
          </div>
          <el-table :data="pagedPhaseReports" stripe @selection-change="handlePhaseSelectionChange" :header-cell-style="{ backgroundColor: '#e9edf2' }" class="table-center" empty-text="暂无数据">
            <el-table-column type="selection" width="35" />
            <el-table-column type="index" label="序号" width="60" :index="indexMethod(phaseReportPager.pageNum, phaseReportPager.pageSize)" />
            <el-table-column prop="id" label="编号" width="100" />
            <el-table-column prop="basicInfo.labName" label="所属实验室" min-width="160" show-overflow-tooltip />
            <el-table-column prop="basicInfo.reportStartDate" label="起始时间" width="120" />
            <el-table-column prop="basicInfo.reportEndDate" label="结束时间" width="120" />
            <el-table-column prop="reviewStatus" label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="phaseStatusTag(row.reviewStatus)" effect="light">{{ phaseStatusText(row.reviewStatus) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="updatedAt" label="更新时间" width="120" />
            <el-table-column label="操作" min-width="120" fixed="right">
              <template #default="{ row }">
                <el-tooltip content="查看详情" placement="bottom" effect="light">
                  <el-button @click="openPhaseReport(row)" size="small" type="primary" circle :icon="View"></el-button>
                </el-tooltip>
                <el-tooltip v-if="canReviewPhaseReport(row)" content="审核报告" placement="bottom" effect="light">
                  <el-button @click="handlePhaseCheck(row)" size="small" type="warning" circle :icon="Tickets"></el-button>
                </el-tooltip>
                <el-tooltip content="删除报告" placement="bottom" effect="light">
                  <el-button @click="handlePhaseDelete(row)" size="small" type="danger" circle :icon="Delete"></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-top: 10px; text-align: center" v-if="filteredPhaseReports.length">
            <el-pagination
              background
              layout="prev, pager, next"
              :page-size="phaseReportPager.pageSize"
              v-model:current-page="phaseReportPager.pageNum"
              @current-change="syncToRoute"
              :total="filteredPhaseReports.length"
            />
          </div>
        </el-tab-pane>

      </el-tabs>
    </div>

    <el-dialog v-model="phaseDialog.visible" title="阶段报告详情" width="70%" destroy-on-close>
      <el-descriptions v-if="phaseDialog.data" border :column="4">
        <el-descriptions-item label="编号" :span="1">
          {{ phaseDialog.data.id }}
        </el-descriptions-item>
        <el-descriptions-item label="状态" :span="1">
          <el-tag :type="phaseStatusTag(phaseDialog.data.reviewStatus)" effect="light">{{ phaseStatusText(phaseDialog.data.reviewStatus) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="实验室" :span="2">
          {{ phaseDialog.data.basicInfo.labName }}
        </el-descriptions-item>
        <el-descriptions-item label="依托学校" :span="2">
          {{ phaseDialog.data.basicInfo.universityName }}
        </el-descriptions-item>
        <el-descriptions-item label="报告周期" :span="2">
          {{ phaseDialog.data.basicInfo.reportStartDate }} 至 {{ phaseDialog.data.basicInfo.reportEndDate }}
        </el-descriptions-item>
        <el-descriptions-item label="主要方向" :span="4">
          <div style="display: flex; flex-wrap: wrap; gap: 6px">
            <el-tag v-for="(d, i) in phaseDialog.data.basicInfo.researchDirections" :key="i" type="info" effect="plain">{{ d }}</el-tag>
          </div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button size="small" @click="phaseDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="projectDialog.visible" title="科研项目详情" width="62%" destroy-on-close>
      <el-descriptions v-if="projectDialog.data" border :column="2">
        <el-descriptions-item label="项目名称" :span="2">{{ displayValue(projectDialog.data.name) }}</el-descriptions-item>
        <el-descriptions-item label="立项编号">{{ displayValue(projectDialog.data.code) }}</el-descriptions-item>
        <el-descriptions-item label="申请教师">{{ displayValue(projectDialog.data.teacherName) }}</el-descriptions-item>
        <el-descriptions-item label="研究类型">{{ displayValue(projectDialog.data.researchType) }}</el-descriptions-item>
        <el-descriptions-item label="学科">{{ displayValue(projectDialog.data.subjectCategory) }}</el-descriptions-item>
        <el-descriptions-item label="项目性质">{{ displayValue(projectDialog.data.projectNature) }}</el-descriptions-item>
        <el-descriptions-item label="课题类别">{{ displayValue(projectDialog.data.projectLevel) }}</el-descriptions-item>
        <el-descriptions-item label="项目状态">{{ projectStatusText(projectDialog.data.projectStatus) }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ approvalStatusText(projectDialog.data.status) }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ displayValue(projectDialog.data.time) }}</el-descriptions-item>
        <el-descriptions-item label="审核信息" :span="2">
          <div class="detail-text">{{ displayValue(projectDialog.data.reason) }}</div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button size="small" @click="projectDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="achievementDialog.visible" title="科研成果详情" width="58%" destroy-on-close>
      <el-descriptions v-if="achievementDialog.data" border :column="2">
        <el-descriptions-item label="成果名称" :span="2">{{ displayValue(achievementDialog.data.name) }}</el-descriptions-item>
        <el-descriptions-item label="成果类型">{{ displayValue(achievementDialog.data.typeName) }}</el-descriptions-item>
        <el-descriptions-item label="教师">{{ displayValue(achievementDialog.data.teacherName) }}</el-descriptions-item>
        <el-descriptions-item label="项目名称" :span="2">{{ displayValue(achievementDialog.data.projectName) }}</el-descriptions-item>
        <el-descriptions-item label="立项编号">{{ displayValue(achievementDialog.data.projectCode) }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ approvalStatusText(achievementDialog.data.status) }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ displayValue(achievementDialog.data.time) }}</el-descriptions-item>
        <el-descriptions-item label="审核信息" :span="2">
          <div class="detail-text">{{ displayValue(achievementDialog.data.reason) }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="成果描述" :span="2">
          <div class="detail-text">{{ displayValue(achievementDialog.data.description) }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="证明材料" :span="2">
          <el-button v-if="achievementDialog.data.evidence" link type="primary" @click="handleDownloadEvidence(achievementDialog.data)">下载文件</el-button>
          <span v-else>暂无数据</span>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button size="small" @click="achievementDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="projectReviewDialog.visible" title="审核项目" width="500px" destroy-on-close>
      <el-form :model="projectReviewDialog.form" label-width="80px" style="padding: 12px 20px">
        <el-form-item label="审核结果">
          <el-select v-model="projectReviewDialog.form.status" placeholder="请选择审核结果" style="width: 100%">
            <el-option label="通过" value="通过" />
            <el-option label="驳回" value="驳回" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核理由">
          <el-input v-model="projectReviewDialog.form.reason" type="textarea" :rows="4" placeholder="请输入审核理由" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="projectReviewDialog.visible = false">取消</el-button>
        <el-button type="primary" size="small" @click="submitProjectReview">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="achievementReviewDialog.visible" title="审核成果" width="500px" destroy-on-close>
      <el-form :model="achievementReviewDialog.form" label-width="80px" style="padding: 12px 20px">
        <el-form-item label="审核结果">
          <el-select v-model="achievementReviewDialog.form.status" placeholder="请选择审核结果" style="width: 100%">
            <el-option label="通过" value="通过" />
            <el-option label="驳回" value="驳回" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核理由">
          <el-input v-model="achievementReviewDialog.form.reason" type="textarea" :rows="4" placeholder="请输入审核理由" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="achievementReviewDialog.visible = false">取消</el-button>
        <el-button type="primary" size="small" @click="submitAchievementReview">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="phaseReviewDialog.visible" title="报告审核" width="500px" destroy-on-close>
      <el-form :model="phaseReviewDialog.form" label-width="80px" style="padding: 12px 20px">
        <el-form-item label="审核结果">
          <el-select v-model="phaseReviewDialog.form.approvalStatus" placeholder="请选择审核结果" style="width: 100%">
            <el-option v-for="item in phaseReviewOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input v-model="phaseReviewDialog.form.comment" type="textarea" :rows="4" placeholder="请输入审核意见（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="phaseReviewDialog.visible = false">取消</el-button>
        <el-button type="primary" size="small" @click="submitPhaseReview">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import echarts from '@/utils/echarts.js'
import { ArrowRight, Delete, Tickets, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from '@/utils/element-plus'
import { usePaginationQuery } from '@/utils/paginationQuery.js'
import request from '@/utils/request.js'

const router = useRouter()
const route = useRoute()
const currentUser = JSON.parse(localStorage.getItem('xm-user') || '{}')
const userRole = currentUser.role

const typeNameMap = {
  school: '学校',
  laboratory: '实验室',
  base: '基地',
  team: '团队'
}

const hierarchyMap = {
  laboratory: '实验室',
  base: '基地',
  team: '团队'
}

const mockSchools = reactive([
  { id: 1, name: '示例大学', principal: '小明', principalPhone: '13900001111', address: '北路 3663 号' },
  { id: 2, name: '科技学院', principal: '小军', principalPhone: '13800002222', address: '大道 1001 号' },
  { id: 3, name: '综合大学', principal: '小红', principalPhone: '13700003333', address: '学院路 88 号' }
])

const mockLaboratories = reactive([
  { id: 101, schoolId: 1, username: 'lab_ai', laboratoryName: '智能实验室', laboratoryHierarchy: '实验室', directorName: '小明', directorPhone: '13611110001', supportUniversity: '示例大学', majorSupportingDiscipline: '计算机科学与技术', otherSupportingDiscipline: ['教育技术学', '统计学'], majorResearchDirection: '多模态智能评测', otherResearchDirection: ['大模型安全与对齐', '智能评测系统落地'], type: 2 },
  { id: 102, schoolId: 1, username: 'base_dh', laboratoryName: '数字基地', laboratoryHierarchy: '基地', directorName: '小青', directorPhone: '13611110002', supportUniversity: '示例大学', majorSupportingDiscipline: '中国语言文学', otherSupportingDiscipline: ['历史学', '信息资源管理'], majorResearchDirection: '知识图谱构建', otherResearchDirection: ['古籍文本挖掘', '文献数字化工具'], type: 1 },
  { id: 201, schoolId: 2, username: 'team_mat', laboratoryName: '先进团队', laboratoryHierarchy: '团队', directorName: '小芳', directorPhone: '13611110003', supportUniversity: '科技学院', majorSupportingDiscipline: '材料科学与工程', otherSupportingDiscipline: ['化学工程', '力学'], majorResearchDirection: '复合材料制备', otherResearchDirection: ['结构优化设计', '性能表征方法'], type: 2 },
  { id: 202, schoolId: 2, username: 'lab_env', laboratoryName: '生态实验室', laboratoryHierarchy: '实验室', directorName: '小强', directorPhone: '13611110004', supportUniversity: '科技学院', majorSupportingDiscipline: '环境科学与工程', otherSupportingDiscipline: ['地理学', '生态学'], majorResearchDirection: '碳循环监测', otherResearchDirection: ['生态修复评估', '监测系统集成'], type: 1 },
  { id: 301, schoolId: 3, username: 'base_pm', laboratoryName: '工程研究基地', laboratoryHierarchy: '基地', directorName: '小磊', directorPhone: '13611110005', supportUniversity: '综合大学', majorSupportingDiscipline: '管理科学与工程', otherSupportingDiscipline: ['土木工程', '计算机科学与技术'], majorResearchDirection: '项目风险预警', otherResearchDirection: ['工程治理数字化', '数据驱动决策'], type: 1 }
])

const mockProjects = reactive([
  { id: 1, schoolId: 1, laboratoryId: 101, name: '面向教育场景的多模态智能评测', code: 'P-2026-001', researchType: '应用研究', subjectCategory: '教育学', projectNature: '纵向课题', projectLevel: '省社科', projectStatus: '0', status: '待审核', teacherName: '刘洋', reason: '材料待补充', time: '2026-04-02 10:21', updateTime: '2026-04-02' },
  { id: 2, schoolId: 1, laboratoryId: 101, name: '大模型可解释性评估与安全对齐', code: 'P-2025-019', researchType: '基础研究', subjectCategory: '工学', projectNature: '纵向课题', projectLevel: '国自科', projectStatus: '0', status: '审核通过', teacherName: '陈璐', reason: '符合立项要求', time: '2026-03-18 09:40', updateTime: '2026-03-18' },
  { id: 3, schoolId: 1, laboratoryId: 102, name: '地方文献知识图谱构建与应用', code: 'P-2025-011', researchType: '开发研究', subjectCategory: '历史学', projectNature: '横向课题', projectLevel: '省社科', projectStatus: '1', status: '审核通过', teacherName: '孙悦', reason: '结项材料完整', time: '2026-01-12 15:06', updateTime: '2026-01-12' },
  { id: 4, schoolId: 2, laboratoryId: 201, name: '新型复合材料制备与性能优化', code: 'P-2026-006', researchType: '应用研究', subjectCategory: '工学', projectNature: '纵向课题', projectLevel: '省自科', projectStatus: '0', status: '审核通过', teacherName: '黄凯', reason: '符合立项要求', time: '2026-04-08 11:20', updateTime: '2026-04-08' },
  { id: 5, schoolId: 2, laboratoryId: 202, name: '城市生态系统碳循环监测', code: 'P-2024-033', researchType: '应用研究', subjectCategory: '理学', projectNature: '横向课题', projectLevel: '其他', projectStatus: '1', status: '审核通过', teacherName: '许倩', reason: '结项材料完整', time: '2025-12-20 14:00', updateTime: '2025-12-20' },
  { id: 6, schoolId: 3, laboratoryId: 301, name: '工程项目风险识别与预警模型', code: 'P-2026-010', researchType: '其他', subjectCategory: '管理学', projectNature: '纵向课题', projectLevel: '省社科', projectStatus: '2', status: '不通过', teacherName: '郑博', reason: '研究方案不清晰', time: '2026-02-28 16:33', updateTime: '2026-02-28' },
  { id: 7, schoolId: 1, laboratoryId: 101, name: '教育数据治理与质量评估', code: 'P-2025-099', researchType: '应用研究', subjectCategory: '管理学', projectNature: '纵向课题', projectLevel: '省社科', projectStatus: '0', status: '审核通过', teacherName: '刘洋', reason: '符合立项要求', time: '2025-11-18 09:28', updateTime: '2025-11-18' }
])

const mockAchievements = reactive([
  { id: 1, schoolId: 1, laboratoryId: 101, name: '多模态测评数据集（V1）', typeName: '数据库', description: '面向课堂互动的多模态测评数据', teacherName: '刘洋', projectId: 1, projectName: mockProjects[0].name, projectCode: mockProjects[0].code, evidence: 'https://example.com/file/evidence-1.pdf', status: '待审核', reason: '材料待补充', time: '2026-04-06 09:20', updateTime: '2026-04-06' },
  { id: 2, schoolId: 1, laboratoryId: 101, name: '大模型安全对齐技术报告', typeName: '咨政报告', description: '对齐策略与风险评估建议', teacherName: '陈璐', projectId: 2, projectName: mockProjects[1].name, projectCode: mockProjects[1].code, evidence: '', status: '审核通过', reason: '内容完整', time: '2026-03-25 13:55', updateTime: '2026-03-25' },
  { id: 3, schoolId: 1, laboratoryId: 102, name: '地方文献知识图谱原型系统', typeName: '软件著作权', description: '知识图谱原型系统与演示', teacherName: '孙悦', projectId: 3, projectName: mockProjects[2].name, projectCode: mockProjects[2].code, evidence: 'https://example.com/file/evidence-3.zip', status: '审核通过', reason: '证明材料齐全', time: '2026-01-20 10:08', updateTime: '2026-01-20' },
  { id: 4, schoolId: 2, laboratoryId: 201, name: '材料微观结构分析论文', typeName: '论文', description: '复合材料微观结构表征与分析', teacherName: '黄凯', projectId: 4, projectName: mockProjects[3].name, projectCode: mockProjects[3].code, evidence: '', status: '审核通过', reason: '符合要求', time: '2026-04-10 17:10', updateTime: '2026-04-10' },
  { id: 5, schoolId: 2, laboratoryId: 202, name: '生态碳循环监测平台', typeName: '平台', description: '碳循环监测数据平台原型', teacherName: '许倩', projectId: 5, projectName: mockProjects[4].name, projectCode: mockProjects[4].code, evidence: 'https://example.com/file/evidence-5.pdf', status: '待审核', reason: '待补充说明', time: '2026-03-03 08:45', updateTime: '2026-03-03' },
  { id: 6, schoolId: 1, laboratoryId: 102, name: '古籍语义检索工具包', typeName: '软件著作权', description: '面向古籍语料的语义检索工具', teacherName: '孙悦', projectId: 3, projectName: mockProjects[2].name, projectCode: mockProjects[2].code, evidence: '', status: '审核通过', reason: '符合要求', time: '2026-02-15 11:10', updateTime: '2026-02-15' },
  { id: 7, schoolId: 3, laboratoryId: 301, name: '工程风险评估指标集', typeName: '数据库', description: '工程风险多维评估指标数据', teacherName: '郑博', projectId: 6, projectName: mockProjects[5].name, projectCode: mockProjects[5].code, evidence: '', status: '审核通过', reason: '符合要求', time: '2025-12-11 10:20', updateTime: '2025-12-11' }
])

const mockPhaseReports = reactive([
  {
    id: 9001,
    schoolId: 1,
    laboratoryId: 101,
    basicInfo: {
      labName: '智能计算实验室',
      universityName: '华东示范大学',
      reportStartDate: '2026-01-01',
      reportEndDate: '2026-03-31',
      researchDirections: ['教育智能评测', '多模态理解', '模型安全']
    },
    reviewStatus: 'SUBMITTED',
    updatedAt: '2026-04-01'
  },
  {
    id: 9002,
    schoolId: 1,
    laboratoryId: 102,
    basicInfo: {
      labName: '数字人文研究基地',
      universityName: '华东示范大学',
      reportStartDate: '2025-10-01',
      reportEndDate: '2025-12-31',
      researchDirections: ['知识图谱', '文本挖掘', '数字人文']
    },
    reviewStatus: 'SUPER_APPROVED',
    updatedAt: '2026-01-08'
  },
  {
    id: 9101,
    schoolId: 2,
    laboratoryId: 201,
    basicInfo: {
      labName: '先进材料团队',
      universityName: '南方科技学院',
      reportStartDate: '2026-01-01',
      reportEndDate: '2026-03-31',
      researchDirections: ['复合材料', '结构优化', '性能表征']
    },
    reviewStatus: 'SCHOOL_REJECTED',
    updatedAt: '2026-04-03'
  }
])

mockSchools.splice(0, mockSchools.length)
mockLaboratories.splice(0, mockLaboratories.length)
mockProjects.splice(0, mockProjects.length)
mockAchievements.splice(0, mockAchievements.length)
mockPhaseReports.splice(0, mockPhaseReports.length)

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const defaultDateRange = () => {
  const end = new Date()
  const start = new Date(end)
  start.setFullYear(start.getFullYear() - 1)
  return [formatDate(start), formatDate(end)]
}

const query = reactive({
  type: 'school',
  schoolId: null,
  laboratoryId: null,
  dateRange: defaultDateRange()
})

const profileTabs = ['overview', 'project', 'achievement', 'phaseReport']
const routeTab = String(route.query.tab || '')
const activeTab = ref(profileTabs.includes(routeTab) ? routeTab : 'overview')

const filters = reactive({
  project: { keyword: '', status: '', projectStatus: '' },
  achievement: { keyword: '', status: '', typeName: '' },
  phaseReport: { keyword: '', reviewStatus: '' }
})

const projectPager = reactive({ pageNum: 1, pageSize: 10 })
const achievementPager = reactive({ pageNum: 1, pageSize: 10 })
const phaseReportPager = reactive({ pageNum: 1, pageSize: 10 })

usePaginationQuery(projectPager, { pageKey: 'projectPage', pageSizeKey: null })
usePaginationQuery(achievementPager, { pageKey: 'achievementPage', pageSizeKey: null })
usePaginationQuery(phaseReportPager, { pageKey: 'phaseReportPage', pageSizeKey: null })

const trendChartEl = ref(null)
const statusChartEl = ref(null)
const subjectChartEl = ref(null)
let trendChart = null
let statusChart = null
let subjectChart = null

const phaseDialog = reactive({ visible: false, data: null })
const projectDialog = reactive({ visible: false, data: null })
const achievementDialog = reactive({ visible: false, data: null })
const projectReviewDialog = reactive({ visible: false, form: { id: null, status: '通过', reason: '' } })
const achievementReviewDialog = reactive({ visible: false, form: { id: null, status: '通过', reason: '' } })
const phaseReviewDialog = reactive({ visible: false, form: { id: null, approvalStatus: null, comment: '' } })
const phaseSelection = reactive({ ids: [] })

const typeLabel = computed(() => typeNameMap[query.type] || '实体')

const setList = (target, list) => {
  target.splice(0, target.length, ...(Array.isArray(list) ? list : []))
}

let profileRequestSeq = 0
let applyingProfilePayload = false
let profileReady = false
let profileLoadTimer = null

const currentProfileParams = () => {
  const params = { type: query.type }
  const id = query.type === 'school' ? query.schoolId : query.laboratoryId
  if (id) params.id = id
  return params
}

const loadProfileData = async () => {
  const seq = ++profileRequestSeq
  const res = await request.get('/entityProfile/data', { params: currentProfileParams() })
  if (seq !== profileRequestSeq) return
  if (res.code !== '200') {
    ElMessage.error(res.msg || '画像数据加载失败')
    return
  }
  const payload = res.data || {}
  applyingProfilePayload = true
  setList(mockSchools, payload.schools)
  setList(mockLaboratories, payload.laboratories)
  if (['school', 'laboratory', 'base', 'team'].includes(payload.selectedType)) {
    query.type = payload.selectedType
  }
  query.schoolId = payload.selectedSchoolId || null
  query.laboratoryId = payload.selectedLaboratoryId || null
  ensureTypeSelection()
  setList(mockProjects, payload.projects)
  setList(mockAchievements, payload.achievements)
  setList(mockPhaseReports, payload.phaseReports)
  await nextTick()
  applyingProfilePayload = false
  renderCharts()
}

const currentTypeLaboratories = computed(() => {
  const targetHierarchy = hierarchyMap[query.type]
  if (!targetHierarchy) return []
  return mockLaboratories.filter(l => l.laboratoryHierarchy === targetHierarchy)
})

const ensureTypeSelection = () => {
  if (query.type === 'school') {
    if (!mockSchools.length || !mockSchools.some(s => s.id === query.schoolId)) {
      query.schoolId = null
    }
    return
  }
  const options = currentTypeLaboratories.value
  if (!options.length || !options.some(l => l.id === query.laboratoryId)) {
    query.laboratoryId = null
  }
}

const currentLaboratory = computed(() => {
  if (query.type === 'school') return null
  return mockLaboratories.find(l => l.id === query.laboratoryId) || null
})

const currentSchool = computed(() => {
  if (query.type === 'school') return mockSchools.find(s => s.id === query.schoolId) || null
  const lab = currentLaboratory.value
  return mockSchools.find(s => s.id === lab?.schoolId) || null
})

const headerTitle = computed(() => {
  if (query.type === 'school') return currentSchool.value ? currentSchool.value.name : '学校'
  return currentLaboratory.value ? currentLaboratory.value.laboratoryName : typeLabel.value
})

const entityDetailItems = computed(() => {
  if (query.type === 'school') {
    const school = currentSchool.value
    if (!school) return []
    const schoolLabs = mockLaboratories.filter(l => l.schoolId === school.id)
    return [
      { label: '学校名称', value: school.name, span: 2 },
      { label: '负责人', value: school.principal, span: 2 },
      { label: '负责人联系方式', value: school.principalPhone, span: 2 },
      { label: '实验室数量', value: schoolLabs.filter(l => l.laboratoryHierarchy === '实验室').length, span: 2 },
      { label: '基地数量', value: schoolLabs.filter(l => l.laboratoryHierarchy === '基地').length, span: 2 },
      { label: '团队数量', value: schoolLabs.filter(l => l.laboratoryHierarchy === '团队').length, span: 2 }
    ]
  }

  const lab = currentLaboratory.value
  if (!lab) return []
  return [
    { label: '组织名称', value: lab.laboratoryName, span: 2 },
    { label: '负责人', value: lab.directorName, span: 2 },
    { label: '负责人联系方式', value: lab.directorPhone, span: 2 },
    { label: '依托高校', value: lab.supportUniversity || currentSchool.value?.name, span: 2 },
    { label: '主要依托学科', value: lab.majorSupportingDiscipline, span: 2 },
    { label: '主要研究方向', value: lab.majorResearchDirection, span: 2 },
    { label: '其他依托学科', value: lab.otherSupportingDiscipline, span: 2 },
    { label: '其他研究方向', value: lab.otherResearchDirection, span: 2 }
  ]
})

const withinRange = (dateStr) => {
  if (!dateStr) return true
  const [start, end] = query.dateRange || []
  if (!start || !end) return true
  return dateStr >= start && dateStr <= end
}

const baseFilter = (item) => {
  return withinRange(item.updateTime || item.updatedAt)
}

const filteredProjects = computed(() => {
  const kw = (filters.project.keyword || '').trim()
  return mockProjects.filter(p => {
    if (!baseFilter(p)) return false
    if (filters.project.status && p.status !== filters.project.status) return false
    if (filters.project.projectStatus && p.projectStatus !== filters.project.projectStatus) return false
    if (!kw) return true
    return (p.name && p.name.includes(kw)) || (p.code && p.code.includes(kw))
  })
})

const filteredAchievements = computed(() => {
  const kw = (filters.achievement.keyword || '').trim()
  return mockAchievements.filter(a => {
    if (!baseFilter(a)) return false
    if (filters.achievement.status && a.status !== filters.achievement.status) return false
    if (filters.achievement.typeName && a.typeName !== filters.achievement.typeName) return false
    if (!kw) return true
    return (a.name && a.name.includes(kw)) || (a.projectName && a.projectName.includes(kw))
  })
})

const filteredPhaseReports = computed(() => {
  const kw = (filters.phaseReport.keyword || '').trim()
  return mockPhaseReports.filter(r => {
    if (!baseFilter(r)) return false
    if (filters.phaseReport.reviewStatus && r.reviewStatus !== filters.phaseReport.reviewStatus) return false
    if (!kw) return true
    const labName = r.basicInfo?.labName || ''
    return String(r.id).includes(kw) || labName.includes(kw)
  })
})

const achievementTypes = computed(() => Array.from(new Set(mockAchievements.map(a => a.typeName))).filter(Boolean))

const paginate = (list, pageNum, pageSize) => {
  const start = (pageNum - 1) * pageSize
  return list.slice(start, start + pageSize)
}

const pagedProjects = computed(() => paginate(filteredProjects.value, projectPager.pageNum, projectPager.pageSize))
const pagedAchievements = computed(() => paginate(filteredAchievements.value, achievementPager.pageNum, achievementPager.pageSize))
const pagedPhaseReports = computed(() => paginate(filteredPhaseReports.value, phaseReportPager.pageNum, phaseReportPager.pageSize))

const kpis = computed(() => {
  const project = filteredProjects.value
  const achievement = filteredAchievements.value
  const phaseReport = filteredPhaseReports.value
  return {
    project: {
      total: project.length,
      pending: project.filter(p => p.status === '待审核').length,
      approved: project.filter(p => p.status === '审核通过').length
    },
    achievement: {
      total: achievement.length,
      pending: achievement.filter(a => a.status === '待审核').length,
      approved: achievement.filter(a => a.status === '审核通过').length
    },
    phaseReport: {
      total: phaseReport.length,
      pending: phaseReport.filter(r => ['SUBMITTED', 'SCHOOL_APPROVED'].includes(r.reviewStatus)).length,
      approved: phaseReport.filter(r => ['SUPER_APPROVED'].includes(r.reviewStatus)).length
    }
  }
})

const todos = computed(() => {
  const items = []
  const pPending = filteredProjects.value.filter(p => p.status === '待审核').length
  if (pPending) items.push({ key: 'pPending', title: '待审核科研项目', count: pPending, tagText: '项目', tagType: 'primary', jump: { tab: 'project', patch: () => { filters.project.status = '待审核' } } })
  const aPending = filteredAchievements.value.filter(a => a.status === '待审核').length
  if (aPending) items.push({ key: 'aPending', title: '待审核科研成果', count: aPending, tagText: '成果', tagType: 'success', jump: { tab: 'achievement', patch: () => { filters.achievement.status = '待审核' } } })
  const phasePending = filteredPhaseReports.value.filter(r => ['SUBMITTED', 'SCHOOL_APPROVED'].includes(r.reviewStatus)).length
  if (phasePending) items.push({ key: 'phasePending', title: '待审核阶段报告', count: phasePending, tagText: '阶段', tagType: 'warning', jump: { tab: 'phaseReport', patch: () => { filters.phaseReport.reviewStatus = 'SUBMITTED' } } })
  return items
})

const isWithinRecentTwoMonths = (dateStr) => {
  if (!dateStr) return false
  const d = new Date(String(dateStr).slice(0, 10))
  if (Number.isNaN(d.getTime())) return false
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return d >= start && d <= now
}

const recentList = computed(() => {
  const items = []
  filteredProjects.value.forEach(p => {
    if (!isWithinRecentTwoMonths(p.updateTime)) return
    items.push({ key: `p-${p.id}`, time: p.updateTime, title: `项目更新：${p.name}`, tagText: '项目', tagType: 'primary', jump: { tab: 'project', patch: () => { filters.project.keyword = p.code } } })
  })
  filteredAchievements.value.forEach(a => {
    if (!isWithinRecentTwoMonths(a.updateTime)) return
    items.push({ key: `a-${a.id}`, time: a.updateTime, title: `成果更新：${a.name}`, tagText: '成果', tagType: 'success', jump: { tab: 'achievement', patch: () => { filters.achievement.keyword = a.name } } })
  })
  filteredPhaseReports.value.forEach(r => {
    if (!isWithinRecentTwoMonths(r.updatedAt)) return
    items.push({ key: `r-${r.id}`, time: r.updatedAt, title: `阶段报告更新：${r.basicInfo.labName}`, tagText: '阶段', tagType: 'warning', jump: { tab: 'phaseReport', patch: () => { filters.phaseReport.keyword = String(r.id) } } })
  })
  items.sort((a, b) => String(b.time).localeCompare(String(a.time)))
  return items.slice(0, 8)
})

const indexMethod = (pageNum, pageSize) => (index) => (pageNum - 1) * pageSize + index + 1

const displayValue = (value) => {
  if (value === undefined || value === null || value === '') return '暂无数据'
  return value
}

const projectStatusText = (status) => {
  const map = { 0: '在研', 1: '结项', 2: '未开始' }
  return map[status] || displayValue(status)
}

const approvalStatusText = (status) => {
  return status === '待审核' ? '待实验室审核' : displayValue(status)
}

const isLaboratoryReviewRole = (role) => {
  return role === 'KEY_LABORATORY' || role === 'NORMAL_LABORATORY'
}

const canReviewProjectOrAchievement = (status) => {
  if (isLaboratoryReviewRole(userRole) && status === '待审核') return true
  if (userRole === 'SCHOOL_ADMIN' && status === '实验室审核通过') return true
  if ((userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') && status === '校审通过') return true
  return false
}

const phaseStatusText = (status) => {
  const map = { SUBMITTED: '已提交', SCHOOL_APPROVED: '校审通过', SCHOOL_REJECTED: '校审驳回', SUPER_APPROVED: '审核通过', SUPER_REJECTED: '审核未通过' }
  return map[status] || '未知状态'
}

const phaseStatusTag = (status) => {
  const map = { SUBMITTED: 'warning', SCHOOL_APPROVED: 'primary', SCHOOL_REJECTED: 'danger', SUPER_APPROVED: 'success', SUPER_REJECTED: 'danger' }
  return map[status] || 'info'
}

const phaseReviewOptions = computed(() => {
  if (userRole === 'SCHOOL_ADMIN') {
    return [
      { label: '校审通过', value: 'SCHOOL_APPROVED' },
      { label: '校审驳回', value: 'SCHOOL_REJECTED' }
    ]
  }
  if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
    return [
      { label: '审核通过', value: 'SUPER_APPROVED' },
      { label: '审核未通过', value: 'SUPER_REJECTED' }
    ]
  }
  return []
})

const canReviewPhaseReport = (row) => {
  const status = row?.reviewStatus
  if (userRole === 'SCHOOL_ADMIN') return status === 'SUBMITTED' || status === 1
  if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') return status === 'SCHOOL_APPROVED' || status === 'SUBMITTED' || status === 1
  return false
}

const openPhaseReport = async (row) => {
  const res = await request.get(`/lab_phase_report/select/${row.id}`)
  if (res.code === '200' && res.data) {
    phaseDialog.data = { ...row, ...res.data, basicInfo: { ...(row.basicInfo || {}), ...(res.data.basicInfo || {}) } }
  } else {
    phaseDialog.data = row
    ElMessage.error(res.msg || '获取详情失败')
  }
  phaseDialog.visible = true
}

const handlePhaseSelectionChange = (rows) => {
  phaseSelection.ids = (rows || []).map(r => r.id)
}

const handlePhaseBatchDelete = () => {
  if (!phaseSelection.ids.length) {
    ElMessage.warning('请选择数据')
    return
  }
  ElMessageBox.confirm('确认删除选中的阶段报告吗？', '提示', { type: 'warning' }).then(() => {
    request.delete('/lab_phase_report/delete/batch', { data: phaseSelection.ids }).then(async res => {
      if (res.code === '200') {
        ElMessage.success('批量删除成功')
        phaseSelection.ids = []
        await loadProfileData()
      } else {
        ElMessage.error(res.msg || '批量删除失败')
      }
    })
  }).catch(() => {})
}

const handlePhaseCheck = (row) => {
  phaseReviewDialog.form = { id: row.id, approvalStatus: null, comment: '' }
  phaseReviewDialog.visible = true
}

const submitPhaseReview = async () => {
  if (!phaseReviewDialog.form.approvalStatus) {
    ElMessage.warning('请选择审核结果')
    return
  }
  const { id, approvalStatus, comment } = phaseReviewDialog.form
  const res = await request.put(`/lab_phase_report/review/${id}`, null, {
    params: { approvalStatus, comment: comment || '' }
  })
  if (res.code === '200') {
    ElMessage.success('审核成功')
    phaseReviewDialog.visible = false
    await loadProfileData()
  } else {
    ElMessage.error(res.msg || '审核失败')
  }
}

const handlePhaseDelete = (row) => {
  ElMessageBox.confirm('确认删除该报告吗？', '提示', { type: 'warning' }).then(() => {
    request.delete(`/lab_phase_report/delete/${row.id}`).then(async res => {
      if (res.code === '200') {
        ElMessage.success('删除成功')
        await loadProfileData()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    })
  }).catch(() => {})
}

const handleProjectView = async (row) => {
  const res = await request.get(`/project/selectById/${row.id}`)
  projectDialog.data = res.code === '200' && res.data ? { ...row, ...res.data } : row
  if (res.code !== '200') ElMessage.error(res.msg || '获取详情失败')
  projectDialog.visible = true
}

const handleProjectCheck = (row) => {
  projectReviewDialog.form = { id: row.id, status: '通过', reason: '' }
  projectReviewDialog.visible = true
}

const submitProjectReview = async () => {
  if (projectReviewDialog.form.status === '驳回' && !String(projectReviewDialog.form.reason || '').trim()) {
    ElMessage.warning('请输入驳回理由')
    return
  }
  const res = await request.put('/project/check', projectReviewDialog.form)
  if (res.code === '200') {
    ElMessage.success('操作成功')
    projectReviewDialog.visible = false
    await loadProfileData()
  } else {
    ElMessage.error(res.msg || '操作失败')
  }
}

const handleProjectDelete = (row) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(() => {
    request.delete(`/project/delete/${row.id}`).then(async res => {
      if (res.code === '200') {
        ElMessage.success('删除成功')
        await loadProfileData()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    })
  }).catch(() => {})
}

const handleDownloadEvidence = (row) => {
  if (!row?.evidence) return
  window.open(row.evidence, '_blank')
}

const handleAchievementCheck = (row) => {
  achievementReviewDialog.form = { id: row.id, status: '通过', reason: '' }
  achievementReviewDialog.visible = true
}

const submitAchievementReview = async () => {
  if (achievementReviewDialog.form.status === '驳回' && !String(achievementReviewDialog.form.reason || '').trim()) {
    ElMessage.warning('请输入驳回理由')
    return
  }
  const res = await request.put('/achievement/check', achievementReviewDialog.form)
  if (res.code === '200') {
    ElMessage.success('操作成功')
    achievementReviewDialog.visible = false
    await loadProfileData()
  } else {
    ElMessage.error(res.msg || '操作失败')
  }
}

const handleAchievementDelete = (row) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(() => {
    request.delete(`/achievement/delete/${row.id}`).then(async res => {
      if (res.code === '200') {
        ElMessage.success('删除成功')
        await loadProfileData()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    })
  }).catch(() => {})
}

const handleAchievementView = async (row) => {
  const res = await request.get(`/achievement/selectById/${row.id}`)
  achievementDialog.data = res.code === '200' && res.data ? { ...row, ...res.data } : row
  if (res.code !== '200') ElMessage.error(res.msg || '获取详情失败')
  achievementDialog.visible = true
}

const jumpTo = (payload) => {
  const jump = payload?.jump ? payload.jump : payload
  if (!jump) return
  activeTab.value = jump.tab
  nextTick(() => {
    if (typeof jump.patch === 'function') jump.patch()
  })
}

const applyRouteQuery = (shouldEnsure = true) => {
  const type = String(route.query.type || '')
  const id = Number(route.query.id)
  if (['school', 'laboratory', 'base', 'team'].includes(type)) query.type = type
  if (query.type === 'school') {
    if (Number.isFinite(id) && id > 0) query.schoolId = id
  } else if (Number.isFinite(id) && id > 0) {
    query.laboratoryId = id
  }
  if (shouldEnsure) ensureTypeSelection()
}

const getScrollSnapshot = () => {
  const contentArea = document.querySelector('.content-area')
  const mainRight = document.querySelector('.manager-main-right')
  return {
    windowX: window.scrollX,
    windowY: window.scrollY,
    contentTop: contentArea?.scrollTop || 0,
    mainTop: mainRight?.scrollTop || 0
  }
}

const restoreScrollSnapshot = (snapshot) => {
  if (!snapshot) return
  nextTick(() => {
    requestAnimationFrame(() => {
      const contentArea = document.querySelector('.content-area')
      const mainRight = document.querySelector('.manager-main-right')
      if (contentArea) contentArea.scrollTop = snapshot.contentTop
      if (mainRight) mainRight.scrollTop = snapshot.mainTop
      window.scrollTo(snapshot.windowX, snapshot.windowY)
    })
  })
}

const syncToRoute = async () => {
  const scrollSnapshot = getScrollSnapshot()
  const q = query.type === 'school' ? { type: 'school', id: query.schoolId || '' } : { type: query.type, id: query.laboratoryId || '' }
  q.tab = activeTab.value
  q.projectPage = projectPager.pageNum
  q.achievementPage = achievementPager.pageNum
  q.phaseReportPage = phaseReportPager.pageNum
  await router.replace({ path: '/manager/entityProfile', query: q })
  restoreScrollSnapshot(scrollSnapshot)
}

const resetPagers = () => {
  projectPager.pageNum = 1
  achievementPager.pageNum = 1
  phaseReportPager.pageNum = 1
}

const scheduleProfileLoad = () => {
  if (!profileReady) return
  if (applyingProfilePayload) return
  if (profileLoadTimer) clearTimeout(profileLoadTimer)
  profileLoadTimer = setTimeout(async () => {
    profileLoadTimer = null
    resetPagers()
    await loadProfileData()
    syncToRoute()
  }, 0)
}

const reset = () => {
  query.type = 'school'
  query.schoolId = null
  query.laboratoryId = null
  query.dateRange = defaultDateRange()
  ensureTypeSelection()

  filters.project.keyword = ''
  filters.project.status = ''
  filters.project.projectStatus = ''
  filters.achievement.keyword = ''
  filters.achievement.status = ''
  filters.achievement.typeName = ''
  filters.phaseReport.keyword = ''
  filters.phaseReport.reviewStatus = ''
  activeTab.value = 'overview'
  resetPagers()
  scheduleProfileLoad()
}

const refresh = async () => {
  await loadProfileData()
  syncToRoute()
}

const onTabChange = () => {
  syncToRoute()
  nextTick(() => renderCharts())
}

const getLast6Months = () => {
  const now = new Date()
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const m = String(d.getMonth() + 1).padStart(2, '0')
    months.push(`${d.getFullYear()}-${m}`)
  }
  return months
}

const countByMonth = (list, dateKey) => {
  const months = getLast6Months()
  const map = new Map(months.map(m => [m, 0]))
  list.forEach(x => {
    const d = x[dateKey]
    if (!d) return
    const month = String(d).slice(0, 7)
    if (map.has(month)) map.set(month, map.get(month) + 1)
  })
  return months.map(m => map.get(m))
}

const buildGrowth = (values) => values.map((value, index) => index === 0 ? 0 : value - values[index - 1])

const buildSubjectData = () => {
  const subjects = {}
  filteredProjects.value.forEach(p => {
    const k = p.subjectCategory || '其他'
    subjects[k] = (subjects[k] || 0) + 1
  })
  return Object.entries(subjects).map(([name, value]) => ({ name, value }))
}

const buildProjectStatusData = () => {
  const inProgress = filteredProjects.value.filter(p => p.projectStatus === '0').length
  const completed = filteredProjects.value.filter(p => p.projectStatus === '1').length
  return [
    { name: '在研', value: inProgress },
    { name: '结项', value: completed }
  ]
}

const renderCharts = () => {
  if (trendChartEl.value) {
    if (!trendChart) trendChart = echarts.init(trendChartEl.value)
    const monthKeys = getLast6Months()
    const months = monthKeys.map(m => `${Number(m.slice(5, 7))}月`)
    const projectMonthly = countByMonth(filteredProjects.value, 'updateTime')
    const achievementMonthly = countByMonth(filteredAchievements.value, 'updateTime')
    const projectGrowth = buildGrowth(projectMonthly)
    const achievementGrowth = buildGrowth(achievementMonthly)
    trendChart.setOption({
      color: ['#5470c6', '#91cc75', '#ee6666', '#73c0de'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: { color: '#999' }
        }
      },
      toolbox: {
        feature: {
          dataView: { show: true, readOnly: true },
          magicType: { show: true, type: ['line', 'bar'] },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      legend: { data: ['项目', '成果', '项目增长', '成果增长'] },
      xAxis: [
        {
          type: 'category',
          data: months,
          axisPointer: { type: 'shadow' }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '项目/成果',
          min: 0,
          axisLabel: { formatter: '{value}' }
        },
        {
          type: 'value',
          name: '增长',
          min: 'dataMin',
          max: 'dataMax',
          axisLabel: { formatter: '{value}' }
        }
      ],
      series: [
        {
          name: '项目',
          type: 'bar',
          barMaxWidth: 22,
          barGap: '30%',
          tooltip: { valueFormatter: value => `${value} 个` },
          data: projectMonthly
        },
        {
          name: '成果',
          type: 'bar',
          barMaxWidth: 22,
          barGap: '30%',
          tooltip: { valueFormatter: value => `${value} 个` },
          data: achievementMonthly
        },
        {
          name: '项目增长',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          symbolSize: 7,
          tooltip: { valueFormatter: value => `${value} 个` },
          data: projectGrowth
        },
        {
          name: '成果增长',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          symbolSize: 7,
          lineStyle: { type: 'dashed' },
          tooltip: { valueFormatter: value => `${value} 个` },
          data: achievementGrowth
        }
      ]
    })
  }
  if (statusChartEl.value) {
    if (!statusChart) statusChart = echarts.init(statusChartEl.value)
    statusChart.setOption({
      color: ['#ff9f7f', '#f6bd16'],
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, left: 'center' },
      series: [
        {
          type: 'pie',
          radius: '55%',
          center: ['50%', '50%'],
          data: buildProjectStatusData(),
          label: { formatter: '{b}' }
        }
      ]
    })
  }
  if (subjectChartEl.value) {
    if (!subjectChart) subjectChart = echarts.init(subjectChartEl.value)
    subjectChart.setOption({
      color: ['#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#fac858'],
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, left: 'center' },
      series: [
        {
          type: 'pie',
          radius: ['20%', '55%'],
          center: ['50%', '50%'],
          data: buildSubjectData(),
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          label: { formatter: '{b}' }
        }
      ]
    })
  }
}

watch(
  () => query.type,
  () => {
    if (applyingProfilePayload) return
    ensureTypeSelection()
  }
)

watch(
  () => [query.type, query.schoolId, query.laboratoryId],
  () => {
    scheduleProfileLoad()
  }
)

watch(
  () => query.dateRange,
  () => {
    resetPagers()
    syncToRoute()
    nextTick(() => renderCharts())
  },
  { deep: true }
)

watch(
  () => [filters.project, filters.achievement, filters.phaseReport],
  () => resetPagers(),
  { deep: true }
)

onMounted(async () => {
  applyRouteQuery(false)
  await loadProfileData()
  profileReady = true
  syncToRoute()
})

onUnmounted(() => {
  if (profileLoadTimer) {
    clearTimeout(profileLoadTimer)
    profileLoadTimer = null
  }
  if (trendChart) {
    trendChart.dispose()
    trendChart = null
  }
  if (statusChart) {
    statusChart.dispose()
    statusChart = null
  }
  if (subjectChart) {
    subjectChart.dispose()
    subjectChart = null
  }
})
</script>

<style scoped>
.kpi-card {
  width: auto;
  min-width: 0;
  padding: 14px 16px;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 8px;
}

.kpi-title {
  color: #606266;
  font-size: 13px;
}

.kpi-value {
  font-size: 24px;
  font-weight: 700;
  margin-top: 8px;
  color: #303133;
}

.kpi-sub {
  margin-top: 10px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.desc-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.entity-detail-descriptions {
  width: 100%;
}

.entity-detail-descriptions :deep(.el-descriptions__table) {
  table-layout: fixed;
  width: 100%;
}

.entity-detail-descriptions :deep(.el-descriptions__cell) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entity-detail-descriptions :deep(.el-descriptions__label) {
  width: 18%;
  min-width: 0;
}

.entity-detail-descriptions :deep(.el-descriptions__content) {
  width: 15.3333%;
  min-width: 0;
}

.entity-detail-descriptions :deep(.desc-list) {
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.el-descriptions--border .el-descriptions__label) {
  background: #f5f7fa;
  color: #606266;
  font-weight: 500;
}

:deep(.el-descriptions__content) {
  color: #303133;
}

.chart-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 8px;
}

.chart-span-2 {
  grid-column: span 2;
}

@media (max-width: 1280px) {
  .kpi-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .chart-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .chart-span-2 {
    grid-column: span 2;
  }
}
</style>
