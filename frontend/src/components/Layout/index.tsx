import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Button, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  BulbOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import AiChat from '../AiChat';
import './index.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface UserInfo {
  id: number;
  username: string;
  name: string;
  phone?: string;
  avatar?: string;
  departmentName?: string;
  roleName?: string;
}

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    // 获取用户信息
    const storedUserInfo = localStorage.getItem('user_info');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  // 菜单项配置
  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: 'sales',
      icon: <TeamOutlined />,
      label: '销售管理',
      children: [
        {
          key: '/leads',
          label: '线索管理',
        },
        {
          key: '/customers',
          label: '客户管理',
        },
        {
          key: '/orders',
          label: '成单管理',
        },
      ],
    },
    {
      key: 'marketing',
      icon: <BulbOutlined />,
      label: '营销管理',
      children: [
        {
          key: '/campaigns',
          label: '推广活动',
        },
      ],
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: '系统管理',
      children: [
        {
          key: '/users',
          label: '账号管理',
        },
        {
          key: '/roles',
          label: '角色管理',
        },
      ],
    },
  ];

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');
        navigate('/login');
      },
    },
  ];

  return (
    <Layout className="main-layout">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="layout-sider"
        width={220}
      >
        <div className="logo">
          <div className="logo-icon">
            <ShoppingCartOutlined />
          </div>
          {!collapsed && (
            <div className="logo-text">
              <div className="logo-title">AI CRM</div>
              <div className="logo-subtitle">智能客户管理</div>
            </div>
          )}
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="layout-menu"
        />
      </Sider>
      
      <Layout>
        <Header 
          className="layout-header"
          style={{ background: colorBgContainer }}
        >
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 40, height: 40 }}
            />
          </div>
          
          <div className="header-right">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="user-info">
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  src={userInfo?.avatar}
                  style={{ marginRight: 8 }}
                />
                <div className="user-details">
                  <Text strong>{userInfo?.name || '用户'}</Text>
                  <Text type="secondary" className="user-role">
                    {userInfo?.roleName || '角色'}
                  </Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content
          className="layout-content"
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
      
      {/* AI数据分析助手 */}
      <AiChat />
    </Layout>
  );
};

export default MainLayout;
