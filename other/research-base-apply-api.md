# 重点研究基地申请流程接口文档

## 1. 基础信息

- Base URL：`http://localhost:8080`
- 鉴权：请求头 `token: <JWT>`（或 `Authorization: Bearer <JWT>`）
- 字段风格：接口请求/响应支持 `snake_case`
- 业务类型：`RESEARCH_BASE_APPLY_FOR`

## 2. 先执行数据库脚本

执行以下 SQL 文件创建两张表：

- `src/main/resources/sql/research_base_apply_for.sql`

表：

- `research_base_apply_for`（申请主表）
- `research_base_application_record`（申请记录/审核状态表）

## 3. 接口总览

- `POST /research_base_apply_for/add`：新增申请（草稿或提交）
- `PUT /research_base_apply_for/update/{id}`：更新申请
- `GET /research_base_apply_for/select/{id}`：按申请 ID 查询
- `GET /research_base_apply_for/selectById/{laboratoryId}`：按实验室查询最新申请
- `DELETE /research_base_apply_for/delete/{laboratoryId}`：删除申请（级联删除记录）
- `GET /research_base_application_record/list`：申请列表（校管按 schoolId 过滤）
- `PUT /research_base_application_record/check`：审核（校审/终审）

## 4. 申请保存与提交

### 4.1 新增草稿

- Method：`POST`
- Path：`/research_base_apply_for/add`
- 说明：`state=1` 为草稿；不触发审批实例

```json
{
  "state": 1,
  "base_name": "江苏省高校哲学社会科学重点研究基地（示例）",
  "main_rely_subject": "马克思主义理论",
  "main_subject_desc": "双一流建设学科，十四五重点学科A类",
  "other_rely_subjects": [
    {
      "subject_name": "教育学",
      "subject_desc": "江苏高校优势学科"
    }
  ],
  "establish_time": "2026-04-01",
  "is_entity": "是",
  "staff_count_full_part_time": 28,
  "office_area": 560.5,
  "base_leader_name": "张三",
  "base_leader_gender": "男",
  "base_leader_birth_date": "1980-06-20",
  "base_leader_degree": "博士",
  "base_leader_title": "教授",
  "base_leader_admin_post": "院长",
  "base_leader_mobile": "13800000000",
  "base_leader_email": "zhangsan@example.com",
  "base_leader_talent_plan": "国家级人才计划",
  "base_leader_research_direction": "中国式现代化与教育治理",
  "base_leader_department": "马克思主义学院",
  "main_research_directions": [
    {
      "direction_name": "思想政治教育数字化",
      "academic_leader_name": "李四",
      "leader_title_post": "教授/副院长"
    }
  ],
  "leader_main_intro": "负责人长期从事相关研究，主持多项省部级项目。",
  "leader_hosted_projects": [
    {
      "project_name": "高校治理现代化研究",
      "project_source": "教育部",
      "funding": "30万",
      "start_end_time": "2023-01~2025-12",
      "is_completed": "否"
    }
  ],
  "leader_awards": [
    {
      "achievement_name": "高校思政创新模式",
      "award_name": "省哲社优秀成果奖",
      "award_level": "一等奖",
      "award_unit": "江苏省人民政府",
      "award_time": "2024-12"
    }
  ],
  "leader_publications": [
    {
      "publication_name": "数字化思政研究",
      "journal_publisher": "教育研究",
      "publish_time": "2025-03",
      "author_role": "第一作者",
      "citation_index_info": "CSSCI收录"
    }
  ],
  "leader_policy_reports": [
    {
      "report_name": "高校治理能力提升建议",
      "author": "张三",
      "adopt_time": "2025-06",
      "adopt_feedback": "省级部门采纳"
    }
  ],
  "leader_other_achievements": [
    {
      "achievement_name": "地方政策咨询服务",
      "author": "张三",
      "publish_time": "2025-08",
      "achievement_type": "社会服务",
      "achievement_intro": "形成地方治理咨询报告并落地。"
    }
  ],
  "full_time_core_members": [
    {
      "name": "王五",
      "gender": "女",
      "birth_date": "1986-10",
      "title_degree": "副教授/博士",
      "research_direction": "教育政策评估",
      "affiliation": "马克思主义学院",
      "duty": "方向负责人",
      "signature": "王五"
    }
  ],
  "part_time_core_members": [
    {
      "name": "赵六",
      "gender": "男",
      "birth_date": "1982-02",
      "title_degree": "研究员/博士",
      "research_direction": "区域治理",
      "affiliation": "社会科学院",
      "duty": "协同研究",
      "signature": "赵六"
    }
  ],
  "full_time_secretary_name": "陈七",
  "full_time_secretary_gender": "女",
  "full_time_secretary_birth_date": "1991-04",
  "full_time_secretary_telephone": "025-12345678",
  "full_time_secretary_mobile": "13900000000",
  "full_time_secretary_email": "chenqi@example.com",
  "full_time_secretary_title": "助理研究员",
  "full_time_secretary_education": "研究生",
  "full_time_secretary_degree": "硕士",
  "existing_foundation": "前期已形成稳定研究团队与代表性成果。",
  "target_task": "建成省内有影响力的哲社研究基地。",
  "construction_measures": "加强制度建设、人才引育与协同攻关。",
  "research_directions_detail": [
    {
      "direction_name": "思想政治教育数字化",
      "content": "突出研究特色、方法与实践价值。"
    }
  ],
  "university_support": "学校提供专项经费与办公场地支持。",
  "base_leader_commitment": "本人承诺所填内容真实、完整并承担相应责任。",
  "base_leader_seal": "基地负责人签章",
  "base_leader_legal_person_signature": "基地负责人签字",
  "base_leader_sign_date": "2026-04-10",
  "non_rely_unit_commitment": "协同单位承诺提供研究数据与专家资源。",
  "non_rely_unit_seal": "协同单位公章",
  "non_rely_unit_legal_person_signature": "法定代表人签字",
  "non_rely_unit_sign_date": "2026-04-10",
  "attachments_list": [
    {
      "name": "机构成立证明.pdf",
      "url": "https://example.com/files/a.pdf",
      "type": "pdf"
    }
  ]
}
```

### 4.2 提交审批

- 与草稿入参一致，只需将 `state` 改为 `0`
- 提交后会自动创建/重置审批实例，记录状态改为“申请中”

```json
{
  "state": 0,
  "base_name": "江苏省高校哲学社会科学重点研究基地（示例）",
  "main_rely_subject": "马克思主义理论"
}
```

### 4.3 更新申请

- Method：`PUT`
- Path：`/research_base_apply_for/update/{id}`
- 说明：`id` 不能为空；更新逻辑与新增共用

```json
{
  "state": 1,
  "target_task": "更新后的建设目标与任务"
}
```

## 5. 查询与删除

### 5.1 按申请 ID 查询

- Method：`GET`
- Path：`/research_base_apply_for/select/{id}`

### 5.2 按实验室查询最新申请

- Method：`GET`
- Path：`/research_base_apply_for/selectById/{laboratoryId}`

### 5.3 删除申请

- Method：`DELETE`
- Path：`/research_base_apply_for/delete/{laboratoryId}`
- 说明：会级联删除 `research_base_application_record` 对应记录

## 6. 审核流程

### 6.1 查看审核列表

- Method：`GET`
- Path：`/research_base_application_record/list`

### 6.2 校审/终审

- Method：`PUT`
- Path：`/research_base_application_record/check`
- 说明：
  - `apply_status=1` 表示通过
  - `apply_status=2` 表示驳回
  - `SCHOOL_ADMIN` 执行校审
  - `ADMIN/SUPER_ADMIN` 执行终审

校审通过示例：

```json
{
  "research_base_apply_for_id": 20260411153001,
  "apply_status": 1,
  "review_comments": "校审通过，建议进入终审"
}
```

校审驳回示例：

```json
{
  "research_base_apply_for_id": 20260411153001,
  "apply_status": 2,
  "review_comments": "材料不完整，请补充证明文件"
}
```

终审通过示例：

```json
{
  "research_base_apply_for_id": 20260411153001,
  "apply_status": 1,
  "review_comments": "终审通过"
}
```

终审驳回示例：

```json
{
  "research_base_apply_for_id": 20260411153001,
  "apply_status": 2,
  "review_comments": "终审未通过"
}
```

## 7. 状态说明

- 申请保存阶段：
  - `state=1`：草稿
  - `state=0`：提交
- 记录状态（`apply_status`）：
  - `3`：草稿
  - `0`：申请中/待审
  - `1`：审核通过
  - `2`：审核驳回

## 8. cURL 快速联调

### 8.1 提交申请

```bash
curl -X POST "http://localhost:8080/research_base_apply_for/add" \
  -H "Content-Type: application/json" \
  -H "token: <JWT>" \
  -d "{\"state\":0,\"base_name\":\"重点研究基地A\",\"main_rely_subject\":\"马克思主义理论\"}"
```

### 8.2 校审通过

```bash
curl -X PUT "http://localhost:8080/research_base_application_record/check" \
  -H "Content-Type: application/json" \
  -H "token: <SCHOOL_ADMIN_JWT>" \
  -d "{\"research_base_apply_for_id\":20260411153001,\"apply_status\":1,\"review_comments\":\"校审通过\"}"
```

### 8.3 终审通过

```bash
curl -X PUT "http://localhost:8080/research_base_application_record/check" \
  -H "Content-Type: application/json" \
  -H "token: <SUPER_ADMIN_JWT>" \
  -d "{\"research_base_apply_for_id\":20260411153001,\"apply_status\":1,\"review_comments\":\"终审通过\"}"
```
