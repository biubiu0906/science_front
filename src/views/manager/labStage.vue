<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
        <el-input v-model="searchId" :prefix-icon="Search" style="width: 240px; margin-right: 10px" placeholder="请输入编号查询"></el-input>
        <el-button type="info" plain size="small" @click="searchReport">查询</el-button>
        <el-button type="warning" plain size="small" style="margin: 0 10px" @click="resetSearch">重置</el-button>
      </div>
    <div class="card">
      <div class="header-actions">
        <el-button type="danger" @click="delBatch" size="small" plain>批量删除</el-button>
      </div>
      
      <!-- 报告列表 -->
      <div style="margin-top: 15px">
        <el-table :data="reportList" stripe style="width: 100%" @selection-change="handleSelectionChange" :header-cell-style="{ backgroundColor: '#e9edf2' }" class="table-center" empty-text="暂无数据">
          <el-table-column type="selection" width="35" />
          <el-table-column prop="id" label="编号" min-width="105" sortable/>
          <el-table-column prop="basicInfo.labName" label="所属实验室" min-width="120" sortable/>
          <el-table-column prop="basicInfo.reportStartDate" label="报告起始时间" width="135" sortable/>
          <el-table-column prop="basicInfo.reportEndDate" label="报告结束时间" width="135" sortable/>
          <el-table-column prop="updatedAt" label="更新时间" min-width="120" sortable/>
          <el-table-column label="操作" min-width="150">
            <template #default="scope">
              <el-tooltip content="查看详情" placement="bottom" effect="light">
                <el-button @click="viewReport(scope.row)" size="small">查看</el-button>
              </el-tooltip>
              <el-tooltip content="驳回报告" placement="bottom" effect="light" v-if="scope.row.reviewStatus === 1">
                <el-button @click="rejectReport(scope.row)" size="small" type="primary">驳回</el-button>
              </el-tooltip>
              <el-tooltip content="删除报告" placement="bottom" effect="light">
                <el-button @click="deleteReport(scope.row)" size="small" type="danger">删除</el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 查看实验室阶段性报告弹窗 -->
    <el-dialog
      title="查看实验室阶段报告"
      v-model="dialogVisible"
      width="70%"
      top="5vh"
      destroy-on-close
    >
      <el-form :model="form" label-width="auto">
        
        <!-- 第一大类：建设基本情况表 -->
        <div class="main-title">一、建设基本情况表</div>

        <!-- 基本情况 -->
        <div class="section-title">基本情况</div>
        <el-descriptions border :column="4" class="custom-descriptions">
          <el-descriptions-item label="报告起始时间" :span="2">
            <div>{{ displayValue(form.basicInfo.reportStartDate) }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="报告结束时间" :span="2">
            <div>{{ displayValue(form.basicInfo.reportEndDate) }}</div>
          </el-descriptions-item>

          <el-descriptions-item label="实验室名称" :span="2">
            <div>{{ displayValue(form.basicInfo.labName) }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="实验室类别" :span="2">
            <div>{{ displayValue(form.basicInfo.labCategory) }}</div>
          </el-descriptions-item>
          
          <el-descriptions-item label="实验室主任" :span="2">
            <div>{{ displayValue(form.basicInfo.directorName) }}</div>
          </el-descriptions-item>
          
          <el-descriptions-item label="依托学校" :span="2">
            <div>{{ displayValue(form.basicInfo.universityName) }}</div>
          </el-descriptions-item>

          <el-descriptions-item label="成立时间" :span="2">
            <div>{{ displayValue(form.basicInfo.foundingDate) }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="是否实体" :span="2">
             <div>{{ form.basicInfo.isEntity === 1 ? '是' : (form.basicInfo.isEntity === 0 ? '否' : '暂无数据') }}</div>
          </el-descriptions-item>

          <el-descriptions-item label="总面积(平方米)" :span="2">
            <div>{{ displayValue(form.basicInfo.areaTotal) }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="其中实验面积(平方米)" :span="2">
            <div>{{ displayValue(form.basicInfo.areaExperimental) }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="主要依托学科" :span="2">
            <div>{{ displayValue(form.basicInfo.majorDiscipline) }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="其他依托学科" :span="2">
            <div>{{ displayValue(form.basicInfo.otherDisciplines) }}</div>
          </el-descriptions-item>

          <el-descriptions-item label="研究方向" :span="4">
            <div>
              <div v-if="!form.basicInfo.researchDirections || form.basicInfo.researchDirections.length === 0 || (form.basicInfo.researchDirections.length === 1 && !form.basicInfo.researchDirections[0])">暂无数据</div>
              <div v-else v-for="(item, index) in form.basicInfo.researchDirections" :key="index" style="margin-bottom: 5px;">
                {{ index + 1 }}. {{ item }}
              </div>
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 科学研究与贡献 -->
        <div class="section-title" style="margin-top: 20px;">科学研究与贡献</div>

        <div class="subsection-title">1.科研任务</div>
        <el-descriptions border :column="2" class="custom-descriptions">
           <el-descriptions-item label="项目到账总经费(万元)" :span="2">
            <div>{{ displayValue(form.funding.fundTotal) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="纵向经费(万元)">
            <div>{{ displayValue(form.funding.fundLongitudinal) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="横向经费(万元)">
            <div>{{ displayValue(form.funding.fundTransverse) }}</div>
           </el-descriptions-item>

           <el-descriptions-item label="国家社科基金重大重点项目(项)">
             <div>{{ displayValue(form.projects.projNssMajor) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="国家自科基金重大重点项目(项)">
             <div>{{ displayValue(form.projects.projNsfcMajor) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="国家社科基金一般项目(项)">
             <div>{{ displayValue(form.projects.projNssGeneral) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="国家自科基金面上项目(项)">
             <div>{{ displayValue(form.projects.projNsfcGeneral) }}</div>
           </el-descriptions-item>

           <el-descriptions-item label="教育部人文社科重大项目(项)">
             <div>{{ displayValue(form.projects.projMoeMajor) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="教育部人文社科一般项目(项)">
             <div>{{ displayValue(form.projects.projMoeGeneral) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="中央其他部门重大重点项目(项)">
             <div>{{ displayValue(form.projects.projCentralOther) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="省部级科研重大项目(项)">
             <div>{{ displayValue(form.projects.projProvincialMajor) }}</div>
           </el-descriptions-item>
        </el-descriptions>

        <div class="subsection-title">2.科研贡献与成果</div>
        <el-descriptions border :column="3" class="custom-descriptions">
           <el-descriptions-item label="提交咨政报告数(篇)">
             <div>{{ displayValue(form.outputs.adviceSubmitted) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="中央部门采纳(篇)">
             <div>{{ displayValue(form.outputs.adviceAdoptedCentral) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="省级部门采纳(篇)">
             <div>{{ displayValue(form.outputs.adviceAdoptedProvincial) }}</div>
           </el-descriptions-item>

           <el-descriptions-item label="发表高水平论文(篇)">
             <div>{{ displayValue(form.outputs.paperTotal) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="国内期刊(篇)">
             <div>{{ displayValue(form.outputs.paperDomestic) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="国际期刊(篇)">
             <div>{{ displayValue(form.outputs.paperIntl) }}</div>
           </el-descriptions-item>

           <el-descriptions-item label="出版著作(部)">
             <div>{{ displayValue(form.outputs.bookTotal) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="国内出版(部)">
             <div>{{ displayValue(form.outputs.bookDomestic) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="国外出版(部)">
             <div>{{ displayValue(form.outputs.bookIntl) }}</div>
           </el-descriptions-item>
        </el-descriptions>

        <div class="subsection-title">3.数据库建设与成果转化</div>
        <el-descriptions border :column="2" class="custom-descriptions">
           <el-descriptions-item label="自主开发数据库(个)">
             <div>{{ displayValue(form.dbSoftwareTransfer.dbSelfCount) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="采购数据库(个)">
             <div>{{ displayValue(form.dbSoftwareTransfer.dbBuyCount) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="其中：数据条目(条)">
             <div>{{ displayValue(form.dbSoftwareTransfer.dbSelfItems) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="其中：数据条目(条)">
             <div>{{ displayValue(form.dbSoftwareTransfer.dbBuyItems) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="其中：数据容量(TB)">
             <div>{{ displayValue(form.dbSoftwareTransfer.dbSelfCapacity) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="其中：数据容量(TB)">
             <div>{{ displayValue(form.dbSoftwareTransfer.dbBuyCapacity) }}</div>
           </el-descriptions-item>

           <el-descriptions-item label="自主开发应用软件(个)">
             <div>{{ displayValue(form.dbSoftwareTransfer.softSelfDev) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="购买应用软件(个)">
             <div>{{ displayValue(form.dbSoftwareTransfer.softPurchased) }}</div>
           </el-descriptions-item>

           <el-descriptions-item label="成果转化数(项)">
             <div>{{ displayValue(form.dbSoftwareTransfer.transferCount) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="转化总经费(万元)">
             <div>{{ displayValue(form.dbSoftwareTransfer.transferIncome) }}</div>
           </el-descriptions-item>
        </el-descriptions>

        <!-- 学生培养 -->
        <div class="section-title" style="margin-top: 20px;">学生培养</div>
        <el-descriptions border :column="2" class="custom-descriptions">
           <el-descriptions-item label="博士研究生毕业(人)">
             <div>{{ displayValue(form.talentAndCoop.phdGraduated) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="在读(人)">
             <div>{{ displayValue(form.talentAndCoop.phdEnrolled) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="硕士研究生毕业(人)">
             <div>{{ displayValue(form.talentAndCoop.masterGraduated) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="在读(人)">
             <div>{{ displayValue(form.talentAndCoop.masterEnrolled) }}</div>
           </el-descriptions-item>

           <el-descriptions-item label="承担本科课程(学时)">
             <div>{{ displayValue(form.talentAndCoop.courseUndergradHours) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="承担研究生课程(学时)">
             <div>{{ displayValue(form.talentAndCoop.courseGradHours) }}</div>
           </el-descriptions-item>
        </el-descriptions>

        <!-- 学术交流 -->
        <div class="section-title" style="margin-top: 20px;">学术交流</div>
        <el-descriptions border :column="2" class="custom-descriptions">
           <el-descriptions-item label="承办学术会议国内(次)">
             <div>{{ displayValue(form.talentAndCoop.confHostedDomestic) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="国际(次)">
             <div>{{ displayValue(form.talentAndCoop.confHostedIntl) }}</div>
           </el-descriptions-item>

           <el-descriptions-item label="国际合作计划(项)">
             <div>{{ displayValue(form.talentAndCoop.intlCoopProjects) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="国际合作经费(万元)">
             <div>{{ displayValue(form.talentAndCoop.intlCoopFund) }}</div>
           </el-descriptions-item>

           <el-descriptions-item label="国内外讲学/报告/调研-国内(人次)">
             <div>{{ displayValue(form.talentAndCoop.lectureOutDomestic) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="国外(人次)">
             <div>{{ displayValue(form.talentAndCoop.lectureOutAbroad) }}</div>
           </el-descriptions-item>

           <el-descriptions-item label="邀请专家讲学/报告/调研(人次)">
             <div>{{ displayValue(form.talentAndCoop.lectureIn) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="出国(境)访问/访学(人次)">
             <div>{{ displayValue(form.talentAndCoop.visitOut) }}</div>
           </el-descriptions-item>
        </el-descriptions>

        <!-- 管理机制 -->
        <div class="section-title" style="margin-top: 20px;">管理机制</div>
        <el-descriptions border :column="2" class="custom-descriptions">
           <el-descriptions-item label="学术委员会人数(人)">
             <div>{{ displayValue(form.managementEquipSupport.commAcademicMembers) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="共计召开会议(次)">
             <div>{{ displayValue(form.managementEquipSupport.commAcademicMeetings) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="管理委员会人数(人)">
             <div>{{ displayValue(form.managementEquipSupport.commManageMembers) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="共计召开会议(次)">
             <div>{{ displayValue(form.managementEquipSupport.commManageMeetings) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="出台校内制度文件(个)" :span="2">
             <div>{{ displayValue(form.managementEquipSupport.policyDocsIssued) }}</div>
           </el-descriptions-item>
        </el-descriptions>

        <!-- 实验设备 -->
        <div class="section-title" style="margin-top: 20px;">实验设备</div>
        <el-descriptions border :column="2" class="custom-descriptions">
           <el-descriptions-item label="主要实验设备(件)">
             <div>{{ displayValue(form.managementEquipSupport.equipMainCount) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="价值(万元)">
             <div>{{ displayValue(form.managementEquipSupport.equipMainValue) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="50万元以上设备(件)">
             <div>{{ displayValue(form.managementEquipSupport.equipLargeCount) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="价值(万元)">
             <div>{{ displayValue(form.managementEquipSupport.equipLargeValue) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="实验设备共享时间(小时)">
             <div>{{ displayValue(form.managementEquipSupport.equipSharedHours) }}</div>
           </el-descriptions-item>
        </el-descriptions>

        <!-- 经费保障 -->
        <div class="section-title" style="margin-top: 20px;">经费保障</div>
        <el-descriptions border :column="2" class="custom-descriptions">
           <el-descriptions-item label="依托单位经费投入(万元)">
             <div>{{ displayValue(form.managementEquipSupport.supportFundSchool) }}</div>
           </el-descriptions-item>
           <el-descriptions-item label="其他渠道经费投入(万元)" :span="2">
             <div>{{ displayValue(form.managementEquipSupport.supportFundOther) }}</div>
           </el-descriptions-item>
        </el-descriptions>

        <!-- 第二大类：阶段性进展情况报告 -->
        <div class="main-title" style="margin-top: 30px;">二、阶段性进展情况报告</div>
        
        <div class="report-question">
          <p>（一）对照《任务书》，介绍实验室立项以来的建设进展，主要包括在探索建构中国自主知识体系、学科交叉研究、研究方法与研究范式创新（包括数据库建设）、队伍建设与人才培养、实验室开放共享（包括开展国际学术交流与合作、向政府、行业和社会提供公共服务等）与运行管理、政策保障等方面的具体做法和取得的主要成效（限 3000 字）。</p>
          <div class="text-content">
            <div v-if="!form.textReport.progress || form.textReport.progress === ''">暂无数据</div>
            <div v-else v-html="form.textReport.progress" class="rich-text-content"></div>
          </div>
        </div>

        <div class="report-question">
          <p>（二）逐条列出代表性研究成果，包括成果名称、完成人、时间、成果形式等（不超过 10 项）。</p>
          <div class="text-content">
            <div v-if="!form.textReport.achievements || form.textReport.achievements === ''">暂无数据</div>
            <div v-else v-html="form.textReport.achievements" class="rich-text-content"></div>
          </div>
        </div>

        <div class="report-question">
          <p>（三）存在的问题及下一步建设思路。</p>
          <div class="text-content">
            <div v-if="!form.textReport.issuesPlans || form.textReport.issuesPlans === ''">暂无数据</div>
            <div v-else v-html="form.textReport.issuesPlans" class="rich-text-content"></div>
          </div>
        </div>

        <!-- 第三大类：相关材料提交 -->
        <div class="main-title" style="margin-top: 30px;">三、佐证材料</div>
        
        <div>
           <div v-if="fileList.length === 0">暂无佐证材料</div>
           <div v-else v-for="file in fileList" :key="file.name" class="file-item">
             <el-link :href="file.url" target="_blank" type="primary">{{ file.name }}</el-link>
           </div>
        </div>

      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关 闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from '@/utils/element-plus'
import { Delete, Search } from '@element-plus/icons-vue'
import request from '@/utils/request.js'

// 报告列表数据
const reportList = ref([])
const searchId = ref('')

// 获取报告列表
const loadReportList = () => {
  request.get('/lab_phase_report/list').then(res => {
    if (res.code === '200') {
      reportList.value = res.data
    } else {
      ElMessage.error(res.msg || '获取列表失败')
    }
  })
}

const searchReport = () => {
  if (!searchId.value) {
    ElMessage.warning('请输入申请编号')
    return
  }
  request.get(`/lab_phase_report/select/${searchId.value}`).then(res => {
    if (res.code === '200' && res.data) {
      reportList.value = [res.data]
    } else {
      ElMessage.warning('未找到相关报告')
      reportList.value = []
    }
  })
}

const resetSearch = () => {
  searchId.value = ''
  loadReportList()
}

// 页面加载时获取列表
onMounted(() => {
  loadReportList()
})

// 控制弹窗显示
const dialogVisible = ref(false)

const data = reactive({
  ids: []
})

// 用于显示的文件列表
const fileList = ref([])

// 表单数据初始化
const initForm = () => ({
  id: null,
  basicInfo: {
    labName: null,
    labCategory: null,
    directorName: null,
    majorDiscipline: null,
    universityName: null,
    reportStartDate: null,
    reportEndDate: null,
    foundingDate: null,
    isEntity: null,
    areaTotal: null,
    areaExperimental: null,
    otherDisciplines: null,
    researchDirections: [''] // 初始一个空的研究方向
  },
  funding: {
    fundTotal: null,
    fundLongitudinal: null,
    fundTransverse: null
  },
  projects: {
    projNssMajor: null,
    projNsfcMajor: null,
    projNssGeneral: null,
    projNsfcGeneral: null,
    projMoeMajor: null,
    projMoeGeneral: null,
    projCentralOther: null,
    projProvincialMajor: null
  },
  outputs: {
    adviceSubmitted: null,
    adviceAdoptedCentral: null,
    adviceAdoptedProvincial: null,
    paperTotal: null,
    paperDomestic: null,
    paperIntl: null,
    bookTotal: null,
    bookDomestic: null,
    bookIntl: null
  },
  dbSoftwareTransfer: {
    dbSelfCount: null,
    dbSelfItems: null,
    dbSelfCapacity: null,
    dbBuyCount: null,
    dbBuyItems: null,
    dbBuyCapacity: null,
    softSelfDev: null,
    softPurchased: null,
    transferCount: null,
    transferIncome: null
  },
  talentAndCoop: {
    phdGraduated: null,
    phdEnrolled: null,
    masterGraduated: null,
    masterEnrolled: null,
    courseUndergradHours: null,
    courseGradHours: null,
    confHostedDomestic: null,
    confHostedIntl: null,
    intlCoopProjects: null,
    intlCoopFund: null,
    lectureOutDomestic: null,
    lectureOutAbroad: null,
    lectureIn: null,
    visitOut: null
  },
  managementEquipSupport: {
    commAcademicMembers: null,
    commAcademicMeetings: null,
    commManageMembers: null,
    commManageMeetings: null,
    policyDocsIssued: null,
    equipMainCount: null,
    equipMainValue: null,
    equipLargeCount: null,
    equipLargeValue: null,
    equipSharedHours: null,
    supportFundSchool: null,
    supportFundOther: null
  },
  textReport: {
    progress: null,
    achievements: null,
    issuesPlans: null
  },
  attachments: {
    files: []
  }
})

const handleSelectionChange = (rows) => {
  data.ids = rows.map(v => v.id)
}

const form = reactive(initForm())

// 格式化显示值：0 应该显示为 0，而不是 '暂无数据'
const displayValue = (val) => {
  if (val === undefined || val === null || val === '') {
    return '暂无数据'
  }
  return val
}

// 查看详情
const viewReport = (row) => {
  Object.assign(form, initForm()) // 先重置
  dialogVisible.value = true
  
  // 获取详情
  request.get(`/lab_phase_report/select/${row.id}`).then(res => {
    if (res.code === '200' && res.data) {
      const data = res.data
      if (data.id) form.id = data.id
      if (data.basicInfo) Object.assign(form.basicInfo, data.basicInfo)
      if (data.funding) Object.assign(form.funding, data.funding)
      if (data.projects) Object.assign(form.projects, data.projects)
      if (data.outputs) Object.assign(form.outputs, data.outputs)
      if (data.dbSoftwareTransfer) Object.assign(form.dbSoftwareTransfer, data.dbSoftwareTransfer)
      if (data.talentAndCoop) Object.assign(form.talentAndCoop, data.talentAndCoop)
      if (data.managementEquipSupport) Object.assign(form.managementEquipSupport, data.managementEquipSupport)
      if (data.textReport) Object.assign(form.textReport, data.textReport)
      
      // 处理附件回显
      if (data.attachments && data.attachments.files) {
         form.attachments.files = data.attachments.files
         // 构造 fileList 用于显示
         fileList.value = data.attachments.files.map((url, index) => ({
           name: url.substring(url.lastIndexOf('/') + 1),
           url: url,
           uid: index // 临时 uid
         }))
      } else {
        fileList.value = []
      }
    } else {
      ElMessage.error('获取详情失败')
    }
  })
}

// 驳回报告
const rejectReport = (row) => {
  ElMessageBox.confirm('确认驳回该报告吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    request.put(`/lab_phase_report/review/${row.id}?reviewStatus=2`).then(res => {
      if (res.code === '200') {
        ElMessage.success('驳回成功')
        loadReportList()
      } else {
        ElMessage.error(res.msg || '驳回失败')
      }
    })
  }).catch(() => {})
}

// 删除报告
const deleteReport = (row) => {
  ElMessageBox.confirm('确认删除该报告吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    request.delete(`/lab_phase_report/delete/${row.id}`).then(res => {
      if (res.code === '200') {
        ElMessage.success('删除成功')
        loadReportList()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    })
  }).catch(() => {})
}

// 批量删除
const delBatch = () => {
  if (!data.ids.length) {
    ElMessage.warning('请选择数据')
    return
  }
  ElMessageBox.confirm('确认批量删除选中的报告吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    request.delete('/lab_phase_report/delete/batch', { data: data.ids }).then(res => {
      if (res.code === '200') {
        ElMessage.success('批量删除成功')
        loadReportList()
      } else {
        ElMessage.error(res.msg || '批量删除失败')
      }
    })
  }).catch(() => {})
}


</script>

<style scoped>
.main-card {
  min-height: 80vh;
}

.header-actions {
  margin-bottom: 10px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 20px 0 15px 0;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
  color: #303133;
}

.word-counter {
    font-size: 13px;
    color: #333;
    margin-top: 5px;
    text-align: right;
}

.main-title {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.subsection-title {
  font-size: 14px;
  font-weight: bold;
  margin: 15px 0 10px 0;
  color: #303133;
  padding: 8px;
  border-radius: 4px;
}

.custom-descriptions :deep(.el-descriptions__label) {
  width: 180px;
  justify-content: flex-end;
  font-weight: bold;
  color: #606266;
}

.report-question {
  margin-bottom: 20px;
}

.report-question p {
  font-weight: bold;
  margin-bottom: 8px;
  line-height: 1.5;
  color: #303133;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.text-content {
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #606266;
  white-space: pre-wrap;
  min-height: 40px;
  line-height: 1.5;
}

.file-item {
  margin: 10px 0;
}

.rich-text-content {
  white-space: normal;
}

.rich-text-content :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 10px 0;
}
</style>
