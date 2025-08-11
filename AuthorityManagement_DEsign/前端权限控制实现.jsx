/**
 * CRM系统前端权限控制实现
 * 
 * 包含：
 * 1. 权限Hook
 * 2. 权限组件
 * 3. 路由守卫
 * 4. 权限指令
 * 5. 权限工具类
 * 6. 权限状态管理
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { message, Spin } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { getUserPermissions, checkPermission } from '@/api/permission';

// ===============================================
// 1. 权限上下文
// ===============================================

/**
 * 权限上下文
 */
const PermissionContext = createContext({
  permissions: {},
  permissionStrings: [],
  dataScope: 'own_data',
  hasPermission: () => false,
  hasAnyPermission: () => false,
  hasAllPermissions: () => false,
  hasDataScope: () => false,
  loading: false,
  refresh: () => {}
});

/**
 * 权限提供者组件
 */
export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState({});
  const [permissionStrings, setPermissionStrings] = useState([]);
  const [dataScope, setDataScope] = useState('own_data');
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const userInfo = useSelector(state => state.user.userInfo);

  // 加载用户权限
  const loadPermissions = async () => {
    if (!userInfo?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getUserPermissions();
      
      if (response.code === 0) {
        const data = response.data;
        setPermissions(data.permissions);
        setPermissionStrings(data.permissionStrings || []);
        setDataScope(data.dataScope || 'own_data');
        
        // 缓存权限信息到Redux
        dispatch({
          type: 'user/setPermissions',
          payload: {
            permissions: data.permissions,
            permissionStrings: data.permissionStrings,
            dataScope: data.dataScope
          }
        });
        
        // 本地存储权限信息
        localStorage.setItem('user_permissions', JSON.stringify(data));
      }
    } catch (error) {
      console.error('加载用户权限失败:', error);
      message.error('加载权限信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 检查是否具有指定权限
  const hasPermission = (permission) => {
    if (!permission) return true;
    
    // 超级管理员权限
    if (permissionStrings.includes('*:*:*')) {
      return true;
    }
    
    // 直接权限匹配
    if (permissionStrings.includes(permission)) {
      return true;
    }
    
    // 通配符权限匹配
    return hasWildcardPermission(permission);
  };

  // 检查通配符权限
  const hasWildcardPermission = (permission) => {
    const parts = permission.split(':');
    if (parts.length !== 3) {
      return false;
    }
    
    // 检查模块级权限：sales:*:*
    const moduleWildcard = `${parts[0]}:*:*`;
    if (permissionStrings.includes(moduleWildcard)) {
      return true;
    }
    
    // 检查功能级权限：sales:leads:*
    const functionWildcard = `${parts[0]}:${parts[1]}:*`;
    if (permissionStrings.includes(functionWildcard)) {
      return true;
    }
    
    return false;
  };

  // 检查是否具有任意一个权限
  const hasAnyPermission = (permissions) => {
    if (!permissions || permissions.length === 0) return true;
    
    return permissions.some(permission => hasPermission(permission));
  };

  // 检查是否具有所有权限
  const hasAllPermissions = (permissions) => {
    if (!permissions || permissions.length === 0) return true;
    
    return permissions.every(permission => hasPermission(permission));
  };

  // 检查数据权限范围
  const hasDataScope = (requiredScope) => {
    if (!requiredScope) return true;
    
    const scopeLevel = {
      'all_departments': 4,
      'department_and_sub': 3,
      'department_only': 2,
      'own_data': 1
    };
    
    const currentLevel = scopeLevel[dataScope] || 1;
    const requiredLevel = scopeLevel[requiredScope] || 1;
    
    return currentLevel >= requiredLevel;
  };

  // 刷新权限信息
  const refresh = () => {
    loadPermissions();
  };

  // 初始化加载权限
  useEffect(() => {
    if (userInfo?.id) {
      loadPermissions();
    }
  }, [userInfo?.id]);

  // 尝试从本地存储恢复权限信息
  useEffect(() => {
    if (loading && userInfo?.id) {
      const cachedPermissions = localStorage.getItem('user_permissions');
      if (cachedPermissions) {
        try {
          const data = JSON.parse(cachedPermissions);
          setPermissions(data.permissions);
          setPermissionStrings(data.permissionStrings || []);
          setDataScope(data.dataScope || 'own_data');
        } catch (error) {
          console.error('恢复权限缓存失败:', error);
        }
      }
    }
  }, [loading, userInfo?.id]);

  const value = useMemo(() => ({
    permissions,
    permissionStrings,
    dataScope,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasDataScope,
    loading,
    refresh
  }), [permissions, permissionStrings, dataScope, loading]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

// ===============================================
// 2. 权限Hook
// ===============================================

/**
 * 使用权限Hook
 */
export const usePermission = () => {
  const context = useContext(PermissionContext);
  
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  
  return context;
};

/**
 * 权限检查Hook
 */
export const usePermissionCheck = (permission, dataScope = null) => {
  const { hasPermission, hasDataScope, loading } = usePermission();
  
  const hasRequiredPermission = useMemo(() => {
    if (loading) return false;
    
    const permissionCheck = permission ? hasPermission(permission) : true;
    const dataScopeCheck = dataScope ? hasDataScope(dataScope) : true;
    
    return permissionCheck && dataScopeCheck;
  }, [permission, dataScope, hasPermission, hasDataScope, loading]);

  return {
    hasPermission: hasRequiredPermission,
    loading
  };
};

// ===============================================
// 3. 权限组件
// ===============================================

/**
 * 权限包装组件
 */
export const PermissionWrapper = ({ 
  permission, 
  permissions = [],
  dataScope, 
  mode = 'any', // 'any' | 'all'
  fallback = null, 
  children,
  placeholder = null
}) => {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
    hasDataScope, 
    loading 
  } = usePermission();

  // 加载中显示占位符
  if (loading) {
    return placeholder || <Spin size="small" />;
  }

  // 检查权限
  let hasRequiredPermission = true;

  // 单个权限检查
  if (permission) {
    hasRequiredPermission = hasPermission(permission);
  }

  // 多个权限检查
  if (permissions.length > 0) {
    if (mode === 'all') {
      hasRequiredPermission = hasAllPermissions(permissions);
    } else {
      hasRequiredPermission = hasAnyPermission(permissions);
    }
  }

  // 数据权限检查
  if (dataScope && hasRequiredPermission) {
    hasRequiredPermission = hasDataScope(dataScope);
  }

  return hasRequiredPermission ? children : fallback;
};

/**
 * 按钮权限组件
 */
export const PermissionButton = ({ 
  permission, 
  dataScope, 
  disabled = false,
  children, 
  ...props 
}) => {
  const { hasPermission: hasPermissionFunc, hasDataScope, loading } = usePermission();

  const hasRequiredPermission = useMemo(() => {
    if (loading) return false;
    
    const permissionCheck = permission ? hasPermissionFunc(permission) : true;
    const dataScopeCheck = dataScope ? hasDataScope(dataScope) : true;
    
    return permissionCheck && dataScopeCheck;
  }, [permission, dataScope, hasPermissionFunc, hasDataScope, loading]);

  if (!hasRequiredPermission) {
    return null;
  }

  return React.cloneElement(children, {
    ...props,
    disabled: disabled || loading
  });
};

/**
 * 字段权限组件
 */
export const PermissionField = ({ 
  fieldType = 'text',
  sensitiveLevel = 'none', // 'none' | 'sensitive' | 'financial' | 'personal'
  value,
  maskChar = '*',
  showLength = 3,
  children
}) => {
  const { permissions } = usePermission();

  // 获取字段权限配置
  const fieldPermissions = permissions.field_permissions || {};
  
  // 检查是否有敏感数据访问权限
  const hasSensitivePermission = fieldPermissions.sensitive_data || false;
  const hasFinancialPermission = fieldPermissions.financial_data || false;
  const hasPersonalPermission = fieldPermissions.personal_data || false;

  // 判断是否需要脱敏
  const shouldMask = () => {
    switch (sensitiveLevel) {
      case 'sensitive':
        return !hasSensitivePermission;
      case 'financial':
        return !hasFinancialPermission;
      case 'personal':
        return !hasPersonalPermission;
      default:
        return false;
    }
  };

  // 数据脱敏处理
  const maskValue = (originalValue) => {
    if (!originalValue || !shouldMask()) {
      return originalValue;
    }

    const str = String(originalValue);

    switch (fieldType) {
      case 'phone':
        return str.replace(/(\d{3})\d{4}(\d{4})/, `$1${maskChar.repeat(4)}$2`);
      case 'email':
        const atIndex = str.indexOf('@');
        if (atIndex > 0) {
          const username = str.substring(0, atIndex);
          const domain = str.substring(atIndex);
          const maskedUsername = username.length > showLength 
            ? username.substring(0, showLength) + maskChar.repeat(username.length - showLength)
            : username;
          return maskedUsername + domain;
        }
        return str;
      case 'idcard':
        return str.replace(/(\d{6})\d{8}(\d{4})/, `$1${maskChar.repeat(8)}$2`);
      case 'amount':
        return maskChar.repeat(3);
      case 'address':
        return str.length > showLength * 2 
          ? str.substring(0, showLength) + maskChar.repeat(str.length - showLength * 2) + str.substring(str.length - showLength)
          : str;
      default:
        return str.length > showLength 
          ? str.substring(0, showLength) + maskChar.repeat(str.length - showLength)
          : str;
    }
  };

  const displayValue = maskValue(value);

  return children ? React.cloneElement(children, { children: displayValue }) : displayValue;
};

// ===============================================
// 4. 路由守卫
// ===============================================

/**
 * 权限路由组件
 */
export const PermissionRoute = ({ 
  permission, 
  permissions = [],
  dataScope,
  mode = 'any',
  redirectTo = '/403',
  children 
}) => {
  const location = useLocation();
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
    hasDataScope, 
    loading 
  } = usePermission();

  // 加载中显示加载组件
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px' 
      }}>
        <Spin size="large" tip="加载权限信息..." />
      </div>
    );
  }

  // 检查权限
  let hasRequiredPermission = true;

  // 单个权限检查
  if (permission) {
    hasRequiredPermission = hasPermission(permission);
  }

  // 多个权限检查
  if (permissions.length > 0) {
    if (mode === 'all') {
      hasRequiredPermission = hasAllPermissions(permissions);
    } else {
      hasRequiredPermission = hasAnyPermission(permissions);
    }
  }

  // 数据权限检查
  if (dataScope && hasRequiredPermission) {
    hasRequiredPermission = hasDataScope(dataScope);
  }

  if (!hasRequiredPermission) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
};

/**
 * 路由权限配置
 */
export const routePermissions = {
  // 销售管理
  '/sales/leads': 'sales:leads:view',
  '/sales/leads/create': 'sales:leads:create',
  '/sales/leads/:id/edit': 'sales:leads:edit',
  '/sales/customers': 'sales:customers:view',
  '/sales/customers/create': 'sales:customers:create',
  '/sales/customers/:id/edit': 'sales:customers:edit',
  '/sales/orders': 'sales:orders:view',
  '/sales/orders/create': 'sales:orders:create',
  '/sales/orders/:id/edit': 'sales:orders:edit',
  
  // 营销管理
  '/marketing/campaigns': 'marketing:campaigns:view',
  '/marketing/campaigns/create': 'marketing:campaigns:create',
  '/marketing/campaigns/:id/edit': 'marketing:campaigns:edit',
  
  // 系统管理
  '/system/users': 'system:users:view',
  '/system/users/create': 'system:users:create',
  '/system/users/:id/edit': 'system:users:edit',
  '/system/roles': 'system:roles:view',
  '/system/roles/create': 'system:roles:create',
  '/system/roles/:id/edit': 'system:roles:edit',
  '/system/departments': 'system:departments:view',
  
  // AI分析
  '/analytics': 'analytics:view',
  '/analytics/predict': 'analytics:predict',
  '/analytics/reports': 'analytics:report'
};

// ===============================================
// 5. 权限工具类
// ===============================================

/**
 * 权限工具类
 */
export class PermissionUtils {
  /**
   * 过滤菜单项
   */
  static filterMenus(menus, hasPermission) {
    return menus.filter(menu => {
      if (menu.permission && !hasPermission(menu.permission)) {
        return false;
      }
      
      if (menu.children && menu.children.length > 0) {
        menu.children = this.filterMenus(menu.children, hasPermission);
        return menu.children.length > 0;
      }
      
      return true;
    });
  }

  /**
   * 过滤表格列
   */
  static filterTableColumns(columns, fieldPermissions) {
    return columns.filter(column => {
      if (column.sensitiveLevel) {
        switch (column.sensitiveLevel) {
          case 'sensitive':
            return fieldPermissions.sensitive_data;
          case 'financial':
            return fieldPermissions.financial_data;
          case 'personal':
            return fieldPermissions.personal_data;
          default:
            return true;
        }
      }
      return true;
    });
  }

  /**
   * 过滤操作按钮
   */
  static filterActions(actions, hasPermission) {
    return actions.filter(action => {
      return !action.permission || hasPermission(action.permission);
    });
  }

  /**
   * 检查路由权限
   */
  static checkRoutePermission(pathname, hasPermission) {
    // 精确匹配
    if (routePermissions[pathname]) {
      return hasPermission(routePermissions[pathname]);
    }

    // 模糊匹配
    for (const [route, permission] of Object.entries(routePermissions)) {
      const routeRegex = new RegExp(
        '^' + route.replace(/:\w+/g, '\\w+') + '$'
      );
      if (routeRegex.test(pathname)) {
        return hasPermission(permission);
      }
    }

    return true; // 默认允许访问
  }

  /**
   * 获取权限描述
   */
  static getPermissionDescription(permission) {
    const descriptions = {
      // 销售管理
      'sales:leads:view': '查看线索',
      'sales:leads:create': '创建线索',
      'sales:leads:edit': '编辑线索',
      'sales:leads:delete': '删除线索',
      'sales:leads:assign': '分配线索',
      'sales:leads:convert': '转化线索',
      'sales:customers:view': '查看客户',
      'sales:customers:create': '创建客户',
      'sales:customers:edit': '编辑客户',
      'sales:customers:delete': '删除客户',
      'sales:orders:view': '查看订单',
      'sales:orders:create': '创建订单',
      'sales:orders:edit': '编辑订单',
      'sales:orders:delete': '删除订单',
      
      // 营销管理
      'marketing:campaigns:view': '查看活动',
      'marketing:campaigns:create': '创建活动',
      'marketing:campaigns:edit': '编辑活动',
      'marketing:campaigns:delete': '删除活动',
      
      // 系统管理
      'system:users:view': '查看用户',
      'system:users:create': '创建用户',
      'system:users:edit': '编辑用户',
      'system:users:delete': '删除用户',
      'system:roles:view': '查看角色',
      'system:roles:create': '创建角色',
      'system:roles:edit': '编辑角色',
      'system:roles:delete': '删除角色',
      
      // AI分析
      'analytics:predict': '智能预测',
      'analytics:recommend': '个性化推荐',
      'analytics:report': '报告生成',
      'analytics:risk': '风险评估',
      'analytics:sentiment': '情感分析',
      'analytics:chat': 'AI对话'
    };

    return descriptions[permission] || permission;
  }
}

// ===============================================
// 6. 权限指令 (用于Vue风格的权限控制)
// ===============================================

/**
 * 权限指令Hook
 */
export const usePermissionDirective = () => {
  const { hasPermission, hasDataScope } = usePermission();

  return {
    // v-permission="'sales:leads:view'"
    permission: (element, permission) => {
      if (!hasPermission(permission)) {
        element.style.display = 'none';
        return false;
      }
      element.style.display = '';
      return true;
    },

    // v-data-scope="'department_only'"
    dataScope: (element, scope) => {
      if (!hasDataScope(scope)) {
        element.style.display = 'none';
        return false;
      }
      element.style.display = '';
      return true;
    },

    // v-permission-class="{ hidden: 'sales:leads:view' }"
    permissionClass: (element, config) => {
      Object.entries(config).forEach(([className, permission]) => {
        if (hasPermission(permission)) {
          element.classList.remove(className);
        } else {
          element.classList.add(className);
        }
      });
    }
  };
};

// ===============================================
// 7. 权限状态管理 (Redux Slice)
// ===============================================

/**
 * 权限状态切片
 */
export const permissionSlice = {
  name: 'permission',
  initialState: {
    permissions: {},
    permissionStrings: [],
    dataScope: 'own_data',
    fieldPermissions: {},
    loading: false,
    error: null
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setPermissions: (state, action) => {
      const { permissions, permissionStrings, dataScope, fieldPermissions } = action.payload;
      state.permissions = permissions;
      state.permissionStrings = permissionStrings;
      state.dataScope = dataScope;
      state.fieldPermissions = fieldPermissions || {};
      state.loading = false;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearPermissions: (state) => {
      state.permissions = {};
      state.permissionStrings = [];
      state.dataScope = 'own_data';
      state.fieldPermissions = {};
      state.loading = false;
      state.error = null;
    }
  }
};

// ===============================================
// 8. 使用示例
// ===============================================

/**
 * 使用示例组件
 */
export const PermissionExampleComponent = () => {
  const { hasPermission, hasDataScope } = usePermission();

  return (
    <div>
      {/* 基础权限包装 */}
      <PermissionWrapper permission="sales:leads:create">
        <Button type="primary">新增线索</Button>
      </PermissionWrapper>

      {/* 多权限检查 */}
      <PermissionWrapper 
        permissions={['sales:leads:edit', 'sales:leads:delete']} 
        mode="any"
      >
        <Button>编辑或删除</Button>
      </PermissionWrapper>

      {/* 数据权限检查 */}
      <PermissionWrapper 
        permission="sales:leads:view" 
        dataScope="department_and_sub"
      >
        <Table />
      </PermissionWrapper>

      {/* 字段权限控制 */}
      <PermissionField 
        fieldType="phone" 
        sensitiveLevel="sensitive" 
        value="13812345678"
      />

      {/* 按钮权限 */}
      <PermissionButton permission="sales:leads:delete">
        <Button danger>删除</Button>
      </PermissionButton>

      {/* 条件渲染 */}
      {hasPermission('sales:leads:export') && (
        <Button icon={<DownloadOutlined />}>导出</Button>
      )}

      {/* 数据权限条件渲染 */}
      {hasDataScope('department_and_sub') && (
        <Button>管理部门数据</Button>
      )}
    </div>
  );
};

// 导出所有权限相关组件和工具
export default {
  PermissionProvider,
  PermissionWrapper,
  PermissionButton,
  PermissionField,
  PermissionRoute,
  usePermission,
  usePermissionCheck,
  usePermissionDirective,
  PermissionUtils,
  permissionSlice,
  routePermissions
};
