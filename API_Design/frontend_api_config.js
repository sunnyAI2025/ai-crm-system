// CRM系统前端API配置文件
// 用于React前端项目的API接口配置

// ===============================================
// 基础配置
// ===============================================

// API基础地址配置
export const API_CONFIG = {
  // 开发环境
  DEV: {
    BASE_URL: 'http://localhost:50001/api',
    TIMEOUT: 10000,
  },
  // 生产环境
  PROD: {
    BASE_URL: 'https://your-domain.com/api',
    TIMEOUT: 15000,
  },
  // 当前环境
  CURRENT: process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV'
}

// 获取当前环境配置
export const getCurrentConfig = () => API_CONFIG[API_CONFIG.CURRENT]

// ===============================================
// API端点定义
// ===============================================

export const API_ENDPOINTS = {
  // 认证模块
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },

  // 销售管理模块
  SALES: {
    // 线索管理
    LEADS: {
      LIST: '/sales/leads',
      CREATE: '/sales/leads',
      DETAIL: (id) => `/sales/leads/${id}`,
      UPDATE: (id) => `/sales/leads/${id}`,
      DELETE: (id) => `/sales/leads/${id}`,
      BATCH_ASSIGN: '/sales/leads/batch-assign',
      CONVERT: (id) => `/sales/leads/${id}/convert`,
      TRACKING: (id) => `/sales/leads/${id}/tracking`,
    },
    // 客户管理
    CUSTOMERS: {
      LIST: '/sales/customers',
      CREATE: '/sales/customers',
      DETAIL: (id) => `/sales/customers/${id}`,
      UPDATE: (id) => `/sales/customers/${id}`,
      DELETE: (id) => `/sales/customers/${id}`,
      TRACKING: (id) => `/sales/customers/${id}/tracking`,
    },
    // 成单管理
    ORDERS: {
      LIST: '/sales/orders',
      CREATE: '/sales/orders',
      DETAIL: (id) => `/sales/orders/${id}`,
      UPDATE: (id) => `/sales/orders/${id}`,
      DELETE: (id) => `/sales/orders/${id}`,
      PAYMENTS: (id) => `/sales/orders/${id}/payments`,
      STATUS: (id) => `/sales/orders/${id}/status`,
    },
  },

  // 营销管理模块
  MARKETING: {
    CAMPAIGNS: {
      LIST: '/marketing/campaigns',
      CREATE: '/marketing/campaigns',
      DETAIL: (id) => `/marketing/campaigns/${id}`,
      UPDATE: (id) => `/marketing/campaigns/${id}`,
      DELETE: (id) => `/marketing/campaigns/${id}`,
      STATUS: (id) => `/marketing/campaigns/${id}/status`,
      COPY: (id) => `/marketing/campaigns/${id}/copy`,
      STATS: (id) => `/marketing/campaigns/${id}/stats`,
    },
  },

  // 系统管理模块
  SYSTEM: {
    // 用户管理
    USERS: {
      LIST: '/system/users',
      CREATE: '/system/users',
      DETAIL: (id) => `/system/users/${id}`,
      UPDATE: (id) => `/system/users/${id}`,
      DELETE: (id) => `/system/users/${id}`,
      PASSWORD: (id) => `/system/users/${id}/password`,
      BATCH: '/system/users/batch',
    },
    // 角色管理
    ROLES: {
      LIST: '/system/roles',
      CREATE: '/system/roles',
      DETAIL: (id) => `/system/roles/${id}`,
      UPDATE: (id) => `/system/roles/${id}`,
      DELETE: (id) => `/system/roles/${id}`,
      COPY: (id) => `/system/roles/${id}/copy`,
    },
    // 部门管理
    DEPARTMENTS: {
      TREE: '/system/departments/tree',
      CREATE: '/system/departments',
      UPDATE: (id) => `/system/departments/${id}`,
      DELETE: (id) => `/system/departments/${id}`,
    },
  },

  // 仪表盘数据
  DASHBOARD: {
    STATS: '/dashboard/stats',
    TRENDS: '/dashboard/trends',
    EXPORT: '/dashboard/export',
  },

  // AI数据分析
  ANALYTICS: {
    PREDICT: '/analytics/predict',
    RECOMMEND: '/analytics/recommend',
    REPORT: '/analytics/report',
    RISK: '/analytics/risk',
    SENTIMENT: '/analytics/sentiment',
    CHAT: '/analytics/chat',
  },

  // 文件管理
  FILES: {
    UPLOAD: '/files/upload',
    DOWNLOAD: (id) => `/files/${id}/download`,
    INFO: (id) => `/files/${id}`,
  },

  // 通用功能
  COMMON: {
    DICTIONARIES: '/common/dictionaries',
    LOGS: '/common/logs',
    NOTIFICATIONS: '/common/notifications',
  },
}

// ===============================================
// HTTP状态码定义
// ===============================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
}

// ===============================================
// 业务错误码定义
// ===============================================

export const BUSINESS_CODE = {
  SUCCESS: 0,
  PARAM_ERROR: 1001,
  UNAUTHORIZED: 1002,
  FORBIDDEN: 1003,
  NOT_FOUND: 1004,
  CONFLICT: 1005,
  TOO_MANY_REQUESTS: 1006,
  SERVER_ERROR: 2001,
  SERVICE_UNAVAILABLE: 2002,
}

// ===============================================
// 默认分页配置
// ===============================================

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 10,
  DEFAULT_SORT: 'createdAt,desc',
  SIZE_OPTIONS: [10, 20, 50, 100],
}

// ===============================================
// 请求配置
// ===============================================

export const REQUEST_CONFIG = {
  // 请求头配置
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // 超时配置
  TIMEOUT: getCurrentConfig().TIMEOUT,
  
  // 重试配置
  RETRY: {
    COUNT: 3,
    DELAY: 1000,
    METHODS: ['GET', 'POST', 'PUT', 'DELETE'],
  },
}

// ===============================================
// 数据字典配置
// ===============================================

export const DICT_CONFIG = {
  // 业务类型
  BUSINESS_TYPES: [
    { value: '会计培训', label: '会计培训' },
    { value: '学历提升', label: '学历提升' },
    { value: '职业资格', label: '职业资格' },
    { value: '技能培训', label: '技能培训' },
  ],
  
  // 来源渠道
  SOURCE_CHANNELS: [
    { value: 'SEM搜索', label: 'SEM搜索' },
    { value: '表单填写', label: '表单填写' },
    { value: '海报活动', label: '海报活动' },
    { value: '电话咨询', label: '电话咨询' },
  ],
  
  // 意向度
  INTENTION_LEVELS: [
    { value: 1, label: '高', color: '#52c41a' },
    { value: 2, label: '中', color: '#faad14' },
    { value: 3, label: '低', color: '#f5222d' },
  ],
  
  // 跟进状态
  FOLLOW_STATUS: [
    { value: 1, label: '待跟进', color: '#fa8c16' },
    { value: 2, label: '跟进中', color: '#1890ff' },
    { value: 3, label: '已转化', color: '#52c41a' },
    { value: 4, label: '无效', color: '#f5222d' },
  ],
  
  // 客户状态
  CUSTOMER_STATUS: [
    { value: 1, label: '潜在', color: '#faad14' },
    { value: 2, label: '跟进中', color: '#1890ff' },
    { value: 3, label: '已成单', color: '#52c41a' },
    { value: 4, label: '流失', color: '#f5222d' },
  ],
  
  // 订单状态
  ORDER_STATUS: [
    { value: 1, label: '待付款', color: '#fa8c16' },
    { value: 2, label: '部分付款', color: '#faad14' },
    { value: 3, label: '已支付', color: '#52c41a' },
    { value: 4, label: '进行中', color: '#1890ff' },
    { value: 5, label: '已完成', color: '#52c41a' },
    { value: 6, label: '已取消', color: '#f5222d' },
  ],
  
  // 支付状态
  PAYMENT_STATUS: [
    { value: 1, label: '待支付', color: '#fa8c16' },
    { value: 2, label: '部分付款', color: '#faad14' },
    { value: 3, label: '已支付', color: '#52c41a' },
  ],
  
  // 活动状态
  CAMPAIGN_STATUS: [
    { value: 1, label: '进行中', color: '#52c41a' },
    { value: 2, label: '已暂停', color: '#faad14' },
    { value: 3, label: '已结束', color: '#f5222d' },
  ],
}

// ===============================================
// 工具函数
// ===============================================

// 获取字典标签
export const getDictLabel = (dictKey, value) => {
  const dict = DICT_CONFIG[dictKey]
  if (!dict) return value
  
  const item = dict.find(item => item.value === value)
  return item ? item.label : value
}

// 获取字典颜色
export const getDictColor = (dictKey, value) => {
  const dict = DICT_CONFIG[dictKey]
  if (!dict) return undefined
  
  const item = dict.find(item => item.value === value)
  return item ? item.color : undefined
}

// 构建查询参数
export const buildQueryParams = (params) => {
  const query = new URLSearchParams()
  
  Object.keys(params).forEach(key => {
    const value = params[key]
    if (value !== null && value !== undefined && value !== '') {
      query.append(key, value)
    }
  })
  
  return query.toString()
}

// 构建分页参数
export const buildPaginationParams = ({
  page = PAGINATION_CONFIG.DEFAULT_PAGE,
  size = PAGINATION_CONFIG.DEFAULT_SIZE,
  sort = PAGINATION_CONFIG.DEFAULT_SORT,
  ...filters
}) => {
  return {
    page,
    size,
    sort,
    ...filters
  }
}

// ===============================================
// 请求拦截器配置
// ===============================================

export const REQUEST_INTERCEPTOR = {
  // 请求前拦截
  onRequest: (config) => {
    // 添加认证token
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加请求时间戳
    config.metadata = { startTime: new Date() }
    
    return config
  },
  
  // 请求错误拦截
  onRequestError: (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  },
}

// ===============================================
// 响应拦截器配置
// ===============================================

export const RESPONSE_INTERCEPTOR = {
  // 响应成功拦截
  onResponse: (response) => {
    // 计算请求耗时
    const { config } = response
    if (config.metadata) {
      const duration = new Date() - config.metadata.startTime
      console.log(`API ${config.url} took ${duration}ms`)
    }
    
    // 检查业务状态码
    const { data } = response
    if (data && data.code !== BUSINESS_CODE.SUCCESS) {
      console.warn('Business Error:', data)
      // 可以在这里处理统一的业务错误
    }
    
    return response
  },
  
  // 响应错误拦截
  onResponseError: (error) => {
    const { response } = error
    
    if (response) {
      switch (response.status) {
        case HTTP_STATUS.UNAUTHORIZED:
          // 处理未授权，跳转到登录页
          localStorage.removeItem('access_token')
          window.location.href = '/login'
          break
        case HTTP_STATUS.FORBIDDEN:
          // 处理权限不足
          console.error('权限不足')
          break
        case HTTP_STATUS.NOT_FOUND:
          console.error('资源不存在')
          break
        case HTTP_STATUS.TOO_MANY_REQUESTS:
          console.error('请求过于频繁')
          break
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          console.error('服务器内部错误')
          break
        default:
          console.error('请求失败:', response.status)
      }
    } else {
      // 网络错误
      console.error('网络错误:', error.message)
    }
    
    return Promise.reject(error)
  },
}

// ===============================================
// API服务类基础配置
// ===============================================

export const API_SERVICE_CONFIG = {
  baseURL: getCurrentConfig().BASE_URL,
  timeout: getCurrentConfig().TIMEOUT,
  headers: REQUEST_CONFIG.HEADERS,
  
  // Axios实例配置
  withCredentials: false,
  responseType: 'json',
  
  // 请求和响应拦截器
  interceptors: {
    request: REQUEST_INTERCEPTOR,
    response: RESPONSE_INTERCEPTOR,
  },
}

// ===============================================
// 导出默认配置
// ===============================================

export default {
  API_CONFIG,
  API_ENDPOINTS,
  HTTP_STATUS,
  BUSINESS_CODE,
  PAGINATION_CONFIG,
  REQUEST_CONFIG,
  DICT_CONFIG,
  API_SERVICE_CONFIG,
  
  // 工具函数
  getCurrentConfig,
  getDictLabel,
  getDictColor,
  buildQueryParams,
  buildPaginationParams,
}
