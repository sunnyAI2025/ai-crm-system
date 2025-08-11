// 应用常量配置

// API基础URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:50001/api';

// 本地存储键名
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_INFO: 'user_info',
  REFRESH_TOKEN: 'refresh_token',
} as const;

// 路由路径
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  SALES: {
    LEADS: '/sales/leads',
    CUSTOMERS: '/sales/customers',
    ORDERS: '/sales/orders',
  },
  MARKETING: {
    CAMPAIGNS: '/marketing/campaigns',
  },
  SYSTEM: {
    USERS: '/system/users',
    ROLES: '/system/roles',
  },
} as const;

// 页面大小选项
export const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];

// 默认页面大小
export const DEFAULT_PAGE_SIZE = 10;

// 数据字典
export const DICT = {
  // 意向等级
  INTENTION_LEVELS: [
    { value: 1, label: '高', color: 'red' },
    { value: 2, label: '中', color: 'orange' },
    { value: 3, label: '低', color: 'gray' },
  ],
  
  // 跟进状态
  FOLLOW_STATUS: [
    { value: 1, label: '待跟进', color: 'blue' },
    { value: 2, label: '跟进中', color: 'orange' },
    { value: 3, label: '已转化', color: 'green' },
    { value: 4, label: '无效', color: 'gray' },
  ],
  
  // 客户等级
  CUSTOMER_LEVELS: [
    { value: 1, label: '⭐', color: 'gray' },
    { value: 2, label: '⭐⭐', color: 'blue' },
    { value: 3, label: '⭐⭐⭐', color: 'orange' },
    { value: 4, label: '⭐⭐⭐⭐', color: 'gold' },
    { value: 5, label: '⭐⭐⭐⭐⭐', color: 'red' },
  ],
  
  // 订单状态
  ORDER_STATUS: [
    { value: 1, label: '待付款', color: 'blue' },
    { value: 2, label: '部分付款', color: 'orange' },
    { value: 3, label: '已支付', color: 'green' },
    { value: 4, label: '进行中', color: 'processing' },
    { value: 5, label: '已完成', color: 'success' },
    { value: 6, label: '已取消', color: 'error' },
  ],
  
  // 支付状态
  PAYMENT_STATUS: [
    { value: 1, label: '待支付', color: 'blue' },
    { value: 2, label: '部分付款', color: 'orange' },
    { value: 3, label: '已支付', color: 'green' },
  ],
  
  // 用户状态
  USER_STATUS: [
    { value: 1, label: '正常', color: 'green' },
    { value: 0, label: '禁用', color: 'red' },
  ],
  
  // 活动状态
  CAMPAIGN_STATUS: [
    { value: 1, label: '进行中', color: 'green' },
    { value: 2, label: '已暂停', color: 'orange' },
    { value: 0, label: '已结束', color: 'gray' },
  ],
  
  // 业务类型
  BUSINESS_TYPES: [
    '会计培训',
    '学历提升',
    '职业资格',
    '技能培训',
    '语言培训',
    '其他',
  ],
  
  // 来源渠道
  SOURCE_CHANNELS: [
    'SEM搜索',
    '表单填写',
    '海报活动',
    '电话咨询',
    '朋友推荐',
    '其他',
  ],
} as const;
