// API响应通用接口
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp?: string;
}

// 分页响应接口
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// 分页请求参数
export interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
}

// 错误响应接口
export interface ErrorResponse {
  code: number;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}
