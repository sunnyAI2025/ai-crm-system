// 用户相关类型定义

export interface User {
  id: number;
  username: string;
  name: string;
  phone?: string;
  avatar?: string;
  description?: string;
  department?: Department;
  role?: Role;
  status: number;
  lastLoginTime?: string;
  loginCount?: number;
  onlineHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  manager?: User;
  memberCount?: number;
  children?: Department[];
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: Record<string, unknown>;
  status: number;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

// 登录请求
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

// 用户创建请求
export interface CreateUserRequest {
  username: string;
  password: string;
  name: string;
  phone?: string;
  departmentId?: number;
  roleId?: number;
  description?: string;
}

// 用户查询请求
export interface UserQueryRequest {
  page?: number;
  size?: number;
  sort?: string;
  name?: string;
  username?: string;
  phone?: string;
  departmentId?: number;
  roleId?: number;
  status?: number;
}
