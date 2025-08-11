# CRM系统API接口清单

## 快速参考

### Base URL
- 开发环境: `http://localhost:50001/api`
- 认证方式: `Authorization: Bearer <JWT_TOKEN>`

## 1. 认证模块 `/auth`

| 方法 | 接口 | 说明 | 权限 |
|------|------|------|------|
| POST | `/auth/login` | 用户登录 | 无 |
| POST | `/auth/logout` | 用户登出 | 需认证 |
| POST | `/auth/refresh` | 刷新Token | 需认证 |
| GET | `/auth/me` | 获取当前用户信息 | 需认证 |

## 2. 销售管理模块 `/sales`

### 2.1 线索管理 `/sales/leads`

| 方法 | 接口 | 说明 | 权限 |
|------|------|------|------|
| GET | `/sales/leads` | 获取线索列表 | leads:view |
| POST | `/sales/leads` | 创建线索 | leads:create |
| GET | `/sales/leads/{id}` | 获取线索详情 | leads:view |
| PUT | `/sales/leads/{id}` | 更新线索 | leads:edit |
| DELETE | `/sales/leads/{id}` | 删除线索 | leads:delete |
| POST | `/sales/leads/batch-assign` | 批量分配线索 | leads:assign |
| POST | `/sales/leads/{id}/convert` | 线索转化为客户 | leads:convert |
| POST | `/sales/leads/{id}/tracking` | 添加跟踪记录 | leads:edit |

### 2.2 客户管理 `/sales/customers`

| 方法 | 接口 | 说明 | 权限 |
|------|------|------|------|
| GET | `/sales/customers` | 获取客户列表 | customers:view |
| POST | `/sales/customers` | 创建客户 | customers:create |
| GET | `/sales/customers/{id}` | 获取客户详情 | customers:view |
| PUT | `/sales/customers/{id}` | 更新客户 | customers:edit |
| DELETE | `/sales/customers/{id}` | 删除客户 | customers:delete |
| POST | `/sales/customers/{id}/tracking` | 添加跟踪记录 | customers:edit |

### 2.3 成单管理 `/sales/orders`

| 方法 | 接口 | 说明 | 权限 |
|------|------|------|------|
| GET | `/sales/orders` | 获取订单列表 | orders:view |
| POST | `/sales/orders` | 创建订单 | orders:create |
| GET | `/sales/orders/{id}` | 获取订单详情 | orders:view |
| PUT | `/sales/orders/{id}` | 更新订单 | orders:edit |
| DELETE | `/sales/orders/{id}` | 删除订单 | orders:delete |
| POST | `/sales/orders/{id}/payments` | 添加支付记录 | orders:edit |
| PUT | `/sales/orders/{id}/status` | 更新订单状态 | orders:edit |

## 3. 营销管理模块 `/marketing`

### 3.1 推广活动 `/marketing/campaigns`

| 方法 | 接口 | 说明 | 权限 |
|------|------|------|------|
| GET | `/marketing/campaigns` | 获取活动列表 | campaigns:view |
| POST | `/marketing/campaigns` | 创建活动 | campaigns:create |
| GET | `/marketing/campaigns/{id}` | 获取活动详情 | campaigns:view |
| PUT | `/marketing/campaigns/{id}` | 更新活动 | campaigns:edit |
| DELETE | `/marketing/campaigns/{id}` | 删除活动 | campaigns:delete |
| PUT | `/marketing/campaigns/{id}/status` | 更改活动状态 | campaigns:edit |
| POST | `/marketing/campaigns/{id}/copy` | 复制活动 | campaigns:create |
| GET | `/marketing/campaigns/{id}/stats` | 获取活动统计 | campaigns:view |

## 4. 系统管理模块 `/system`

### 4.1 用户管理 `/system/users`

| 方法 | 接口 | 说明 | 权限 |
|------|------|------|------|
| GET | `/system/users` | 获取用户列表 | users:view |
| POST | `/system/users` | 创建用户 | users:create |
| GET | `/system/users/{id}` | 获取用户详情 | users:view |
| PUT | `/system/users/{id}` | 更新用户 | users:edit |
| DELETE | `/system/users/{id}` | 删除用户 | users:delete |
| PUT | `/system/users/{id}/password` | 重置密码 | users:edit |
| POST | `/system/users/batch` | 批量操作用户 | users:edit |

### 4.2 角色管理 `/system/roles`

| 方法 | 接口 | 说明 | 权限 |
|------|------|------|------|
| GET | `/system/roles` | 获取角色列表 | roles:view |
| POST | `/system/roles` | 创建角色 | roles:create |
| GET | `/system/roles/{id}` | 获取角色详情 | roles:view |
| PUT | `/system/roles/{id}` | 更新角色 | roles:edit |
| DELETE | `/system/roles/{id}` | 删除角色 | roles:delete |
| POST | `/system/roles/{id}/copy` | 复制角色 | roles:create |

### 4.3 部门管理 `/system/departments`

| 方法 | 接口 | 说明 | 权限 |
|------|------|------|------|
| GET | `/system/departments/tree` | 获取部门树 | departments:view |
| POST | `/system/departments` | 创建部门 | departments:create |
| PUT | `/system/departments/{id}` | 更新部门 | departments:edit |
| DELETE | `/system/departments/{id}` | 删除部门 | departments:delete |

## 5. 仪表盘数据 `/dashboard`

| 方法 | 接口 | 说明 | 权限 |
|------|------|------|------|
| GET | `/dashboard/stats` | 获取统计数据 | dashboard:view |
| GET | `/dashboard/trends` | 获取趋势数据 | dashboard:view |
| GET | `/dashboard/export` | 导出报表 | dashboard:export |

## 6. AI数据分析 `/analytics`

| 方法 | 接口 | 说明 | 权限 |
|------|------|------|------|
| POST | `/analytics/predict` | 智能预测分析 | analytics:predict |
| POST | `/analytics/recommend` | 个性化推荐 | analytics:recommend |
| POST | `/analytics/report` | 自动报告生成 | analytics:report |
| POST | `/analytics/risk` | 风险评估 | analytics:risk |
| POST | `/analytics/sentiment` | 情感分析 | analytics:sentiment |
| POST | `/analytics/chat` | AI聊天对话 | analytics:chat |

## 7. 文件管理 `/files`

| 方法 | 接口 | 说明 | 权限 |
|------|------|------|------|
| POST | `/files/upload` | 文件上传 | files:upload |
| GET | `/files/{id}/download` | 文件下载 | files:download |
| GET | `/files/{id}` | 获取文件信息 | files:view |

## 8. 通用功能 `/common`

| 方法 | 接口 | 说明 | 权限 |
|------|------|------|------|
| GET | `/common/dictionaries` | 获取数据字典 | 无 |
| GET | `/common/logs` | 获取操作日志 | logs:view |
| GET | `/common/notifications` | 获取系统通知 | 需认证 |

## 标准请求/响应格式

### 分页查询参数
```json
{
    "page": 0,
    "size": 10,
    "sort": "createdAt,desc"
}
```

### 成功响应格式
```json
{
    "code": 0,
    "message": "操作成功",
    "data": {...},
    "timestamp": "2024-03-15T10:30:00Z"
}
```

### 错误响应格式
```json
{
    "code": 1001,
    "message": "错误原因",
    "details": {...},
    "timestamp": "2024-03-15T10:30:00Z"
}
```

## 权限说明

### 基础权限
- `view`: 查看权限
- `create`: 创建权限
- `edit`: 编辑权限
- `delete`: 删除权限

### 模块权限
- `leads:*`: 线索管理权限
- `customers:*`: 客户管理权限
- `orders:*`: 订单管理权限
- `campaigns:*`: 活动管理权限
- `users:*`: 用户管理权限
- `roles:*`: 角色管理权限
- `analytics:*`: AI分析权限

## 快速测试

### 登录获取Token
```bash
curl -X POST http://localhost:50001/api/auth/login \
-H "Content-Type: application/json" \
-d '{"username": "admin", "password": "admin123"}'
```

### 使用Token访问接口
```bash
curl -X GET http://localhost:50001/api/sales/leads \
-H "Authorization: Bearer YOUR_JWT_TOKEN"
```
