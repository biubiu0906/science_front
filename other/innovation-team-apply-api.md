# 重点团队申请流程接口文档

## 1. 基础信息

- Base URL：`http://localhost:8080`
- 鉴权：请求头 `token: <JWT>`（或 `Authorization: Bearer <JWT>`）
- 字段风格：接口请求/响应支持 `snake_case`
- 业务类型：`INNOVATION_TEAM_APPLY_FOR`

## 2. 先执行数据库脚本

执行以下 SQL 文件创建两张表：

- `src/main/resources/sql/innovation_team_apply_for.sql`

表：

- `innovation_team_apply_for`（申请主表）
- `innovation_team_application_record`（申请记录/审核状态表）

## 3. 接口总览

- `POST /innovation_team_apply_for/add`：新增申请（草稿或提交）
- `PUT /innovation_team_apply_for/update/{id}`：更新申请
- `GET /innovation_team_apply_for/select/{id}`：按申请 ID 查询
- `GET /innovation_team_apply_for/selectById/{laboratoryId}`：按实验室查询最新申请
- `DELETE /innovation_team_apply_for/delete/{laboratoryId}`：删除申请（级联删除记录）
- `GET /innovation_team_application_record/list`：申请列表（校管按 schoolId 过滤）
- `PUT /innovation_team_application_record/check`：审核（校审/终审）

## 4. 申请保存与提交

### 4.1 新增草稿

- Method：`POST`
- Path：`/innovation_team_apply_for/add`
- 说明：`state=1` 为草稿；不触发审批实例

```json
{
  "state": 1,
  "team_name": "江苏省高校哲学社会科学优秀创新团队（示例）",
  "main_rely_subject": "马克思主义理论",
  "main_subject_desc": "双一流建设学科，十四五重点学科A类",
  "other_rely_subjects": [
    {
      "subject_name": "教育学",
      "subject_desc": "江苏高校优势学科"
    }
  ],
  "main_research_directions": [
    {
      "direction_name": "思政教育数字化治理"
    }
  ],
  "leader_name": "张三",
  "leader_gender": "男",
  "leader_birth_date": "1980-06",
  "leader_degree": "博士",
  "leader_title": "教授",
  "leader_admin_post": "院长",
  "leader_mobile": "13800000000",
  "leader_email": "zhangsan@example.com",
  "leader_talent_plan": "国家级人才计划",
  "leader_research_direction": "高校治理与思想政治教育",
  "leader_department": "马克思主义学院",
  "team_members": [
    {
      "name": "李四",
      "gender": "女",
      "birth_date": "1987-09",
      "title_or_degree": "副教授/博士",
      "research_direction": "教育政策评估",
      "organization": "马克思主义学院",
      "team_division": "方向负责人",
      "signature": "李四"
    }
  ],
  "leader_main_intro": "申请人在相关研究领域长期积累，主持多项省部级项目。",
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
      "level": "一等奖",
      "grant_unit": "江苏省人民政府",
      "grant_time": "2024-12"
    }
  ],
  "leader_publications": [
    {
      "work_name": "数字化思政研究",
      "journal_or_publisher": "教育研究",
      "publish_time": "2025-03",
      "author_role": "第一作者",
      "citation_info": "CSSCI收录"
    }
  ],
  "leader_policy_reports": [
    {
      "report_name": "高校治理能力提升建议",
      "author": "张三",
      "adopted_time": "2025-06",
      "effect_description": "省级部门采纳"
    }
  ],
  "leader_other_achievements": [
    {
      "achievement_name": "地方政策咨询服务",
      "author": "张三",
      "publish_time": "2025-08",
      "achievement_type": "社会服务",
      "summary": "形成地方治理咨询报告并落地。"
    }
  ],
  "core_members_intro": "团队核心成员在学术任职、项目、成果奖励方面具有良好基础。",
  "existing_foundation": "前期已形成稳定研究团队与代表性成果。",
  "construction_plan": "围绕主攻方向开展团队建设与合作交流。",
  "organized_research_mechanism": "建立有组织科研机制与青年学者培养制度。",
  "university_support_measures": "学校提供专项经费、办公用房和制度支持。",
  "non_rely_unit_commitment": "非依托单位承诺提供实质性协作支持。",
  "non_rely_unit_seal": "非依托单位公章",
  "non_rely_unit_legal_person_signature": "法定代表人签字",
  "non_rely_unit_sign_date": "2026-04-12",
  "team_leader_commitment": "本人承诺申请书内容真实完整并承担责任。",
  "team_leader_signature": "团队负责人签字",
  "team_leader_sign_date": "2026-04-12",
  "attachments_list": [
    {
      "name": "团队前期成果支撑材料.pdf",
      "url": "https://example.com/files/team-support.pdf",
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
  "team_name": "江苏省高校哲学社会科学优秀创新团队（示例）",
  "main_rely_subject": "马克思主义理论"
}
```

### 4.3 更新申请

- Method：`PUT`
- Path：`/innovation_team_apply_for/update/{id}`
- 说明：`id` 不能为空；更新逻辑与新增共用

```json
{
  "state": 1,
  "construction_plan": "更新后的建设目标与实施路径"
}
```

## 5. 查询与删除

### 5.1 按申请 ID 查询

- Method：`GET`
- Path：`/innovation_team_apply_for/select/{id}`

### 5.2 按实验室查询最新申请

- Method：`GET`
- Path：`/innovation_team_apply_for/selectById/{laboratoryId}`

### 5.3 删除申请

- Method：`DELETE`
- Path：`/innovation_team_apply_for/delete/{laboratoryId}`
- 说明：会级联删除 `innovation_team_application_record` 对应记录

## 6. 审核流程

### 6.1 查看审核列表

- Method：`GET`
- Path：`/innovation_team_application_record/list`

### 6.2 校审/终审

- Method：`PUT`
- Path：`/innovation_team_application_record/check`
- 说明：
  - `apply_status=1` 表示通过
  - `apply_status=2` 表示驳回
  - `SCHOOL_ADMIN` 执行校审
  - `ADMIN/SUPER_ADMIN` 执行终审

校审通过示例：

```json
{
  "innovation_team_apply_for_id": 20260412010101,
  "apply_status": 1,
  "review_comments": "校审通过，建议进入终审"
}
```

校审驳回示例：

```json
{
  "innovation_team_apply_for_id": 20260412010101,
  "apply_status": 2,
  "review_comments": "材料不完整，请补充证明文件"
}
```

终审通过示例：

```json
{
  "innovation_team_apply_for_id": 20260412010101,
  "apply_status": 1,
  "review_comments": "终审通过"
}
```

终审驳回示例：

```json
{
  "innovation_team_apply_for_id": 20260412010101,
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
curl -X POST "http://localhost:8080/innovation_team_apply_for/add" \
  -H "Content-Type: application/json" \
  -H "token: <JWT>" \
  -d "{\"state\":0,\"team_name\":\"重点团队A\",\"main_rely_subject\":\"马克思主义理论\"}"
```

### 8.2 校审通过

```bash
curl -X PUT "http://localhost:8080/innovation_team_application_record/check" \
  -H "Content-Type: application/json" \
  -H "token: <SCHOOL_ADMIN_JWT>" \
  -d "{\"innovation_team_apply_for_id\":20260412010101,\"apply_status\":1,\"review_comments\":\"校审通过\"}"
```

### 8.3 终审通过

```bash
curl -X PUT "http://localhost:8080/innovation_team_application_record/check" \
  -H "Content-Type: application/json" \
  -H "token: <SUPER_ADMIN_JWT>" \
  -d "{\"innovation_team_apply_for_id\":20260412010101,\"apply_status\":1,\"review_comments\":\"终审通过\"}"
```
