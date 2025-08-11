import React from 'react';
import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

// 自定义渲染函数，包含必要的Provider
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConfigProvider locale={zhCN}>
      {children}
    </ConfigProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock API响应数据
export const mockApiResponse = <T,>(data: T) => ({
  code: 0,
  message: '操作成功',
  data,
  timestamp: new Date().toISOString(),
});

// Mock 用户数据
export const mockUser = {
  id: 1,
  username: 'testuser',
  name: '测试用户',
  phone: '13800138000',
  avatar: 'https://example.com/avatar.jpg',
  department: {
    id: 1,
    name: '技术部',
  },
  role: {
    id: 1,
    name: '系统管理员',
  },
  status: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Mock 线索数据
export const mockLead = {
  id: 1,
  name: '张三',
  phone: '13800138001',
  businessType: '会计培训',
  sourceChannel: 'SEM搜索',
  assignedUser: {
    id: 1,
    name: '销售员A',
  },
  intentionLevel: 1,
  followStatus: 1,
  isConverted: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
