import axios from 'axios';
import { message } from 'antd';
import type { ApiResponse } from '@/types/api';

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:50001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理错误响应
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          message.error('登录已过期，请重新登录');
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_info');
          window.location.href = '/login';
          break;
        case 403:
          message.error('没有权限访问该资源');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器内部错误');
          break;
        default:
          message.error(data?.message || '请求失败');
      }
    } else if (error.request) {
      // 检查是否应该使用Mock数据
      if (import.meta.env.DEV) {
        console.warn('API请求失败，使用Mock数据', error.config?.url);
        return Promise.resolve(getMockResponse(error.config?.url, error.config?.method));
      }
      message.error('网络连接失败，请检查网络');
    } else {
      message.error('请求配置错误');
    }
    
    return Promise.reject(error);
  }
);

// Mock数据响应
function getMockResponse(url?: string, method?: string) {
  console.log(`Mock API调用: ${method?.toUpperCase()} ${url}`);
  
  const mockData: any = {
    data: {
      code: 0,
      message: '操作成功',
      timestamp: new Date().toISOString(),
    }
  };

  // 根据URL返回不同的Mock数据
  if (url?.includes('/auth/login')) {
    mockData.data.data = {
      token: 'mock-jwt-token-12345',
      tokenType: 'Bearer',
      expiresIn: 86400,
      userInfo: {
        id: 1,
        username: 'admin',
        name: '系统管理员',
        phone: '13800138000',
        avatar: '',
        departmentName: '技术部',
        roleName: '系统管理员',
      }
    };
  } else if (url?.includes('/dashboard/stats')) {
    mockData.data.data = {
      totalLeads: 1234,
      totalCustomers: 856,
      totalOrders: 432,
      totalRevenue: 125680,
    };
  } else if (url?.includes('/leads')) {
    if (method?.toLowerCase() === 'get') {
      mockData.data.data = {
        list: [
          {
            id: 1,
            name: '张三',
            phone: '13800138001',
            email: 'zhangsan@example.com',
            source: '网站咨询',
            status: '待跟进',
            assignedTo: '李销售',
            createdAt: '2024-01-15 10:30:00',
            notes: '对会计培训课程感兴趣',
          },
          {
            id: 2,
            name: '李四',
            phone: '13800138002',
            email: 'lisi@example.com',
            source: '电话营销',
            status: '已联系',
            assignedTo: '王销售',
            createdAt: '2024-01-14 15:20:00',
            notes: '需要企业内训服务',
          }
        ],
        total: 50,
        page: 1,
        pageSize: 10,
      };
    } else if (method?.toLowerCase() === 'delete') {
      // 删除操作的Mock响应
      mockData.data.message = '线索删除成功';
      mockData.data.data = { success: true };
    } else if (method?.toLowerCase() === 'post') {
      // 新增操作的Mock响应
      mockData.data.message = '线索创建成功';
      mockData.data.data = { id: Date.now() };
    } else if (method?.toLowerCase() === 'put') {
      // 编辑操作的Mock响应
      mockData.data.message = '线索更新成功';
      mockData.data.data = { id: Date.now() };
    } else {
      mockData.data.data = { id: Date.now() };
    }
  } else if (url?.includes('/customers')) {
    if (method?.toLowerCase() === 'get') {
      mockData.data.data = {
        list: [
          {
            id: 1,
            name: '王明',
            phone: '13900139001',
            email: 'wangming@company.com',
            company: '科技有限公司',
            industry: '互联网',
            level: 'A',
            status: '活跃',
            totalValue: 150000,
            assignedTo: '张经理',
            lastContact: '2024-01-10 14:30:00',
            createdAt: '2023-12-01 09:00:00',
            notes: '重要客户，每月定期跟进',
          },
          {
            id: 2,
            name: '刘华',
            phone: '13900139002',
            email: 'liuhua@edu.com',
            company: '教育培训中心',
            industry: '教育培训',
            level: 'B',
            status: '潜在',
            totalValue: 85000,
            assignedTo: '李经理',
            lastContact: '2024-01-08 16:20:00',
            createdAt: '2024-01-01 11:15:00',
            notes: '对在线课程感兴趣',
          },
          {
            id: 3,
            name: '陈总',
            phone: '13900139003',
            email: 'chen@manufacturing.com',
            company: '制造企业',
            industry: '制造业',
            level: 'A',
            status: '活跃',
            totalValue: 320000,
            assignedTo: '王经理',
            lastContact: '2024-01-12 10:45:00',
            createdAt: '2023-11-15 14:20:00',
            notes: '长期合作伙伴，年度大客户',
          }
        ],
        total: 35,
        page: 1,
        pageSize: 10,
      };
    } else {
      mockData.data.data = { id: Date.now() };
    }
  } else if (url?.includes('/orders')) {
    if (method?.toLowerCase() === 'get') {
      mockData.data.data = {
        list: [
          {
            id: 1,
            orderNo: 'ORD20240115001',
            customerName: '王明',
            customerPhone: '13900139001',
            productName: '会计基础培训',
            amount: 15000,
            status: '生产中',
            progress: 65,
            salesPerson: '张经理',
            orderDate: '2024-01-15 10:30:00',
            expectedDelivery: '2024-02-15',
            actualDelivery: '',
            createdAt: '2024-01-15 10:30:00',
            notes: '企业定制培训课程',
          },
          {
            id: 2,
            orderNo: 'ORD20240114002',
            customerName: '刘华',
            customerPhone: '13900139002',
            productName: '财务软件培训',
            amount: 8500,
            status: '已完成',
            progress: 100,
            salesPerson: '李经理',
            orderDate: '2024-01-14 14:20:00',
            expectedDelivery: '2024-01-25',
            actualDelivery: '2024-01-24',
            createdAt: '2024-01-14 14:20:00',
            notes: '在线培训已完成',
          },
          {
            id: 3,
            orderNo: 'ORD20240113003',
            customerName: '陈总',
            customerPhone: '13900139003',
            productName: '企业管理咨询',
            amount: 32000,
            status: '已确认',
            progress: 25,
            salesPerson: '王经理',
            orderDate: '2024-01-13 09:15:00',
            expectedDelivery: '2024-03-15',
            actualDelivery: '',
            createdAt: '2024-01-13 09:15:00',
            notes: '大型企业管理咨询项目',
          }
        ],
        total: 28,
        page: 1,
        pageSize: 10,
      };
    } else {
      mockData.data.data = { id: Date.now() };
    }
  } else if (url?.includes('/campaigns')) {
    if (method?.toLowerCase() === 'get') {
      mockData.data.data = {
        list: [
          {
            id: 1,
            name: '春季财务培训推广',
            type: '搜索引擎营销',
            status: '进行中',
            budget: 50000,
            spent: 32000,
            startDate: '2024-01-10',
            endDate: '2024-02-10',
            targetAudience: '财务人员',
            channels: ['百度推广', '微信朋友圈'],
            leads: 156,
            conversions: 23,
            conversionRate: 14.7,
            roi: 56.25,
            description: '针对企业财务人员的专业培训推广活动',
            createdAt: '2024-01-05 09:00:00',
            createdBy: '张经理',
          },
          {
            id: 2,
            name: '企业管理咨询服务推广',
            type: '社交媒体推广',
            status: '计划中',
            budget: 80000,
            spent: 15000,
            startDate: '2024-01-20',
            endDate: '2024-03-20',
            targetAudience: '企业管理者',
            channels: ['抖音广告', '微博推广'],
            leads: 89,
            conversions: 12,
            roi: 433.33,
            description: '面向中小企业管理者的咨询服务推广',
            createdAt: '2024-01-08 14:30:00',
            createdBy: '李经理',
          },
          {
            id: 3,
            name: '线下企业培训展会',
            type: '线下活动',
            status: '已完成',
            budget: 120000,
            spent: 118000,
            startDate: '2023-12-15',
            endDate: '2023-12-17',
            targetAudience: '中小企业主',
            channels: ['线下展会', '合作伙伴'],
            leads: 245,
            conversions: 38,
            roi: 1.69,
            description: '大型企业培训展会活动',
            createdAt: '2023-12-01 10:15:00',
            createdBy: '王经理',
          }
        ],
        total: 18,
        page: 1,
        pageSize: 10,
      };
    } else {
      mockData.data.data = { id: Date.now() };
    }
  } else if (url?.includes('/users')) {
    if (method?.toLowerCase() === 'get') {
      mockData.data.data = {
        list: [
          {
            id: 1,
            username: 'admin',
            name: '系统管理员',
            phone: '13800138000',
            email: 'admin@aicrm.com',
            avatar: '',
            department: '技术部',
            role: '系统管理员',
            status: 1,
            lastLogin: '2024-01-11 09:30:00',
            createdAt: '2023-12-01 10:00:00',
            description: '系统超级管理员账号',
          },
          {
            id: 2,
            username: 'sales_manager',
            name: '张销售',
            phone: '13800138001',
            email: 'zhang@aicrm.com',
            avatar: '',
            department: '销售部',
            role: '销售经理',
            status: 1,
            lastLogin: '2024-01-11 08:45:00',
            createdAt: '2024-01-01 14:20:00',
            description: '销售部门负责人',
          },
          {
            id: 3,
            username: 'marketing_staff',
            name: '李营销',
            phone: '13800138002',
            email: 'li@aicrm.com',
            avatar: '',
            department: '营销部',
            role: '营销专员',
            status: 1,
            lastLogin: '2024-01-10 17:20:00',
            createdAt: '2024-01-05 11:15:00',
            description: '负责线上营销推广',
          },
          {
            id: 4,
            username: 'customer_service',
            name: '王客服',
            phone: '13800138003',
            email: 'wang@aicrm.com',
            avatar: '',
            department: '客服部',
            role: '客服专员',
            status: 0,
            lastLogin: '2024-01-08 16:30:00',
            createdAt: '2024-01-03 09:45:00',
            description: '客户服务支持',
          }
        ],
        total: 12,
        page: 1,
        pageSize: 10,
      };
    } else {
      mockData.data.data = { id: Date.now() };
    }
  } else if (url?.includes('/roles')) {
    if (method?.toLowerCase() === 'get') {
      mockData.data.data = {
        list: [
          {
            id: 1,
            name: '系统管理员',
            code: 'SYSTEM_ADMIN',
            description: '系统最高权限，可以管理所有功能模块',
            permissions: ['dashboard.view', 'dashboard.export', 'leads.view', 'leads.create', 'leads.edit', 'leads.delete', 'customers.view', 'customers.create', 'customers.edit', 'customers.delete', 'orders.view', 'orders.create', 'orders.edit', 'orders.delete', 'campaigns.view', 'campaigns.create', 'campaigns.edit', 'campaigns.delete', 'system.users', 'system.roles', 'system.settings', 'system.logs'],
            userCount: 2,
            createdAt: '2023-12-01 10:00:00',
            updatedAt: '2024-01-01 15:30:00',
          },
          {
            id: 2,
            name: '销售经理',
            code: 'SALES_MANAGER',
            description: '销售部门管理者，可以管理线索、客户和订单',
            permissions: ['dashboard.view', 'leads.view', 'leads.create', 'leads.edit', 'leads.assign', 'customers.view', 'customers.create', 'customers.edit', 'customers.level', 'orders.view', 'orders.create', 'orders.edit', 'orders.approve'],
            userCount: 3,
            createdAt: '2023-12-01 10:15:00',
            updatedAt: '2024-01-05 09:20:00',
          },
          {
            id: 3,
            name: '销售专员',
            code: 'SALES_STAFF',
            description: '销售人员，可以管理分配给自己的线索和客户',
            permissions: ['dashboard.view', 'leads.view', 'leads.edit', 'customers.view', 'customers.edit', 'orders.view', 'orders.create'],
            userCount: 8,
            createdAt: '2023-12-01 10:30:00',
            updatedAt: '2024-01-03 14:45:00',
          },
          {
            id: 4,
            name: '营销专员',
            code: 'MARKETING_STAFF',
            description: '营销人员，主要负责营销活动和推广',
            permissions: ['dashboard.view', 'leads.view', 'campaigns.view', 'campaigns.create', 'campaigns.edit'],
            userCount: 4,
            createdAt: '2023-12-01 10:45:00',
            updatedAt: '2024-01-02 11:30:00',
          },
          {
            id: 5,
            name: '客服专员',
            code: 'CUSTOMER_SERVICE',
            description: '客服人员，主要负责客户咨询和售后服务',
            permissions: ['dashboard.view', 'leads.view', 'customers.view', 'customers.edit'],
            userCount: 6,
            createdAt: '2023-12-01 11:00:00',
            updatedAt: '2024-01-01 16:15:00',
          }
        ],
        total: 8,
        page: 1,
        pageSize: 10,
      };
    } else {
      mockData.data.data = { id: Date.now() };
    }
  }

  return mockData;
}

export default request;