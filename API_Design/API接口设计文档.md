# CRM系统API接口设计文档

## 概述

本文档详细定义了CRM系统的RESTful API接口规范，包括认证、销售管理、营销管理、系统管理和AI数据分析等所有功能模块的接口。

## 设计原则

### 1. RESTful规范
- 使用标准HTTP方法：GET(查询)、POST(创建)、PUT(更新)、DELETE(删除)
- 资源导向的URL设计
- 统一的响应格式
- 合理的HTTP状态码

### 2. 安全认证
- JWT Token认证机制
- API网关统一鉴权
- 基于角色的权限控制

### 3. 统一响应格式
```json
{
    "code": 0,
    "message": "操作成功",
    "data": {
        "content": [...],
        "page": 0,
        "size": 10,
        "totalElements": 100,
        "totalPages": 10
    },
    "timestamp": "2024-03-15T10:30:00Z"
}
```

## API基础信息

### Base URL
- **开发环境**: `http://localhost:50001/api`
- **生产环境**: `https://your-domain.com/api`

### 认证方式
```
Authorization: Bearer <JWT_TOKEN>
```

### 通用请求头
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer <JWT_TOKEN>
```

## 1. 认证模块 API

### 1.1 用户登录
**接口**: `POST /auth/login`
**说明**: 用户登录获取JWT令牌
**权限**: 无需认证

**请求参数**:
```json
{
    "username": "admin",
    "password": "admin123"
}
```

**响应示例**:
```json
{
    "code": 0,
    "message": "登录成功",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "id": 1,
            "username": "admin",
            "name": "系统管理员",
            "phone": "13800138000",
            "avatar": "http://example.com/avatar.jpg",
            "department": {
                "id": 1,
                "name": "总部"
            },
            "role": {
                "id": 1,
                "name": "系统管理员",
                "permissions": {...}
            }
        },
        "expiresIn": 86400
    }
}
```

### 1.2 用户登出
**接口**: `POST /auth/logout`
**说明**: 用户登出，使token失效
**权限**: 需要认证

**请求参数**: 无

**响应示例**:
```json
{
    "code": 0,
    "message": "登出成功"
}
```

### 1.3 刷新Token
**接口**: `POST /auth/refresh`
**说明**: 刷新JWT令牌
**权限**: 需要认证

**响应示例**:
```json
{
    "code": 0,
    "message": "Token刷新成功",
    "data": {
        "token": "新的JWT令牌",
        "expiresIn": 86400
    }
}
```

### 1.4 获取当前用户信息
**接口**: `GET /auth/me`
**说明**: 获取当前登录用户的详细信息
**权限**: 需要认证

**响应示例**:
```json
{
    "code": 0,
    "message": "获取成功",
    "data": {
        "id": 1,
        "username": "admin",
        "name": "系统管理员",
        "phone": "13800138000",
        "avatar": "http://example.com/avatar.jpg",
        "description": "系统管理员",
        "department": {...},
        "role": {...},
        "lastLoginTime": "2024-03-15T09:30:00Z",
        "loginCount": 125,
        "onlineHours": 156
    }
}
```

## 2. 销售管理模块 API

### 2.1 线索管理 API

#### 2.1.1 获取线索列表
**接口**: `GET /sales/leads`
**说明**: 分页查询线索列表，支持多条件筛选
**权限**: leads:view

**请求参数**:
```json
{
    "page": 0,
    "size": 10,
    "sort": "createdAt,desc",
    "name": "张明",
    "phone": "13856784321",
    "businessType": "会计培训",
    "sourceChannel": "SEM搜索",
    "assignedUserId": 2,
    "intentionLevel": 1,
    "followStatus": 2,
    "startDate": "2024-03-01",
    "endDate": "2024-03-15"
}
```

**响应示例**:
```json
{
    "code": 0,
    "message": "查询成功",
    "data": {
        "content": [
            {
                "id": 1,
                "name": "张明",
                "phone": "138****789",
                "businessType": "会计培训",
                "sourceChannel": "SEM搜索",
                "sourceType": 1,
                "campaignId": 5,
                "campaignName": "春季招生活动",
                "assignedUser": {
                    "id": 2,
                    "name": "李华"
                },
                "assignedTime": "2024-03-15T10:00:00Z",
                "intentionLevel": 1,
                "intentionLevelText": "高",
                "followStatus": 2,
                "followStatusText": "跟进中",
                "isConverted": false,
                "createdAt": "2024-03-15T08:30:00Z",
                "updatedAt": "2024-03-15T10:15:00Z"
            }
        ],
        "page": 0,
        "size": 10,
        "totalElements": 186,
        "totalPages": 19
    }
}
```

#### 2.1.2 创建线索
**接口**: `POST /sales/leads`
**说明**: 创建新线索
**权限**: leads:create

**请求参数**:
```json
{
    "name": "王小明",
    "phone": "13912345678",
    "businessType": "学历提升",
    "sourceChannel": "表单填写",
    "sourceType": 0,
    "campaignId": 3,
    "assignedUserId": 2,
    "intentionLevel": 2
}
```

**响应示例**:
```json
{
    "code": 0,
    "message": "创建成功",
    "data": {
        "id": 187,
        "name": "王小明",
        "phone": "139****5678",
        "businessType": "学历提升",
        "sourceChannel": "表单填写",
        "followStatus": 1,
        "followStatusText": "待跟进",
        "createdAt": "2024-03-15T11:00:00Z"
    }
}
```

#### 2.1.3 更新线索
**接口**: `PUT /sales/leads/{id}`
**说明**: 更新线索信息
**权限**: leads:edit

**请求参数**:
```json
{
    "name": "王小明",
    "phone": "13912345678",
    "businessType": "学历提升",
    "assignedUserId": 3,
    "intentionLevel": 1,
    "followStatus": 2
}
```

#### 2.1.4 删除线索
**接口**: `DELETE /sales/leads/{id}`
**说明**: 删除线索（软删除）
**权限**: leads:delete

#### 2.1.5 批量分配线索
**接口**: `POST /sales/leads/batch-assign`
**说明**: 批量分配线索给销售人员
**权限**: leads:assign

**请求参数**:
```json
{
    "leadIds": [1, 2, 3, 4, 5],
    "assignedUserId": 2
}
```

#### 2.1.6 线索转化为客户
**接口**: `POST /sales/leads/{id}/convert`
**说明**: 将线索转化为客户
**权限**: leads:convert

**请求参数**:
```json
{
    "customerLevel": 3,
    "nextVisitTime": "2024-03-20T10:00:00Z"
}
```

#### 2.1.7 获取线索详情
**接口**: `GET /sales/leads/{id}`
**说明**: 获取线索详细信息，包括跟踪记录
**权限**: leads:view

**响应示例**:
```json
{
    "code": 0,
    "message": "查询成功",
    "data": {
        "id": 1,
        "name": "张明",
        "phone": "138****789",
        "businessType": "会计培训",
        "sourceChannel": "SEM搜索",
        "sourceType": 1,
        "assignedUser": {...},
        "intentionLevel": 1,
        "followStatus": 2,
        "trackingRecords": [
            {
                "id": 1,
                "recordType": "首次接触",
                "content": "客户对会计培训课程很感兴趣...",
                "contactMethod": "电话",
                "intentionLevel": 1,
                "creator": {
                    "id": 2,
                    "name": "李华"
                },
                "createdAt": "2024-03-15T14:30:00Z"
            }
        ],
        "createdAt": "2024-03-15T08:30:00Z",
        "updatedAt": "2024-03-15T10:15:00Z"
    }
}
```

#### 2.1.8 添加跟踪记录
**接口**: `POST /sales/leads/{id}/tracking`
**说明**: 为线索添加跟踪记录
**权限**: leads:edit

**请求参数**:
```json
{
    "recordType": "跟进沟通",
    "content": "详细介绍了课程内容，客户询问了价格和上课时间",
    "contactMethod": "微信",
    "nextFollowTime": "2024-03-18T10:00:00Z",
    "intentionLevel": 1
}
```

### 2.2 客户管理 API

#### 2.2.1 获取客户列表
**接口**: `GET /sales/customers`
**说明**: 分页查询客户列表，支持多条件筛选
**权限**: customers:view

**请求参数**:
```json
{
    "page": 0,
    "size": 10,
    "sort": "createdAt,desc",
    "name": "张明",
    "phone": "138",
    "businessType": "会计培训",
    "sourceChannel": "SEM搜索",
    "assignedUserId": 2,
    "customerLevel": 4,
    "customerStatus": 3,
    "startDate": "2024-03-01",
    "endDate": "2024-03-15"
}
```

**响应示例**:
```json
{
    "code": 0,
    "message": "查询成功",
    "data": {
        "content": [
            {
                "id": 1,
                "name": "张明",
                "phone": "138****789",
                "businessType": "会计培训",
                "sourceChannel": "SEM搜索",
                "sourceLeadId": 1,
                "assignedUser": {
                    "id": 2,
                    "name": "李华"
                },
                "customerLevel": 4,
                "customerLevelText": "⭐⭐⭐⭐",
                "customerStatus": 3,
                "customerStatusText": "已成单",
                "nextVisitTime": "2024-03-20T10:00:00Z",
                "totalOrderAmount": 2980.00,
                "orderCount": 1,
                "createdAt": "2024-03-17T15:45:00Z",
                "updatedAt": "2024-03-17T16:00:00Z"
            }
        ],
        "page": 0,
        "size": 10,
        "totalElements": 856,
        "totalPages": 86
    }
}
```

#### 2.2.2 创建客户
**接口**: `POST /sales/customers`
**说明**: 创建新客户
**权限**: customers:create

#### 2.2.3 更新客户
**接口**: `PUT /sales/customers/{id}`
**说明**: 更新客户信息
**权限**: customers:edit

#### 2.2.4 获取客户详情
**接口**: `GET /sales/customers/{id}`
**说明**: 获取客户详细信息，包括成单记录和跟踪记录
**权限**: customers:view

**响应示例**:
```json
{
    "code": 0,
    "message": "查询成功",
    "data": {
        "id": 1,
        "name": "张明",
        "phone": "138****789",
        "businessType": "会计培训",
        "sourceChannel": "SEM搜索",
        "assignedUser": {...},
        "customerLevel": 4,
        "customerStatus": 3,
        "nextVisitTime": "2024-03-20T10:00:00Z",
        "totalOrderAmount": 2980.00,
        "orderCount": 1,
        "orders": [
            {
                "id": 1,
                "orderNo": "ORD2024001",
                "totalAmount": 2980.00,
                "orderStatus": 4,
                "orderStatusText": "进行中",
                "orderDate": "2024-03-17T15:45:00Z"
            }
        ],
        "trackingRecords": [...],
        "createdAt": "2024-03-17T15:45:00Z"
    }
}
```

#### 2.2.5 客户跟踪记录
**接口**: `POST /sales/customers/{id}/tracking`
**说明**: 为客户添加跟踪记录
**权限**: customers:edit

### 2.3 成单管理 API

#### 2.3.1 获取订单列表
**接口**: `GET /sales/orders`
**说明**: 分页查询订单列表，支持多条件筛选
**权限**: orders:view

**请求参数**:
```json
{
    "page": 0,
    "size": 10,
    "sort": "orderDate,desc",
    "orderNo": "ORD240001",
    "customerName": "张明",
    "productName": "会计初级班",
    "orderStatus": 4,
    "paymentStatus": 3,
    "assignedUserId": 2,
    "minAmount": 1000,
    "maxAmount": 5000,
    "startDate": "2024-03-01",
    "endDate": "2024-03-15"
}
```

**响应示例**:
```json
{
    "code": 0,
    "message": "查询成功",
    "data": {
        "content": [
            {
                "id": 1,
                "orderNo": "ORD240001",
                "customer": {
                    "id": 1,
                    "name": "张明",
                    "phone": "138****789"
                },
                "totalAmount": 2980.00,
                "paidAmount": 2980.00,
                "unpaidAmount": 0.00,
                "orderStatus": 4,
                "orderStatusText": "进行中",
                "paymentStatus": 3,
                "paymentStatusText": "已支付",
                "assignedUser": {
                    "id": 2,
                    "name": "李华"
                },
                "orderDate": "2024-03-17T15:45:00Z",
                "items": [
                    {
                        "id": 1,
                        "productName": "会计初级班",
                        "price": 2980.00,
                        "servicePeriod": 6,
                        "consumptionStatus": 2,
                        "consumptionProgress": "2/6个月"
                    }
                ]
            }
        ],
        "page": 0,
        "size": 10,
        "totalElements": 456,
        "totalPages": 46
    }
}
```

#### 2.3.2 创建订单
**接口**: `POST /sales/orders`
**说明**: 创建新订单
**权限**: orders:create

**请求参数**:
```json
{
    "customerId": 1,
    "items": [
        {
            "productName": "会计初级班",
            "productType": "培训课程",
            "price": 2980.00,
            "quantity": 1,
            "servicePeriod": 6,
            "serviceStartDate": "2024-03-20",
            "remarks": "课程进度正常"
        }
    ],
    "assignedUserId": 2
}
```

#### 2.3.3 更新订单
**接口**: `PUT /sales/orders/{id}`
**说明**: 更新订单信息
**权限**: orders:edit

#### 2.3.4 获取订单详情
**接口**: `GET /sales/orders/{id}`
**说明**: 获取订单详细信息，包括商品和支付记录
**权限**: orders:view

**响应示例**:
```json
{
    "code": 0,
    "message": "查询成功",
    "data": {
        "id": 1,
        "orderNo": "ORD240001",
        "customer": {...},
        "totalAmount": 2980.00,
        "paidAmount": 2980.00,
        "unpaidAmount": 0.00,
        "orderStatus": 4,
        "paymentStatus": 3,
        "assignedUser": {...},
        "orderDate": "2024-03-17T15:45:00Z",
        "items": [
            {
                "id": 1,
                "productName": "会计初级班",
                "productType": "培训课程",
                "price": 2980.00,
                "quantity": 1,
                "servicePeriod": 6,
                "serviceStartDate": "2024-03-20",
                "serviceEndDate": "2024-09-20",
                "consumptionStatus": 2,
                "consumptionProgress": "2/6个月",
                "remarks": "课程进度正常"
            }
        ],
        "payments": [
            {
                "id": 1,
                "paymentNo": "WX2024031701",
                "paymentAmount": 1000.00,
                "paymentMethod": "微信支付",
                "paymentTime": "2024-03-17T16:00:00Z",
                "paymentStatus": 1,
                "paymentType": 1,
                "paymentTypeText": "定金"
            },
            {
                "id": 2,
                "paymentNo": "ZFB240318001",
                "paymentAmount": 1980.00,
                "paymentMethod": "支付宝",
                "paymentTime": "2024-03-18T10:30:00Z",
                "paymentStatus": 1,
                "paymentType": 2,
                "paymentTypeText": "尾款"
            }
        ],
        "serviceRecords": [
            {
                "id": 1,
                "recordType": "订单创建",
                "description": "客户确认报名会计初级班，已收取定金¥1,000",
                "createdAt": "2024-03-17T16:00:00Z"
            }
        ]
    }
}
```

#### 2.3.5 添加支付记录
**接口**: `POST /sales/orders/{id}/payments`
**说明**: 为订单添加支付记录
**权限**: orders:edit

**请求参数**:
```json
{
    "paymentAmount": 1980.00,
    "paymentMethod": "支付宝",
    "paymentChannel": "支付宝",
    "paymentType": 2,
    "transactionId": "ZFB240318001",
    "remarks": "尾款支付"
}
```

#### 2.3.6 更新订单状态
**接口**: `PUT /sales/orders/{id}/status`
**说明**: 更新订单状态
**权限**: orders:edit

**请求参数**:
```json
{
    "orderStatus": 5,
    "completionDate": "2024-09-20T16:00:00Z",
    "remarks": "课程已完成"
}
```

## 3. 营销管理模块 API

### 3.1 推广活动管理 API

#### 3.1.1 获取活动列表
**接口**: `GET /marketing/campaigns`
**说明**: 分页查询推广活动列表
**权限**: campaigns:view

**请求参数**:
```json
{
    "page": 0,
    "size": 10,
    "sort": "createdAt,desc",
    "name": "春季招生",
    "channelType": "SEM搜索",
    "campaignStatus": 1,
    "creatorId": 3,
    "startDate": "2024-03-01",
    "endDate": "2024-03-31"
}
```

**响应示例**:
```json
{
    "code": 0,
    "message": "查询成功",
    "data": {
        "content": [
            {
                "id": 1,
                "name": "春季招生活动",
                "channelType": "SEM搜索",
                "channelName": "百度推广",
                "campaignUrl": "https://crm.company.com/form/spring2024",
                "startDate": "2024-03-01",
                "endDate": "2024-04-30",
                "totalBudget": 50000.00,
                "actualCost": 12800.00,
                "pvCount": 2456,
                "uvCount": 1823,
                "leadsCount": 186,
                "conversionCount": 45,
                "conversionRate": 24.2,
                "roi": 15.8,
                "campaignStatus": 1,
                "campaignStatusText": "进行中",
                "creator": {
                    "id": 3,
                    "name": "王芳"
                },
                "createdAt": "2024-03-01T10:00:00Z"
            }
        ],
        "page": 0,
        "size": 10,
        "totalElements": 45,
        "totalPages": 5
    }
}
```

#### 3.1.2 创建推广活动
**接口**: `POST /marketing/campaigns`
**说明**: 创建新的推广活动
**权限**: campaigns:create

**请求参数**:
```json
{
    "name": "夏季学历提升活动",
    "channelType": "表单推广",
    "channelName": "官网表单",
    "startDate": "2024-06-01",
    "endDate": "2024-08-31",
    "totalBudget": 30000.00,
    "dailyBudget": 300.00,
    "landingPageConfig": {
        "title": "学历提升专场",
        "description": "提升学历，改变未来",
        "backgroundColor": "#007bff",
        "buttonText": "立即报名"
    },
    "formConfig": {
        "fields": [
            {
                "name": "name",
                "type": "text",
                "label": "姓名",
                "required": true,
                "placeholder": "请输入您的姓名"
            },
            {
                "name": "phone",
                "type": "tel",
                "label": "手机号",
                "required": true,
                "validation": "phone"
            },
            {
                "name": "businessType",
                "type": "select",
                "label": "学历类型",
                "required": true,
                "options": ["专升本", "高起专", "高起本"]
            }
        ]
    }
}
```

#### 3.1.3 更新推广活动
**接口**: `PUT /marketing/campaigns/{id}`
**说明**: 更新推广活动信息
**权限**: campaigns:edit

#### 3.1.4 获取活动详情
**接口**: `GET /marketing/campaigns/{id}`
**说明**: 获取推广活动详细信息和统计数据
**权限**: campaigns:view

**响应示例**:
```json
{
    "code": 0,
    "message": "查询成功",
    "data": {
        "id": 1,
        "name": "春季招生活动",
        "channelType": "SEM搜索",
        "channelName": "百度推广",
        "campaignUrl": "https://crm.company.com/form/spring2024",
        "qrCodeUrl": "https://crm.company.com/qr/spring2024.png",
        "startDate": "2024-03-01",
        "endDate": "2024-04-30",
        "totalBudget": 50000.00,
        "dailyBudget": 500.00,
        "actualCost": 12800.00,
        "pvCount": 2456,
        "uvCount": 1823,
        "leadsCount": 186,
        "conversionCount": 45,
        "conversionRate": 24.2,
        "roi": 15.8,
        "campaignStatus": 1,
        "landingPageConfig": {...},
        "formConfig": {...},
        "dailyStats": [
            {
                "statDate": "2024-03-15",
                "dailyPv": 120,
                "dailyUv": 89,
                "dailyLeads": 8,
                "dailyConversion": 2,
                "dailyCost": 580.00,
                "dailyConversionRate": 25.0
            }
        ],
        "leadsGenerated": [
            {
                "id": 1,
                "name": "张明",
                "phone": "138****789",
                "businessType": "会计培训",
                "isConverted": true,
                "createdAt": "2024-03-15T08:30:00Z"
            }
        ],
        "createdAt": "2024-03-01T10:00:00Z"
    }
}
```

#### 3.1.5 暂停/启动活动
**接口**: `PUT /marketing/campaigns/{id}/status`
**说明**: 更改活动状态
**权限**: campaigns:edit

**请求参数**:
```json
{
    "campaignStatus": 2,
    "reason": "预算已用完，暂停投放"
}
```

#### 3.1.6 复制活动
**接口**: `POST /marketing/campaigns/{id}/copy`
**说明**: 复制现有活动创建新活动
**权限**: campaigns:create

**请求参数**:
```json
{
    "name": "夏季招生活动",
    "startDate": "2024-06-01",
    "endDate": "2024-08-31"
}
```

#### 3.1.7 获取活动统计数据
**接口**: `GET /marketing/campaigns/{id}/stats`
**说明**: 获取活动的详细统计数据
**权限**: campaigns:view

**请求参数**:
```json
{
    "startDate": "2024-03-01",
    "endDate": "2024-03-15",
    "granularity": "day"
}
```

## 4. 系统管理模块 API

### 4.1 账号管理 API

#### 4.1.1 获取用户列表
**接口**: `GET /system/users`
**说明**: 分页查询用户列表
**权限**: users:view

**请求参数**:
```json
{
    "page": 0,
    "size": 10,
    "sort": "createdAt,desc",
    "name": "张明",
    "username": "admin",
    "phone": "138",
    "departmentId": 2,
    "roleId": 3,
    "status": 1
}
```

**响应示例**:
```json
{
    "code": 0,
    "message": "查询成功",
    "data": {
        "content": [
            {
                "id": 1,
                "username": "admin",
                "name": "系统管理员",
                "phone": "138****000",
                "avatar": "http://example.com/avatar.jpg",
                "department": {
                    "id": 1,
                    "name": "总部"
                },
                "role": {
                    "id": 1,
                    "name": "系统管理员"
                },
                "status": 1,
                "statusText": "正常",
                "lastLoginTime": "2024-03-15T09:30:00Z",
                "loginCount": 125,
                "onlineHours": 156,
                "createdAt": "2024-03-01T10:30:00Z"
            }
        ],
        "page": 0,
        "size": 10,
        "totalElements": 45,
        "totalPages": 5
    }
}
```

#### 4.1.2 创建用户
**接口**: `POST /system/users`
**说明**: 创建新用户
**权限**: users:create

**请求参数**:
```json
{
    "username": "zhangming",
    "password": "123456",
    "name": "张明",
    "phone": "13812345678",
    "departmentId": 2,
    "roleId": 3,
    "description": "销售经理，负责华东区域销售工作"
}
```

#### 4.1.3 更新用户
**接口**: `PUT /system/users/{id}`
**说明**: 更新用户信息
**权限**: users:edit

#### 4.1.4 删除用户
**接口**: `DELETE /system/users/{id}`
**说明**: 删除用户（软删除）
**权限**: users:delete

#### 4.1.5 重置密码
**接口**: `PUT /system/users/{id}/password`
**说明**: 重置用户密码
**权限**: users:edit

**请求参数**:
```json
{
    "newPassword": "newPassword123"
}
```

#### 4.1.6 批量操作
**接口**: `POST /system/users/batch`
**说明**: 批量操作用户
**权限**: users:edit

**请求参数**:
```json
{
    "action": "activate",
    "userIds": [1, 2, 3, 4, 5]
}
```

### 4.2 角色管理 API

#### 4.2.1 获取角色列表
**接口**: `GET /system/roles`
**说明**: 分页查询角色列表
**权限**: roles:view

**响应示例**:
```json
{
    "code": 0,
    "message": "查询成功",
    "data": {
        "content": [
            {
                "id": 1,
                "name": "系统管理员",
                "description": "拥有所有权限的超级管理员",
                "department": {
                    "id": 1,
                    "name": "总部"
                },
                "permissionCount": 12,
                "userCount": 1,
                "status": 1,
                "statusText": "启用",
                "creator": {
                    "id": 1,
                    "name": "系统管理员"
                },
                "createdAt": "2024-01-01T10:00:00Z",
                "updatedAt": "2024-03-10T15:30:00Z"
            }
        ],
        "page": 0,
        "size": 10,
        "totalElements": 12,
        "totalPages": 2
    }
}
```

#### 4.2.2 创建角色
**接口**: `POST /system/roles`
**说明**: 创建新角色
**权限**: roles:create

**请求参数**:
```json
{
    "name": "客服专员",
    "description": "负责客户服务和售后支持",
    "departmentId": 2,
    "permissions": {
        "dashboard": {"view": true},
        "sales": {
            "customers": {"view": true, "edit": true},
            "orders": {"view": true}
        }
    }
}
```

#### 4.2.3 获取角色详情
**接口**: `GET /system/roles/{id}`
**说明**: 获取角色详细信息，包括权限配置和成员列表
**权限**: roles:view

**响应示例**:
```json
{
    "code": 0,
    "message": "查询成功",
    "data": {
        "id": 2,
        "name": "销售经理",
        "description": "销售部门经理，管理销售团队",
        "department": {...},
        "permissions": {
            "dashboard": {"view": true},
            "sales": {
                "leads": {"view": true, "create": true, "edit": true, "delete": true},
                "customers": {"view": true, "create": true, "edit": true, "delete": true},
                "orders": {"view": true, "create": true, "edit": true}
            },
            "marketing": {
                "campaigns": {"view": true}
            }
        },
        "members": [
            {
                "id": 2,
                "username": "zhangming",
                "name": "张明",
                "phone": "138****789",
                "status": 1,
                "lastLoginTime": "2024-03-15T09:30:00Z"
            }
        ],
        "usageStats": {
            "activeMembers": 3,
            "loginCount": 45,
            "avgOnlineHours": 6.5,
            "permissionUsage": {
                "leads": 95,
                "customers": 88,
                "orders": 76
            }
        },
        "createdAt": "2024-01-15T10:30:00Z"
    }
}
```

#### 4.2.4 更新角色
**接口**: `PUT /system/roles/{id}`
**说明**: 更新角色信息和权限
**权限**: roles:edit

#### 4.2.5 删除角色
**接口**: `DELETE /system/roles/{id}`
**说明**: 删除角色
**权限**: roles:delete

#### 4.2.6 复制角色
**接口**: `POST /system/roles/{id}/copy`
**说明**: 复制现有角色创建新角色
**权限**: roles:create

### 4.3 部门管理 API

#### 4.3.1 获取部门树
**接口**: `GET /system/departments/tree`
**说明**: 获取部门层级树结构
**权限**: departments:view

**响应示例**:
```json
{
    "code": 0,
    "message": "查询成功",
    "data": [
        {
            "id": 1,
            "name": "总部",
            "description": "公司总部",
            "parentId": 0,
            "manager": {
                "id": 1,
                "name": "系统管理员"
            },
            "memberCount": 1,
            "children": [
                {
                    "id": 2,
                    "name": "销售部",
                    "description": "负责产品销售和客户维护",
                    "parentId": 1,
                    "manager": {
                        "id": 2,
                        "name": "张明"
                    },
                    "memberCount": 8,
                    "children": []
                }
            ]
        }
    ]
}
```

#### 4.3.2 创建部门
**接口**: `POST /system/departments`
**说明**: 创建新部门
**权限**: departments:create

#### 4.3.3 更新部门
**接口**: `PUT /system/departments/{id}`
**说明**: 更新部门信息
**权限**: departments:edit

## 5. 仪表盘数据 API

### 5.1 首页统计数据
**接口**: `GET /dashboard/stats`
**说明**: 获取首页仪表盘统计数据
**权限**: dashboard:view

**请求参数**:
```json
{
    "period": "month",
    "startDate": "2024-03-01",
    "endDate": "2024-03-31"
}
```

**响应示例**:
```json
{
    "code": 0,
    "message": "查询成功",
    "data": {
        "leadsStats": {
            "currentMonth": 186,
            "historicalAvg": 152,
            "target": 200,
            "achievementRate": 93.0,
            "growthRate": 22.4
        },
        "orderStats": {
            "orderCount": 45,
            "totalAmount": 234500.00,
            "target": 250000.00,
            "achievementRate": 93.8,
            "avgOrderValue": 5211.11
        },
        "marketingStats": {
            "totalCost": 15600.00,
            "channelCount": 8,
            "activeChannels": 6,
            "roi": 15.0,
            "newChannels": 2
        },
        "salesStats": {
            "departmentCount": 3,
            "salesPersonCount": 12,
            "topSalespeople": [
                {
                    "id": 2,
                    "name": "张明",
                    "orderCount": 8,
                    "amount": 45000.00,
                    "rank": 1
                },
                {
                    "id": 3,
                    "name": "李华",
                    "orderCount": 6,
                    "amount": 38000.00,
                    "rank": 2
                }
            ]
        },
        "trendData": {
            "leadsTrend": [
                {"date": "2024-03-01", "value": 45},
                {"date": "2024-03-02", "value": 52},
                {"date": "2024-03-03", "value": 38}
            ],
            "conversionTrend": [
                {"date": "2024-03-01", "conversion": 12},
                {"date": "2024-03-02", "conversion": 15},
                {"date": "2024-03-03", "conversion": 8}
            ]
        },
        "leadsSourceStats": [
            {"source": "SEM搜索", "count": 45, "percentage": 40.9},
            {"source": "表单填写", "count": 32, "percentage": 29.1},
            {"source": "海报活动", "count": 18, "percentage": 16.4},
            {"source": "电话咨询", "count": 11, "percentage": 10.0}
        ],
        "todoItems": {
            "todayFollow": 23,
            "overdueFollow": 5,
            "weeklyVisit": 12
        },
        "keyMetrics": {
            "customerSatisfaction": 4.6,
            "avgResponseTime": 2,
            "conversionRate": 24.2,
            "avgOrderValue": 5211
        }
    }
}
```

### 5.2 趋势分析数据
**接口**: `GET /dashboard/trends`
**说明**: 获取趋势分析数据
**权限**: dashboard:view

### 5.3 导出报表
**接口**: `GET /dashboard/export`
**说明**: 导出仪表盘数据报表
**权限**: dashboard:export

## 6. AI数据分析模块 API

### 6.1 智能预测分析
**接口**: `POST /analytics/predict`
**说明**: 执行智能预测分析
**权限**: analytics:predict

**请求参数**:
```json
{
    "predictTarget": "sales_trend",
    "timeRange": "next_month",
    "dataSources": ["leads", "customers", "orders", "marketing"],
    "dimensions": ["time", "product", "channel", "salesperson"]
}
```

**响应示例**:
```json
{
    "code": 0,
    "message": "预测分析完成",
    "data": {
        "prediction": {
            "target": "下月销售预测",
            "predictedOrderCount": {"min": 52, "max": 58, "confidence": 85},
            "predictedAmount": {"min": 285000, "max": 315000, "confidence": 82},
            "keyFactors": [
                {"factor": "历史趋势", "impact": 15, "description": "4月是销售旺季"},
                {"factor": "推广活动", "impact": 8, "description": "当前推广活动预计带来额外线索"},
                {"factor": "经济环境", "impact": -3, "description": "宏观经济环境影响客户决策"}
            ]
        },
        "trendChart": {
            "labels": ["1月", "2月", "3月", "4月(预测)", "5月(预测)", "6月(预测)"],
            "actual": [180000, 210000, 234500, null, null, null],
            "predicted": [null, null, null, 300000, 280000, 320000]
        },
        "recommendations": {
            "shortTerm": [
                "加强对高意向客户的跟进力度",
                "优化现有推广活动的投放策略",
                "提前准备充足的课程资源"
            ],
            "mediumTerm": [
                "启动学历提升类产品的专项推广",
                "建立客户分层服务体系",
                "加强销售团队的技能培训"
            ],
            "longTerm": [
                "建立更完善的客户画像体系",
                "开发新的产品线以满足市场需求",
                "优化整体销售流程和管理制度"
            ]
        },
        "analysisTime": "2024-03-15T10:32:00Z",
        "dataQuality": {
            "completeness": 95,
            "accuracy": 92,
            "timeliness": 98
        }
    }
}
```

### 6.2 个性化推荐
**接口**: `POST /analytics/recommend`
**说明**: 获取个性化推荐
**权限**: analytics:recommend

**请求参数**:
```json
{
    "targetType": "customer",
    "targetId": 1,
    "recommendationType": "service_strategy",
    "context": {
        "customerLevel": 4,
        "businessType": "会计培训",
        "lastContactTime": "2024-03-10T14:00:00Z",
        "orderHistory": [1, 3]
    }
}
```

### 6.3 自动报告生成
**接口**: `POST /analytics/report`
**说明**: 生成AI分析报告
**权限**: analytics:report

**请求参数**:
```json
{
    "reportType": "sales_performance",
    "period": "monthly",
    "startDate": "2024-03-01",
    "endDate": "2024-03-31",
    "dimensions": ["department", "product", "channel"],
    "includeCharts": true,
    "includeRecommendations": true
}
```

### 6.4 风险评估
**接口**: `POST /analytics/risk`
**说明**: 执行风险评估分析
**权限**: analytics:risk

**请求参数**:
```json
{
    "riskType": "customer_churn",
    "analysisScope": "all_customers",
    "timeWindow": "next_3_months",
    "riskThreshold": 0.7
}
```

### 6.5 情感分析
**接口**: `POST /analytics/sentiment`
**说明**: 执行客户情感分析
**权限**: analytics:sentiment

**请求参数**:
```json
{
    "analysisType": "customer_feedback",
    "dataSource": "tracking_records",
    "timeRange": "last_month",
    "customerIds": [1, 2, 3]
}
```

### 6.6 AI聊天对话
**接口**: `POST /analytics/chat`
**说明**: AI聊天对话接口
**权限**: analytics:chat

**请求参数**:
```json
{
    "message": "帮我分析一下本月的销售趋势",
    "sessionId": "session_123456",
    "context": {
        "userId": 1,
        "currentPage": "dashboard",
        "filters": {...}
    }
}
```

**响应示例**:
```json
{
    "code": 0,
    "message": "分析完成",
    "data": {
        "response": "好的，我来为您分析本月的销售趋势。基于您的CRM数据，我发现：\n\n📊 本月销售数据概况：\n• 总成单数：45笔 (↑ 相比上月增长15%)\n• 总金额：¥234,500 (↑ 相比上月增长12%)\n• 平均客单价：¥5,211 (↓ 相比上月下降2.5%)\n\n🎯 关键趋势分析：\n1. 会计培训类订单占比最高(42%)，呈现上升趋势\n2. 学历提升类订单增长明显，建议重点关注\n3. 客单价下降可能与促销活动相关\n\n💡 建议采取的行动：\n• 加强高价值课程的推广力度\n• 优化促销策略，提升客单价\n• 重点跟进学历提升类的潜在客户",
        "sessionId": "session_123456",
        "actions": [
            {
                "type": "show_chart",
                "title": "查看详细图表",
                "data": {...}
            },
            {
                "type": "generate_report",
                "title": "生成完整报告",
                "action": "generate_sales_report"
            },
            {
                "type": "get_recommendations",
                "title": "更多建议",
                "action": "get_sales_recommendations"
            }
        ],
        "relatedQuestions": [
            "这个月哪个销售员业绩最好？",
            "哪个渠道的转化率最高？",
            "预测下个月的销售目标",
            "分析客户流失的主要原因"
        ],
        "timestamp": "2024-03-15T10:32:00Z"
    }
}
```

## 7. 文件管理 API

### 7.1 文件上传
**接口**: `POST /files/upload`
**说明**: 上传文件
**权限**: files:upload

**请求**: Multipart form-data
```
file: [文件数据]
referenceType: "avatar"
referenceId: 1
isPublic: false
```

**响应示例**:
```json
{
    "code": 0,
    "message": "上传成功",
    "data": {
        "id": 1,
        "originalName": "avatar.jpg",
        "fileName": "20240315_103000_avatar.jpg",
        "filePath": "/uploads/avatars/20240315_103000_avatar.jpg",
        "fileUrl": "http://example.com/uploads/avatars/20240315_103000_avatar.jpg",
        "fileSize": 152480,
        "fileType": "image/jpeg",
        "fileHash": "d41d8cd98f00b204e9800998ecf8427e"
    }
}
```

### 7.2 文件下载
**接口**: `GET /files/{id}/download`
**说明**: 下载文件
**权限**: files:download

### 7.3 获取文件信息
**接口**: `GET /files/{id}`
**说明**: 获取文件详细信息
**权限**: files:view

## 8. 通用功能 API

### 8.1 数据字典
**接口**: `GET /common/dictionaries`
**说明**: 获取数据字典
**权限**: 无需认证

**响应示例**:
```json
{
    "code": 0,
    "message": "查询成功",
    "data": {
        "businessTypes": [
            {"value": "会计培训", "label": "会计培训"},
            {"value": "学历提升", "label": "学历提升"},
            {"value": "职业资格", "label": "职业资格"},
            {"value": "技能培训", "label": "技能培训"}
        ],
        "sourceChannels": [
            {"value": "SEM搜索", "label": "SEM搜索"},
            {"value": "表单填写", "label": "表单填写"},
            {"value": "海报活动", "label": "海报活动"},
            {"value": "电话咨询", "label": "电话咨询"}
        ],
        "intentionLevels": [
            {"value": 1, "label": "高"},
            {"value": 2, "label": "中"},
            {"value": 3, "label": "低"}
        ],
        "orderStatuses": [
            {"value": 1, "label": "待付款"},
            {"value": 2, "label": "部分付款"},
            {"value": 3, "label": "已支付"},
            {"value": 4, "label": "进行中"},
            {"value": 5, "label": "已完成"},
            {"value": 6, "label": "已取消"}
        ]
    }
}
```

### 8.2 操作日志
**接口**: `GET /common/logs`
**说明**: 获取操作日志
**权限**: logs:view

### 8.3 系统通知
**接口**: `GET /common/notifications`
**说明**: 获取系统通知
**权限**: 需要认证

## 9. 错误处理

### 错误响应格式
```json
{
    "code": 1001,
    "message": "参数验证失败",
    "details": {
        "field": "phone",
        "error": "手机号格式不正确"
    },
    "timestamp": "2024-03-15T10:30:00Z"
}
```

### 常用错误码
| 错误码 | HTTP状态码 | 说明 |
|-------|-----------|------|
| 0 | 200 | 成功 |
| 1001 | 400 | 参数验证失败 |
| 1002 | 401 | 未授权，需要登录 |
| 1003 | 403 | 权限不足 |
| 1004 | 404 | 资源不存在 |
| 1005 | 409 | 数据冲突 |
| 1006 | 429 | 请求过于频繁 |
| 2001 | 500 | 服务器内部错误 |
| 2002 | 503 | 服务不可用 |

## 10. API测试示例

### Postman测试集合
```json
{
    "info": {
        "name": "CRM系统API测试",
        "description": "CRM系统完整API测试集合"
    },
    "variable": [
        {
            "key": "baseUrl",
            "value": "http://localhost:50001/api"
        },
        {
            "key": "token",
            "value": ""
        }
    ],
    "auth": {
        "type": "bearer",
        "bearer": [
            {
                "key": "token",
                "value": "{{token}}"
            }
        ]
    }
}
```

### cURL测试示例
```bash
# 用户登录
curl -X POST http://localhost:50001/api/auth/login \
-H "Content-Type: application/json" \
-d '{
    "username": "admin",
    "password": "admin123"
}'

# 获取线索列表
curl -X GET "http://localhost:50001/api/sales/leads?page=0&size=10" \
-H "Authorization: Bearer YOUR_JWT_TOKEN"

# 创建线索
curl -X POST http://localhost:50001/api/sales/leads \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-d '{
    "name": "测试客户",
    "phone": "13912345678",
    "businessType": "会计培训",
    "sourceChannel": "SEM搜索"
}'
```

## 总结

本API文档涵盖了CRM系统的所有核心功能，包括：

1. **认证模块**: 用户登录、权限验证、Token管理
2. **销售管理**: 线索、客户、订单的完整生命周期管理
3. **营销管理**: 推广活动的创建、管理和数据分析
4. **系统管理**: 用户、角色、部门的权限管理体系
5. **数据分析**: AI驱动的智能分析和预测功能
6. **文件管理**: 文件上传、下载和管理
7. **通用功能**: 数据字典、日志、通知等辅助功能

所有接口都遵循RESTful设计原则，提供统一的请求/响应格式，支持完整的权限控制和错误处理机制。
