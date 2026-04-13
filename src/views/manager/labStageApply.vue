<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
        <el-input v-model="searchId" :prefix-icon="Search" style="width: 240px; margin-right: 10px" placeholder="请输入申请编号查询"></el-input>
        <el-button type="info" plain size="small" @click="searchReport">查询</el-button>
        <el-button type="warning" plain size="small" style="margin: 0 10px" @click="resetSearch">重置</el-button>
      </div>
    <div class="card">
      <div class="header-actions">
        <el-button type="primary" @click="openDialog" size="small" plain>新增阶段报告</el-button>
        <el-button type="success" @click="downloadInstruction" size="small" plain>下载填写说明</el-button>
        <el-button type="danger" @click="delBatch" size="small" plain>批量删除</el-button>
      </div>
      
      <!-- 报告列表 -->
      <div style="margin-top: 15px">
        <el-table :data="reportList" stripe style="width: 100%" @selection-change="handleSelectionChange" :header-cell-style="{ backgroundColor: '#e9edf2' }" class="table-center" empty-text="暂无数据" v-if="reportList.length > 0">
          <el-table-column type="selection" width="35" />
          <el-table-column prop="id" label="编号" min-width="80" sortable/>
          <el-table-column prop="basicInfo.reportStartDate" label="报告起始时间" width="180" sortable/>
          <el-table-column prop="basicInfo.reportEndDate" label="报告结束时间" width="180" sortable/>
          <el-table-column prop="updatedAt" label="更新时间" width="180" sortable/>
          <el-table-column prop="reviewStatus" label="状态" width="140" sortable>
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.reviewStatus)">
                {{ getStatusText(scope.row.reviewStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-tooltip content="查看详情" placement="bottom" effect="light">
                <el-button @click="viewReport(scope.row)" size="small">查看</el-button>
              </el-tooltip>
              <el-tooltip content="修改报告" placement="bottom" effect="light" v-if="scope.row.reviewStatus === 'SCHOOL_REJECTED' || scope.row.reviewStatus === 2">
                <el-button @click="editReport(scope.row)" size="small" type="primary">修改</el-button>
              </el-tooltip>
              <el-tooltip content="删除报告" placement="bottom" effect="light">
                <el-button @click="deleteReport(scope.row)" size="small" type="danger">删除</el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无报告，请点击上方按钮新增" />
      </div>
    </div>

    <!-- 新增阶段性报告弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="operationType === 'view' ? '查看阶段报告' : (operationType === 'add' ? '新增阶段报告' : '编辑阶段报告')"
      width="70%"
      :close-on-click-modal="false"
      destroy-on-close
      @close="showSecurityAlert = false"
    >
      <el-form :model="form" ref="formRef" label-width="auto" v-loading="autoFillLoading">
        
        <!-- 填写说明 -->
        <div style="background-color: #ecf5ff; padding: 15px; border-radius: 4px; margin-bottom: 20px; color: #337ecc; line-height: 1.6; font-size: 14px;">
           <div style="font-weight: bold; text-align: center; margin-bottom: 10px; font-size: 16px; color: #337ecc;">填 写 说 明</div>
           <div style="margin-bottom: 5px;">一、 本表填写的成果时间限定为2025年1月—2025年12月，请在此时间范围内按照要求逐项据实填写，填报内容应与实验室研究方向一致。</div>
           <div style="margin-bottom: 5px;">二、报告中填报人员信息应与实验室设立时任务书中的负责人和团队成员信息一致，相关内容应是以上人员工作的客观描述或量化统计。</div>
           <div>三、根据实验室建设需要，对人员进行调整的，需在第二部分阶段性进展情况报告中进行说明。涉及变更人员的工作成果在报告中只填写加入实验室期间的内容。</div>
        </div>

        <!-- 第一大类：建设基本情况表 -->
        <div class="main-title">一、建设基本情况表</div>

        <!-- 基本情况 -->
        <div class="section-title">基本情况</div>
        <el-descriptions border :column="4" class="custom-descriptions">
          <el-descriptions-item label="报告起始时间" :span="2">
            <div v-if="operationType === 'view'">{{ displayValue(form.basicInfo.reportStartDate) }}</div>
            <el-date-picker v-else v-model="form.basicInfo.reportStartDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" disabled />
          </el-descriptions-item>
          <el-descriptions-item label="报告结束时间" :span="2">
            <div v-if="operationType === 'view'">{{ displayValue(form.basicInfo.reportEndDate) }}</div>
            <el-date-picker v-else v-model="form.basicInfo.reportEndDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" disabled />
          </el-descriptions-item>

          <el-descriptions-item label="实验室名称" :span="2">
            <div v-if="operationType === 'view'">{{ displayValue(form.basicInfo.labName) }}</div>
            <el-input v-else v-model="form.basicInfo.labName" placeholder="请输入实验室名称" />
          </el-descriptions-item>
          <el-descriptions-item label="实验室类别" :span="2">
            <div v-if="operationType === 'view'">{{ displayValue(form.basicInfo.labCategory) }}</div>
            <el-radio-group v-else v-model="form.basicInfo.labCategory">
              <el-radio value="重点建设">重点建设</el-radio>
              <el-radio value="培育建设">培育建设</el-radio>
            </el-radio-group>
          </el-descriptions-item>
          
          <el-descriptions-item label="实验室主任" :span="2">
            <div v-if="operationType === 'view'">{{ displayValue(form.basicInfo.directorName) }}</div>
            <el-input v-else v-model="form.basicInfo.directorName" placeholder="请输入姓名" />
          </el-descriptions-item>
          
          <el-descriptions-item label="依托学校" :span="2">
            <div v-if="operationType === 'view'">{{ displayValue(form.basicInfo.universityName) }}</div>
            <el-input v-else v-model="form.basicInfo.universityName" placeholder="请输入学校名称" />
          </el-descriptions-item>

          <el-descriptions-item label="成立时间" :span="2">
            <div v-if="operationType === 'view'">{{ displayValue(form.basicInfo.foundingDate) }}</div>
            <el-date-picker 
              v-else 
              :key="foundingDateType"
              v-model="form.basicInfo.foundingDate" 
              :type="foundingDateType" 
              :value-format="foundingDateType === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD'" 
              placeholder="选择日期" 
              style="width: 100%" 
            />
          </el-descriptions-item>
          <el-descriptions-item label="是否实体" :span="2">
             <div v-if="operationType === 'view'">{{ form.basicInfo.isEntity === 1 ? '是' : (form.basicInfo.isEntity === 0 ? '否' : '暂无数据') }}</div>
             <el-radio-group v-else v-model="form.basicInfo.isEntity">
              <el-radio :value="1">是</el-radio>
              <el-radio :value="0">否</el-radio>
            </el-radio-group>
          </el-descriptions-item>

          <el-descriptions-item label="总面积(平方米)" :span="2">
            <div v-if="operationType === 'view'">{{ displayValue(form.basicInfo.areaTotal) }}</div>
            <el-input v-else v-model="form.basicInfo.areaTotal" style="width: 100%" placeholder="请输入" />
          </el-descriptions-item>
          <el-descriptions-item label="其中实验面积(平方米)" :span="2">
            <div v-if="operationType === 'view'">{{ displayValue(form.basicInfo.areaExperimental) }}</div>
            <el-input v-else v-model="form.basicInfo.areaExperimental" style="width: 100%" placeholder="请输入" />
          </el-descriptions-item>
          <el-descriptions-item label="主要依托学科" :span="2">
            <div v-if="operationType === 'view'">{{ displayValue(form.basicInfo.majorDiscipline) }}</div>
            <el-input v-else v-model="form.basicInfo.majorDiscipline" placeholder="请输入学科" />
          </el-descriptions-item>
          <el-descriptions-item label="其他依托学科" :span="2">
            <div v-if="operationType === 'view'">{{ displayValue(form.basicInfo.otherDisciplines) }}</div>
            <el-input v-else v-model="form.basicInfo.otherDisciplines" placeholder="多个学科请用逗号分隔" />
          </el-descriptions-item>

          <el-descriptions-item label="研究方向" :span="4">
            <div v-if="operationType === 'view'">
              <div v-if="!form.basicInfo.researchDirections || form.basicInfo.researchDirections.length === 0 || (form.basicInfo.researchDirections.length === 1 && !form.basicInfo.researchDirections[0])">暂无数据</div>
              <div v-else v-for="(item, index) in form.basicInfo.researchDirections" :key="index" style="margin-bottom: 5px;">
                {{ index + 1 }}. {{ item }}
              </div>
            </div>
            <template v-else>
              <div v-for="(item, index) in form.basicInfo.researchDirections" :key="index" style="margin-bottom: 5px; display: flex;">
                <el-input v-model="form.basicInfo.researchDirections[index]" :placeholder="'研究方向 ' + (index + 1)" style="margin-right: 10px;" />
                <el-button type="danger" :icon="Delete" circle size="small" @click="removeResearchDirection(index)" v-if="form.basicInfo.researchDirections.length > 1" />
              </div>
              <el-button type="primary" link size="small" @click="addResearchDirection">+ 添加研究方向</el-button>
            </template>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 科学研究与贡献 -->
        <div class="section-title" style="margin-top: 20px;">科学研究与贡献</div>

        <div class="subsection-title">1.科研任务</div>
        <el-descriptions border :column="2" class="custom-descriptions">
           <el-descriptions-item label="项目到账总经费(万元)" :span="2">
            <div v-if="operationType === 'view'">{{ displayValue(form.funding.fundTotal) }}</div>
            <el-input v-else v-model="form.funding.fundTotal" style="width: 100%" placeholder="请输入"/>
           </el-descriptions-item>
           <el-descriptions-item label="纵向经费(万元)">
            <div v-if="operationType === 'view'">{{ displayValue(form.funding.fundLongitudinal) }}</div>
            <el-input v-else v-model="form.funding.fundLongitudinal" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="横向经费(万元)">
            <div v-if="operationType === 'view'">{{ displayValue(form.funding.fundTransverse) }}</div>
            <el-input v-else v-model="form.funding.fundTransverse" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>

           <el-descriptions-item label="国家社科基金重大重点项目(项)">
             <div v-if="operationType === 'view'">{{ displayValue(form.projects.projNssMajor) }}</div>
             <el-input v-else v-model="form.projects.projNssMajor" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="国家自科基金重大重点项目(项)">
             <div v-if="operationType === 'view'">{{ displayValue(form.projects.projNsfcMajor) }}</div>
             <el-input v-else v-model="form.projects.projNsfcMajor" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="国家社科基金一般项目(项)">
             <div v-if="operationType === 'view'">{{ displayValue(form.projects.projNssGeneral) }}</div>
             <el-input v-else v-model="form.projects.projNssGeneral" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="国家自科基金面上项目(项)">
             <div v-if="operationType === 'view'">{{ displayValue(form.projects.projNsfcGeneral) }}</div>
             <el-input v-else v-model="form.projects.projNsfcGeneral" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>

           <el-descriptions-item label="教育部人文社科重大项目(项)">
             <div v-if="operationType === 'view'">{{ displayValue(form.projects.projMoeMajor) }}</div>
             <el-input v-else v-model="form.projects.projMoeMajor" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="教育部人文社科一般项目(项)">
             <div v-if="operationType === 'view'">{{ displayValue(form.projects.projMoeGeneral) }}</div>
             <el-input v-else v-model="form.projects.projMoeGeneral" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="中央其他部门重大重点项目(项)">
             <div v-if="operationType === 'view'">{{ displayValue(form.projects.projCentralOther) }}</div>
             <el-input v-else v-model="form.projects.projCentralOther" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="省部级科研重大项目(项)">
             <div v-if="operationType === 'view'">{{ displayValue(form.projects.projProvincialMajor) }}</div>
             <el-input v-else v-model="form.projects.projProvincialMajor" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
        </el-descriptions>

        <div class="subsection-title">2.科研贡献与成果</div>
        <el-descriptions border :column="3" class="custom-descriptions">
           <el-descriptions-item label="提交咨政报告数(篇)">
             <div v-if="operationType === 'view'">{{ displayValue(form.outputs.adviceSubmitted) }}</div>
             <el-input v-else v-model="form.outputs.adviceSubmitted" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="中央部门采纳(篇)">
             <div v-if="operationType === 'view'">{{ displayValue(form.outputs.adviceAdoptedCentral) }}</div>
             <el-input v-else v-model="form.outputs.adviceAdoptedCentral" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="省级部门采纳(篇)">
             <div v-if="operationType === 'view'">{{ displayValue(form.outputs.adviceAdoptedProvincial) }}</div>
             <el-input v-else v-model="form.outputs.adviceAdoptedProvincial" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>

           <el-descriptions-item label="发表高水平论文(篇)">
             <div v-if="operationType === 'view'">{{ displayValue(form.outputs.paperTotal) }}</div>
             <el-input v-else v-model="form.outputs.paperTotal" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="国内期刊(篇)">
             <div v-if="operationType === 'view'">{{ displayValue(form.outputs.paperDomestic) }}</div>
             <el-input v-else v-model="form.outputs.paperDomestic" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="国际期刊(篇)">
             <div v-if="operationType === 'view'">{{ displayValue(form.outputs.paperIntl) }}</div>
             <el-input v-else v-model="form.outputs.paperIntl" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>

           <el-descriptions-item label="出版著作(部)">
             <div v-if="operationType === 'view'">{{ displayValue(form.outputs.bookTotal) }}</div>
             <el-input v-else v-model="form.outputs.bookTotal" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="国内出版(部)">
             <div v-if="operationType === 'view'">{{ displayValue(form.outputs.bookDomestic) }}</div>
             <el-input v-else v-model="form.outputs.bookDomestic" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="国外出版(部)">
             <div v-if="operationType === 'view'">{{ displayValue(form.outputs.bookIntl) }}</div>
             <el-input v-else v-model="form.outputs.bookIntl" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
        </el-descriptions>

        <div class="subsection-title">3.数据库建设与成果转化</div>
        <el-descriptions border :column="2" class="custom-descriptions">
           <el-descriptions-item label="自主开发数据库(个)">
             <div v-if="operationType === 'view'">{{ displayValue(form.dbSoftwareTransfer.dbSelfCount) }}</div>
             <el-input v-else v-model="form.dbSoftwareTransfer.dbSelfCount" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="采购数据库(个)">
             <div v-if="operationType === 'view'">{{ displayValue(form.dbSoftwareTransfer.dbBuyCount) }}</div>
             <el-input v-else v-model="form.dbSoftwareTransfer.dbBuyCount" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="其中：数据条目(条)">
             <div v-if="operationType === 'view'">{{ displayValue(form.dbSoftwareTransfer.dbSelfItems) }}</div>
             <el-input v-else v-model="form.dbSoftwareTransfer.dbSelfItems" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="其中：数据条目(条)">
             <div v-if="operationType === 'view'">{{ displayValue(form.dbSoftwareTransfer.dbBuyItems) }}</div>
             <el-input v-else v-model="form.dbSoftwareTransfer.dbBuyItems" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="其中：数据容量(TB)">
             <div v-if="operationType === 'view'">{{ displayValue(form.dbSoftwareTransfer.dbSelfCapacity) }}</div>
             <el-input v-else v-model="form.dbSoftwareTransfer.dbSelfCapacity" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="其中：数据容量(TB)">
             <div v-if="operationType === 'view'">{{ displayValue(form.dbSoftwareTransfer.dbBuyCapacity) }}</div>
             <el-input v-else v-model="form.dbSoftwareTransfer.dbBuyCapacity" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>

           <el-descriptions-item label="自主开发应用软件(个)">
             <div v-if="operationType === 'view'">{{ displayValue(form.dbSoftwareTransfer.softSelfDev) }}</div>
             <el-input v-else v-model="form.dbSoftwareTransfer.softSelfDev" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="购买应用软件(个)">
             <div v-if="operationType === 'view'">{{ displayValue(form.dbSoftwareTransfer.softPurchased) }}</div>
             <el-input v-else v-model="form.dbSoftwareTransfer.softPurchased" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>

           <el-descriptions-item label="成果转化数(项)">
             <div v-if="operationType === 'view'">{{ displayValue(form.dbSoftwareTransfer.transferCount) }}</div>
             <el-input v-else v-model="form.dbSoftwareTransfer.transferCount" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="转化总经费(万元)">
             <div v-if="operationType === 'view'">{{ displayValue(form.dbSoftwareTransfer.transferIncome) }}</div>
             <el-input v-else v-model="form.dbSoftwareTransfer.transferIncome" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
        </el-descriptions>

        <!-- 学生培养 -->
        <div class="section-title" style="margin-top: 20px;">学生培养</div>
        <el-descriptions border :column="2" class="custom-descriptions">
           <el-descriptions-item label="博士研究生毕业(人)">
             <div v-if="operationType === 'view'">{{ displayValue(form.talentAndCoop.phdGraduated) }}</div>
             <el-input v-else v-model="form.talentAndCoop.phdGraduated" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="在读(人)">
             <div v-if="operationType === 'view'">{{ displayValue(form.talentAndCoop.phdEnrolled) }}</div>
             <el-input v-else v-model="form.talentAndCoop.phdEnrolled" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="硕士研究生毕业(人)">
             <div v-if="operationType === 'view'">{{ displayValue(form.talentAndCoop.masterGraduated) }}</div>
             <el-input v-else v-model="form.talentAndCoop.masterGraduated" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="在读(人)">
             <div v-if="operationType === 'view'">{{ displayValue(form.talentAndCoop.masterEnrolled) }}</div>
             <el-input v-else v-model="form.talentAndCoop.masterEnrolled" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>

           <el-descriptions-item label="承担本科课程(学时)">
             <div v-if="operationType === 'view'">{{ displayValue(form.talentAndCoop.courseUndergradHours) }}</div>
             <el-input v-else v-model="form.talentAndCoop.courseUndergradHours" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="承担研究生课程(学时)">
             <div v-if="operationType === 'view'">{{ displayValue(form.talentAndCoop.courseGradHours) }}</div>
             <el-input v-else v-model="form.talentAndCoop.courseGradHours" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
        </el-descriptions>

        <!-- 学术交流 -->
        <div class="section-title" style="margin-top: 20px;">学术交流</div>
        <el-descriptions border :column="2" class="custom-descriptions">
           <el-descriptions-item label="承办学术会议国内(次)">
             <div v-if="operationType === 'view'">{{ displayValue(form.talentAndCoop.confHostedDomestic) }}</div>
             <el-input v-else v-model="form.talentAndCoop.confHostedDomestic" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="国际(次)">
             <div v-if="operationType === 'view'">{{ displayValue(form.talentAndCoop.confHostedIntl) }}</div>
             <el-input v-else v-model="form.talentAndCoop.confHostedIntl" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>

           <el-descriptions-item label="国际合作计划(项)">
             <div v-if="operationType === 'view'">{{ displayValue(form.talentAndCoop.intlCoopProjects) }}</div>
             <el-input v-else v-model="form.talentAndCoop.intlCoopProjects" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="国际合作经费(万元)">
             <div v-if="operationType === 'view'">{{ displayValue(form.talentAndCoop.intlCoopFund) }}</div>
             <el-input v-else v-model="form.talentAndCoop.intlCoopFund" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>

           <el-descriptions-item label="国内外讲学/报告/调研-国内(人次)">
             <div v-if="operationType === 'view'">{{ displayValue(form.talentAndCoop.lectureOutDomestic) }}</div>
             <el-input v-else v-model="form.talentAndCoop.lectureOutDomestic" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="国外(人次)">
             <div v-if="operationType === 'view'">{{ displayValue(form.talentAndCoop.lectureOutAbroad) }}</div>
             <el-input v-else v-model="form.talentAndCoop.lectureOutAbroad" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>

           <el-descriptions-item label="邀请专家讲学/报告/调研(人次)">
             <div v-if="operationType === 'view'">{{ displayValue(form.talentAndCoop.lectureIn) }}</div>
             <el-input v-else v-model="form.talentAndCoop.lectureIn" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="出国(境)访问/访学(人次)">
             <div v-if="operationType === 'view'">{{ displayValue(form.talentAndCoop.visitOut) }}</div>
             <el-input v-else v-model="form.talentAndCoop.visitOut" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
        </el-descriptions>

        <!-- 管理机制 -->
        <div class="section-title" style="margin-top: 20px;">管理机制</div>
        <el-descriptions border :column="2" class="custom-descriptions">
           <el-descriptions-item label="学术委员会人数(人)">
             <div v-if="operationType === 'view'">{{ displayValue(form.managementEquipSupport.commAcademicMembers) }}</div>
             <el-input v-else v-model="form.managementEquipSupport.commAcademicMembers" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="共计召开会议(次)">
             <div v-if="operationType === 'view'">{{ displayValue(form.managementEquipSupport.commAcademicMeetings) }}</div>
             <el-input v-else v-model="form.managementEquipSupport.commAcademicMeetings" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="管理委员会人数(人)">
             <div v-if="operationType === 'view'">{{ displayValue(form.managementEquipSupport.commManageMembers) }}</div>
             <el-input v-else v-model="form.managementEquipSupport.commManageMembers" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="共计召开会议(次)">
             <div v-if="operationType === 'view'">{{ displayValue(form.managementEquipSupport.commManageMeetings) }}</div>
             <el-input v-else v-model="form.managementEquipSupport.commManageMeetings" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="出台校内制度文件(个)" :span="2">
             <div v-if="operationType === 'view'">{{ displayValue(form.managementEquipSupport.policyDocsIssued) }}</div>
             <el-input v-else v-model="form.managementEquipSupport.policyDocsIssued" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
        </el-descriptions>

        <!-- 实验设备 -->
        <div class="section-title" style="margin-top: 20px;">实验设备</div>
        <el-descriptions border :column="2" class="custom-descriptions">
           <el-descriptions-item label="主要实验设备(件)">
             <div v-if="operationType === 'view'">{{ displayValue(form.managementEquipSupport.equipMainCount) }}</div>
             <el-input v-else v-model="form.managementEquipSupport.equipMainCount" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="价值(万元)">
             <div v-if="operationType === 'view'">{{ displayValue(form.managementEquipSupport.equipMainValue) }}</div>
             <el-input v-else v-model="form.managementEquipSupport.equipMainValue" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="50万元以上设备(件)">
             <div v-if="operationType === 'view'">{{ displayValue(form.managementEquipSupport.equipLargeCount) }}</div>
             <el-input v-else v-model="form.managementEquipSupport.equipLargeCount" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="价值(万元)">
             <div v-if="operationType === 'view'">{{ displayValue(form.managementEquipSupport.equipLargeValue) }}</div>
             <el-input v-else v-model="form.managementEquipSupport.equipLargeValue" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="实验设备共享时间(小时)">
             <div v-if="operationType === 'view'">{{ displayValue(form.managementEquipSupport.equipSharedHours) }}</div>
             <el-input v-else v-model="form.managementEquipSupport.equipSharedHours" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
        </el-descriptions>

        <!-- 经费保障 -->
        <div class="section-title" style="margin-top: 20px;">经费保障</div>
        <el-descriptions border :column="2" class="custom-descriptions">
           <el-descriptions-item label="依托单位经费投入(万元)">
             <div v-if="operationType === 'view'">{{ displayValue(form.managementEquipSupport.supportFundSchool) }}</div>
             <el-input v-else v-model="form.managementEquipSupport.supportFundSchool" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
           <el-descriptions-item label="其他渠道经费投入(万元)" :span="2">
             <div v-if="operationType === 'view'">{{ displayValue(form.managementEquipSupport.supportFundOther) }}</div>
             <el-input v-else v-model="form.managementEquipSupport.supportFundOther" style="width: 100%" placeholder="请输入" />
           </el-descriptions-item>
        </el-descriptions>

        <!-- 第二大类：阶段性进展情况报告 -->
        <div class="main-title" style="margin-top: 30px;">二、阶段性进展情况报告</div>
        
        <div class="report-question">
          <p>（一）对照《任务书》，介绍实验室立项以来的建设进展，主要包括在探索建构中国自主知识体系、学科交叉研究、研究方法与研究范式创新（包括数据库建设）、队伍建设与人才培养、实验室开放共享（包括开展国际学术交流与合作、向政府、行业和社会提供公共服务等）与运行管理、政策保障等方面的具体做法和取得的主要成效（限 3000 字）。</p>
          <div v-if="operationType === 'view'" class="text-content" style="white-space: normal;" v-html="displayValue(form.textReport.progress)"></div>
          <template v-else>
            <Editor
              v-model="form.textReport.progress"
              placeholder="请输入建设进展情况..."
            />
          </template>
        </div>

        <div class="report-question">
          <p>（二）逐条列出代表性研究成果，包括成果名称、完成人、时间、成果形式等（不超过 10 项）。</p>
          <div v-if="operationType === 'view'" class="text-content" style="white-space: normal;" v-html="displayValue(form.textReport.achievements)"></div>
          <Editor
            v-else
            v-model="form.textReport.achievements"
            placeholder="请输入代表性研究成果"
          />
        </div>

        <div class="report-question">
          <p>（三）存在的问题及下一步建设思路。</p>
          <div v-if="operationType === 'view'" class="text-content" style="white-space: normal;" v-html="displayValue(form.textReport.issuesPlans)"></div>
          <Editor
            v-else
            v-model="form.textReport.issuesPlans"
            placeholder="请输入存在的问题及下一步建设思路"
          />
        </div>

        <!-- 第三大类：相关材料提交 -->
        <div class="main-title" style="margin: 20px 0;">三、佐证材料</div>
        <div v-if="operationType === 'view'">
           <div v-if="fileList.length === 0">暂无佐证材料</div>
           <div v-else v-for="file in fileList" :key="file.name" class="file-item">
             <el-link :href="file.url" target="_blank" type="primary">{{ file.name }}</el-link>
           </div>
        </div>

        <el-upload
          v-else
          :action="uploadUrl"
          :headers="uploadHeaders"
          :on-success="handleUploadSuccess"
          :on-remove="handleRemove"
          :before-upload="handleBeforeUpload"
          :on-exceed="handleExceed"
          :limit="1"
          :file-list="fileList"
          class="upload-demo"
          drag
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽文件到此处，或 <em>点击上传</em>
          </div>
        </el-upload>
        <div style="margin-top: 10px; color: rgb(229, 44, 44); font-size: 13px;">* 佐证材料要包含目录</div>

      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关 闭</el-button>
          <el-button v-if="operationType !== 'view'" type="primary" @click="submitReport" :loading="loading">提 交</el-button>
        </span>
      </template>
    </el-dialog>
    <SecurityAlert v-model="showSecurityAlert" @confirm="handleSecurityConfirm" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from '@/utils/element-plus'
import { Delete, UploadFilled, Search, Download } from '@element-plus/icons-vue'
import request from '@/utils/request.js'
import SecurityAlert from '@/components/SecurityAlert.vue'
import Editor from '@/components/Editor.vue'

// 状态映射
const statusMap = {
  'DRAFT': { text: '草稿', type: 'info' },
  'SUBMITTED': { text: '已提交', type: 'warning' },
  'SCHOOL_APPROVED': { text: '校审通过', type: 'primary' },
  'SCHOOL_REJECTED': { text: '校审驳回', type: 'danger' },
  'SUPER_APPROVED': { text: '审核通过', type: 'success' },
  'SUPER_REJECTED': { text: '审核未通过', type: 'danger' },
  // 兜底历史数据
  '1': { text: '已提交', type: 'warning' },
  '2': { text: '审核通过', type: 'success' }
}

const getStatusText = (status) => {
  return statusMap[status]?.text || '未知状态'
}

const getStatusTagType = (status) => {
  return statusMap[status]?.type || 'info'
}

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

// 下载填写说明
const downloadInstruction = () => {
  window.open('http://101.37.160.218:8080/files/download/江苏省高校哲学社会科学实验室阶段性报告说明.doc')
}

// 页面加载时获取列表
onMounted(() => {
  loadReportList()
})

// 控制弹窗显示
const dialogVisible = ref(false)
const loading = ref(false)
const autoFillLoading = ref(false)
const formRef = ref(null)

const data = reactive({
  ids: []
})

// 上传相关配置
const baseUrl = import.meta.env.VITE_BASE_URL
const uploadUrl = `${baseUrl}/files/upload`
const uploadHeaders = computed(() => {
  const user = JSON.parse(localStorage.getItem('xm-user') || '{}')
  return { token: user.token }
})
// 用于显示的文件列表
const fileList = ref([])
// 操作类型：add, edit, view
const operationType = ref('add')

// 表单数据初始化
const initForm = () => ({
  id: null,
  reviewStatus: null,
  basicInfo: {
    labName: null,
    labCategory: null,
    directorName: null,
    majorDiscipline: null,
    universityName: null,
    reportStartDate: '2025-01-01',
    reportEndDate: '2025-12-31',
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

const foundingDateType = computed(() => {
  const val = form.basicInfo.foundingDate
  return (val && /^\d{4}-\d{2}$/.test(val)) ? 'month' : 'date'
})

// 统计文本字数（不包含空格、制表符、换行等所有空白字符）
const countText = (text) => {
    // 提前返回：当文本为空时直接返回 0，避免不必要计算
    if (!text) return 0;
    // 将输入统一转为字符串，兼容非字符串输入
    const str = String(text);
    // 移除 HTML 标签
    const textOnly = str.replace(/<[^>]+>/g, '');
    // 移除所有空白字符（含空格、制表符、回车换行等）与中文全角空格
    const cleaned = textOnly.replace(/\s+/g, '').replace(/\u3000/g, '');
    // 返回剩余字符长度
    return cleaned.length;
};

// 消息实例引用
let progressWarningHandle = null

// 监听建设进展字数变化，超过 3150 字提示精简
watch(() => form.textReport.progress, (newVal) => {
  const newLen = countText(newVal)
  
  if (newLen > 3150) {
    // 关闭之前的提示（如果存在）
    if (progressWarningHandle) {
      progressWarningHandle.close()
    }
    // 显示新的提示，不自动关闭
    progressWarningHandle = ElMessage.warning({
      message: `字数超过3000字，请精简内容`,
      duration: 0,
      showClose: true
    })
  } else {
    // 如果字数回到正常范围，关闭提示
    if (progressWarningHandle) {
      progressWarningHandle.close()
      progressWarningHandle = null
    }
  }
})

// 组件销毁时关闭提示
onUnmounted(() => {
  if (progressWarningHandle) {
    progressWarningHandle.close()
  }
})

// 格式化显示值：0 应该显示为 0，而不是 '暂无数据'
const displayValue = (val) => {
  if (val === undefined || val === null || val === '') {
    return '暂无数据'
  }
  return val
}

// 安全提醒状态
const showSecurityAlert = ref(false)

// 安全提醒确认
const handleSecurityConfirm = () => {
  showSecurityAlert.value = false
}

const normalizeResearchDirections = (value) => {
  if (Array.isArray(value)) {
    const arr = value
      .map(v => (v === undefined || v === null) ? '' : String(v))
      .filter(v => v !== '')
    return arr.length ? arr : ['']
  }

  if (typeof value === 'string') {
    const arr = value
      .split(/[,，]/)
      .map(v => v.trim())
      .filter(Boolean)
    return arr.length ? arr : ['']
  }

  return ['']
}

// 自动填充报告数据
const autoFillReportData = () => {
  if (!form.basicInfo.reportStartDate || !form.basicInfo.reportEndDate) return
  
  autoFillLoading.value = true
  request.post('/lab_phase_report/consume', {
    basicInfo: {
      reportStartDate: form.basicInfo.reportStartDate,
      reportEndDate: form.basicInfo.reportEndDate
    }
  }).then(res => {
    if (res.code === '200' && res.data && res.data.dto) {
      const dto = res.data.dto
      
      // 合并基本信息
      if (dto.basicInfo) {
         // 保持 reportStartDate 和 reportEndDate 不变
         const { reportStartDate, reportEndDate, ...otherInfo } = dto.basicInfo
         Object.assign(form.basicInfo, otherInfo)
         form.basicInfo.researchDirections = normalizeResearchDirections(dto.basicInfo.researchDirections)
         // 确保 foundingDate 格式正确 (yyyy-MM-dd)
         if (dto.basicInfo.foundingDate) {
            form.basicInfo.foundingDate = dto.basicInfo.foundingDate
         }
      }

      // 合并经费统计 (优先使用外层的字段，如果不存在则使用 dto.funding 中的)
      const extractFund = (outerKey, dtoKey) => {
        let val = res.data[outerKey]
        if (val === undefined || val === null) {
          val = dto.funding?.[dtoKey]
        }
        return val
      }

      const finalFundTotal = extractFund('fundTotal', 'fundTotal')
      if (finalFundTotal !== undefined && finalFundTotal !== null) {
         form.funding.fundTotal = finalFundTotal
      }
      
      const finalFundLongitudinal = extractFund('fundLongitudinal', 'fundLongitudinal')
      if (finalFundLongitudinal !== undefined && finalFundLongitudinal !== null) {
         form.funding.fundLongitudinal = finalFundLongitudinal
      }

      const finalFundTransverse = extractFund('fundTransverse', 'fundTransverse')
      if (finalFundTransverse !== undefined && finalFundTransverse !== null) {
         form.funding.fundTransverse = finalFundTransverse
      }

      // 合并其他模块信息（如果 dto 中有数据则覆盖，否则保持初始空值）
      if (dto.funding) {
        Object.assign(form.funding, { 
          ...dto.funding, 
          fundTotal: form.funding.fundTotal,
          fundLongitudinal: form.funding.fundLongitudinal,
          fundTransverse: form.funding.fundTransverse
        }) 
      }
      if (dto.projects) Object.assign(form.projects, dto.projects)
      if (dto.outputs) Object.assign(form.outputs, dto.outputs)
      if (dto.dbSoftwareTransfer) Object.assign(form.dbSoftwareTransfer, dto.dbSoftwareTransfer)
      if (dto.talentAndCoop) Object.assign(form.talentAndCoop, dto.talentAndCoop)
      if (dto.managementEquipSupport) Object.assign(form.managementEquipSupport, dto.managementEquipSupport)
      if (dto.textReport) Object.assign(form.textReport, dto.textReport)
      
      // ElMessage.success('已自动填充实验室基本信息与经费统计')
    } else {
       // 非200不做强制提示，以免干扰用户，除非有明确错误信息
       if (res.code !== '200') {
         console.warn('自动填充失败:', res.msg)
       }
    }
  }).catch(err => {
    console.error('自动填充出错:', err)
  }).finally(() => {
    autoFillLoading.value = false
  })
}

// 打开弹窗
const openDialog = () => {
  // 重置表单
  Object.assign(form, initForm())
  fileList.value = []
  operationType.value = 'add'
  dialogVisible.value = true
  // 同时显示安全提醒
  showSecurityAlert.value = true
  
  // 发起自动填充请求
  autoFillReportData()
}

// 添加研究方向
const addResearchDirection = () => {
  form.basicInfo.researchDirections = normalizeResearchDirections(form.basicInfo.researchDirections)
  form.basicInfo.researchDirections.push('')
}

// 移除研究方向
const removeResearchDirection = (index) => {
  form.basicInfo.researchDirections = normalizeResearchDirections(form.basicInfo.researchDirections)
  form.basicInfo.researchDirections.splice(index, 1)
}

// 文件上传成功回调
const handleUploadSuccess = (response, file, fileListRes) => {
  if (response.code === '200') {
    // 假设后端返回的数据结构中 data 是文件链接
    form.attachments.files.push(response.data) 
    ElMessage.success(`${file.name} 上传成功`)
  } else {
    ElMessage.error(response.msg || `${file.name} 上传失败`)
    // 从列表中移除失败的文件
    const index = fileList.value.findIndex(f => f.uid === file.uid)
    if (index !== -1) fileList.value.splice(index, 1)
  }
}

// 文件移除回调
const handleRemove = (file, fileListRes) => {
  // 这里的逻辑可能需要根据后端返回的文件链接格式进行调整
  // 如果 file.response 存在，说明是刚上传的；如果不存在，可能是回显的
  const url = file.response ? file.response.data : file.url
  const index = form.attachments.files.indexOf(url)
  if (index !== -1) {
    form.attachments.files.splice(index, 1)
  }
}

// 上传前校验
const handleBeforeUpload = (file) => {
  return ElMessageBox.confirm('涉密材料一律不得提交，确认继续吗？', '安全提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return true
  }).catch(() => {
    return Promise.reject()
  })
}

// 文件超出限制
const handleExceed = (files) => {
  ElMessage.warning('只能上传一个文件，请先删除已有文件')
}

// 查看详情
const viewReport = (row) => {
  handleEditOrView(row, 'view')
}

// 修改报告
const editReport = (row) => {
  handleEditOrView(row, 'edit')
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

// 处理查看或编辑
const handleEditOrView = (row, type) => {
  Object.assign(form, initForm()) // 先重置
  operationType.value = type
  dialogVisible.value = true
  
  // 获取详情
  request.get(`/lab_phase_report/select/${row.id}`).then(res => {
    if (res.code === '200' && res.data) {
      const data = res.data
      if (data.id) form.id = data.id
      if (data.basicInfo) {
        Object.assign(form.basicInfo, data.basicInfo)
        form.basicInfo.researchDirections = normalizeResearchDirections(form.basicInfo.researchDirections)
      }
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
         // 构造 fileList 用于 el-upload 显示
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

// 提交报告
const submitReport = () => {
  // 校验建设进展字数
  const progressLength = countText(form.textReport.progress)
  if (progressLength > 3150) {
    ElMessage.warning(`建设进展部分字数已超过3000字，请精简内容`)
    return
  }

  loading.value = true
  
  const url = operationType.value === 'edit' ? `/lab_phase_report/update/${form.id}` : '/lab_phase_report/add'
  const method = operationType.value === 'edit' ? 'put' : 'post'
  
  request[method](url, form)
    .then(res => {
      if (res.code === '200') {
        ElMessage.success(operationType.value === 'edit' ? '修改成功' : '提交成功')
        dialogVisible.value = false
        // 刷新列表
        loadReportList()
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    })
    .catch(err => {
      console.error(err)
      ElMessage.error('发生错误')
    })
    .finally(() => {
      loading.value = false
    })
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

.text-content :deep(img) {
  max-width: 100%;
  height: auto;
}

.file-item {
  margin: 10px 0;
}
</style>
