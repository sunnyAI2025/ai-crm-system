import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  message,
  Tag,
  Typography,
  Row,
  Col,
  Divider,
  Popconfirm,
  Avatar,
  Switch,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  UploadOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import request from '@/utils/request';
import type { ApiResponse } from '@/types/api';
import './index.css';

const { Title, Text } = Typography;
const { Option } = Select;

interface User {
  id: number;
  username: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  department: string;
  role: string;
  status: number; // 1:正常 0:禁用
  lastLogin?: string;
  createdAt: string;
  description?: string;
}

interface UsersResponse {
  list: User[];
  total: number;
  page: number;
  pageSize: number;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // 用户状态选项
  const statusOptions = [
    { label: '正常', value: 1, color: 'green' },
    { label: '禁用', value: 0, color: 'red' },
  ];

  // 角色选项
  const roleOptions = [
    '系统管理员',
    '销售经理',
    '销售专员',
    '营销经理',
    '营销专员',
    '客服专员',
    '财务专员',
    '普通用户',
  ];

  // 部门选项
  const departmentOptions = [
    '技术部',
    '销售部',
    '营销部',
    '客服部',
    '财务部',
    '人事部',
    '行政部',
  ];

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: current,
        pageSize,
        search: searchText,
        status: statusFilter,
        role: roleFilter,
      };
      
      const response = await request.get<ApiResponse<UsersResponse>>('/users', { params });
      
      if (response.data.code === 0) {
        setUsers(response.data.data.list);
        setTotal(response.data.data.total);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchUsers();
  }, [current, pageSize, searchText, statusFilter, roleFilter]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrent(1);
  };

  // 处理筛选
  const handleFilter = (type: string, value: any) => {
    if (type === 'status') {
      setStatusFilter(value);
    } else if (type === 'role') {
      setRoleFilter(value);
    }
    setCurrent(1);
  };

  // 打开新增/编辑弹窗
  const openModal = (user?: User) => {
    setEditingUser(user || null);
    setModalVisible(true);
    
    if (user) {
      form.setFieldsValue(user);
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: 1,
      });
    }
  };

  // 关闭弹窗
  const closeModal = () => {
    setModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  // 打开修改密码弹窗
  const openPasswordModal = (user: User) => {
    setEditingUser(user);
    setPasswordModalVisible(true);
    passwordForm.resetFields();
  };

  // 关闭密码弹窗
  const closePasswordModal = () => {
    setPasswordModalVisible(false);
    setEditingUser(null);
    passwordForm.resetFields();
  };

  // 保存用户
  const handleSave = async (values: any) => {
    try {
      const url = editingUser ? `/users/${editingUser.id}` : '/users';
      const method = editingUser ? 'put' : 'post';
      
      const response = await request[method]<ApiResponse<any>>(url, values);
      
      if (response.data.code === 0) {
        message.success(editingUser ? '更新成功' : '创建成功');
        closeModal();
        fetchUsers();
      }
    } catch (error) {
      message.error('保存失败');
    }
  };

  // 修改密码
  const handlePasswordChange = async (values: any) => {
    try {
      const response = await request.put<ApiResponse<any>>(`/users/${editingUser?.id}/password`, {
        newPassword: values.newPassword,
      });
      
      if (response.data.code === 0) {
        message.success('密码修改成功');
        closePasswordModal();
      }
    } catch (error) {
      message.error('密码修改失败');
    }
  };

  // 切换用户状态
  const handleStatusToggle = async (user: User) => {
    try {
      const newStatus = user.status === 1 ? 0 : 1;
      const response = await request.put<ApiResponse<any>>(`/users/${user.id}/status`, {
        status: newStatus,
      });
      
      if (response.data.code === 0) {
        message.success(newStatus === 1 ? '启用成功' : '禁用成功');
        fetchUsers();
      }
    } catch (error) {
      message.error('状态修改失败');
    }
  };

  // 删除用户
  const handleDelete = async (id: number) => {
    try {
      const response = await request.delete<ApiResponse<any>>(`/users/${id}`);
      
      if (response.data.code === 0) {
        message.success('删除成功');
        fetchUsers();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 重置密码
  const handlePasswordReset = async (user: User) => {
    try {
      const response = await request.post<ApiResponse<any>>(`/users/${user.id}/reset-password`);
      
      if (response.data.code === 0) {
        message.success('密码重置成功，新密码已发送至用户邮箱');
      }
    } catch (error) {
      message.error('密码重置失败');
    }
  };

  // 表格列配置
  const columns: ColumnsType<User> = [
    {
      title: '用户信息',
      key: 'userInfo',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={record.avatar}
            icon={<UserOutlined />}
            size={40}
            style={{ marginRight: 12 }}
          />
          <div>
            <div style={{ marginBottom: 4 }}>
              <Text strong>{record.name}</Text>
              <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                @{record.username}
              </Text>
            </div>
            <div>
              <Tag color="blue">{record.role}</Tag>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '联系信息',
      key: 'contact',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <PhoneOutlined style={{ marginRight: 4, color: '#1890ff' }} />
            <Text style={{ fontSize: 12 }}>{record.phone}</Text>
          </div>
          <div>
            <MailOutlined style={{ marginRight: 4, color: '#52c41a' }} />
            <Text style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 100,
      render: (text) => (
        <Space>
          <TeamOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status, record) => (
        <Space>
          <Switch
            checked={status === 1}
            onChange={() => handleStatusToggle(record)}
            checkedChildren="正常"
            unCheckedChildren="禁用"
          />
        </Space>
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 150,
      render: (text) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {text || '从未登录'}
        </Text>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (text) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {text}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<KeyOutlined />}
            onClick={() => openPasswordModal(record)}
          >
            改密
          </Button>
          <Popconfirm
            title="确定要重置密码吗？"
            onConfirm={() => handlePasswordReset(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
            >
              重置
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="users-page">
      <Card>
        <div className="page-header">
          <Title level={3} style={{ margin: 0 }}>
            用户管理
          </Title>
          <Text type="secondary">
            管理系统用户账号和权限
          </Text>
        </div>

        <Divider />

        {/* 操作区域 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Input.Search
              placeholder="搜索用户名、姓名"
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="状态筛选"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilter('status', value)}
            >
              {statusOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="角色筛选"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilter('role', value)}
            >
              {roleOptions.map(role => (
                <Option key={role} value={role}>
                  {role}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              新增用户
            </Button>
          </Col>
        </Row>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            onChange: (page, size) => {
              setCurrent(page);
              setPageSize(size);
            },
          }}
        />
      </Card>

      {/* 新增/编辑用户弹窗 */}
      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="用户名"
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少3个字符' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字和下划线' },
                ]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="姓名"
                name="name"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
          </Row>

          {!editingUser && (
            <Form.Item
              label="密码"
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="手机号"
                name="phone"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
                ]}
              >
                <Input placeholder="请输入手机号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="邮箱"
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input placeholder="请输入邮箱地址" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="部门"
                name="department"
                rules={[{ required: true, message: '请选择部门' }]}
              >
                <Select placeholder="请选择部门">
                  {departmentOptions.map(dept => (
                    <Option key={dept} value={dept}>
                      {dept}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="角色"
                name="role"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select placeholder="请选择角色">
                  {roleOptions.map(role => (
                    <Option key={role} value={role}>
                      {role}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              {statusOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
          >
            <Input.TextArea
              rows={3}
              placeholder="请输入用户描述"
              maxLength={200}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={closeModal}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 修改密码弹窗 */}
      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={closePasswordModal}
        footer={null}
        width={400}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>

          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={closePasswordModal}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
