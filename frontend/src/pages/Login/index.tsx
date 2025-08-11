import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import request from '@/utils/request';
import type { ApiResponse } from '@/types/api';
import './index.css';

const { Title, Text } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  userInfo: {
    id: number;
    username: string;
    name: string;
    phone?: string;
    avatar?: string;
    departmentName?: string;
    roleName?: string;
  };
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const response = await request.post<ApiResponse<LoginResponse>>('/auth/login', values);
      
      if (response.data.code === 0) {
        // 保存token和用户信息
        localStorage.setItem('access_token', response.data.data.token);
        localStorage.setItem('user_info', JSON.stringify(response.data.data.userInfo));
        
        message.success('登录成功');
        navigate('/dashboard');
      } else {
        message.error(response.data.message || '登录失败');
      }
    } catch (error: any) {
      console.error('登录错误:', error);
      message.error('登录失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <Title level={2} className="login-title">AI CRM系统</Title>
          <Text type="secondary">欢迎使用智能客户关系管理系统</Text>
        </div>
        
        <Card className="login-card">
          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
                allowClear
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
                allowClear
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="login-button"
              >
                登录
              </Button>
            </Form.Item>
          </Form>
          
          <div className="login-footer">
            <Text type="secondary">
              测试账号: admin / admin123
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
