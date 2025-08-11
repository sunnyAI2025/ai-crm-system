// 销售模块相关类型定义

// 线索
export interface Lead {
  id: number;
  name: string;
  phone: string;
  businessType?: string;
  sourceChannel?: string;
  sourceType?: number;
  campaignId?: number;
  campaignName?: string;
  assignedUser?: {
    id: number;
    name: string;
  };
  assignedTime?: string;
  intentionLevel: number;
  intentionLevelText?: string;
  followStatus: number;
  followStatusText?: string;
  isConverted: boolean;
  createdAt: string;
  updatedAt: string;
}

// 客户
export interface Customer {
  id: number;
  name: string;
  phone: string;
  businessType?: string;
  sourceChannel?: string;
  sourceLeadId?: number;
  assignedUser?: {
    id: number;
    name: string;
  };
  customerLevel: number;
  customerLevelText?: string;
  customerStatus: number;
  customerStatusText?: string;
  nextVisitTime?: string;
  totalOrderAmount?: number;
  orderCount?: number;
  orders?: Order[];
  trackingRecords?: TrackingRecord[];
  createdAt: string;
  updatedAt: string;
}

// 订单
export interface Order {
  id: number;
  orderNo: string;
  customer?: {
    id: number;
    name: string;
    phone: string;
  };
  totalAmount: number;
  paidAmount: number;
  unpaidAmount?: number;
  orderStatus: number;
  orderStatusText?: string;
  paymentStatus: number;
  paymentStatusText?: string;
  assignedUser?: {
    id: number;
    name: string;
  };
  orderDate: string;
  items?: OrderItem[];
  payments?: Payment[];
  serviceRecords?: ServiceRecord[];
  createdAt: string;
  updatedAt: string;
}

// 订单项
export interface OrderItem {
  id: number;
  productName: string;
  productType?: string;
  price: number;
  quantity: number;
  servicePeriod?: number;
  serviceStartDate?: string;
  serviceEndDate?: string;
  consumptionStatus?: number;
  consumptionProgress?: string;
  remarks?: string;
}

// 支付记录
export interface Payment {
  id: number;
  paymentNo: string;
  paymentAmount: number;
  paymentMethod: string;
  paymentTime: string;
  paymentStatus: number;
  paymentType: number;
  paymentTypeText?: string;
  transactionId?: string;
  remarks?: string;
}

// 服务记录
export interface ServiceRecord {
  id: number;
  recordType: string;
  description: string;
  createdAt: string;
}

// 跟踪记录
export interface TrackingRecord {
  id: number;
  targetType: number;
  targetId: number;
  content: string;
  recordType?: string;
  contactMethod?: string;
  intentionLevel?: number;
  nextFollowTime?: string;
  creator?: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// 线索查询请求
export interface LeadQueryRequest {
  page?: number;
  size?: number;
  sort?: string;
  name?: string;
  phone?: string;
  businessType?: string;
  sourceChannel?: string;
  assignedUserId?: number;
  intentionLevel?: number;
  followStatus?: number;
  startDate?: string;
  endDate?: string;
}

// 线索创建请求
export interface CreateLeadRequest {
  name: string;
  phone: string;
  businessType?: string;
  sourceChannel?: string;
  sourceType?: number;
  campaignId?: number;
  assignedUserId?: number;
  intentionLevel?: number;
}
