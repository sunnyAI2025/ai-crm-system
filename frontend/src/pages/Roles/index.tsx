import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Modal,
  Form,
  message,
  Tag,
  Typography,
  Row,
  Col,
  Divider,
  Popconfirm,
  Tree,
  Checkbox,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  KeyOutlined,
  UserOutlined,
  SettingOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import request from '@/utils/request';
import type { ApiResponse } from '@/types/api';
import './index.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  permissions: string[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

interface RolesResponse {
  list: Role[];
  total: number;
  page: number;
  pageSize: number;
}

interface Permission {
  key: string;
  title: string;
  children?: Permission[];
}

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // 权限树数据
  const permissionTree: Permission[] = [
    {
      key: 'dashboard',
      title: '仪表盘',
      children: [
        { key: 'dashboard.view', title: '查看仪表盘' },
        { key: 'dashboard.export', title: '导出数据' },
      ],
    },
    {
      key: 'leads',
      title: '线索管理',
      children: [
        { key: 'leads.view', title: '查看线索' },
        { key: 'leads.create', title: '创建线索' },
        { key: 'leads.edit', title: '编辑线索' },
        { key: 'leads.delete', title: '删除线索' },
        { key: 'leads.assign', title: '分配线索' },
      ],
    },
    {
      key: 'customers',
      title: '客户管理',
      children: [
        { key: 'customers.view', title: '查看客户' },
        { key: 'customers.create', title: '创建客户' },
        { key: 'customers.edit', title: '编辑客户' },
        { key: 'customers.delete', title: '删除客户' },
        { key: 'customers.level', title: '客户等级管理' },
      ],
    },
    {
      key: 'orders',
      title: '订单管理',
      children: [
        { key: 'orders.view', title: '查看订单' },
        { key: 'orders.create', title: '创建订单' },
        { key: 'orders.edit', title: '编辑订单' },
        { key: 'orders.delete', title: '删除订单' },
        { key: 'orders.approve', title: '审批订单' },
      ],
    },
    {
      key: 'campaigns',
      title: '营销活动',
      children: [
        { key: 'campaigns.view', title: '查看活动' },
        { key: 'campaigns.create', title: '创建活动' },
        { key: 'campaigns.edit', title: '编辑活动' },
        { key: 'campaigns.delete', title: '删除活动' },
        { key: 'campaigns.publish', title: '发布活动' },
      ],
    },
    {
      key: 'system',
      title: '系统管理',
      children: [
        { key: 'system.users', title: '用户管理' },
        { key: 'system.roles', title: '角色管理' },
        { key: 'system.settings', title: '系统设置' },
        { key: 'system.logs', title: '系统日志' },
      ],
    },
  ];

  // 获取角色列表
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const params = {
        page: current,
        pageSize,
        search: searchText,
      };
      
      const response = await request.get<ApiResponse<RolesResponse>>('/roles', { params });
      
      if (response.data.code === 0) {
        setRoles(response.data.data.list);
        setTotal(response.data.data.total);
      }
    } catch (error) {
      console.error('获取角色列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchRoles();
  }, [current, pageSize, searchText]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrent(1);
  };

  // 打开新增/编辑弹窗
  const openModal = (role?: Role) => {
    setEditingRole(role || null);
    setModalVisible(true);
    
    if (role) {
      form.setFieldsValue(role);
    } else {
      form.resetFields();
    }
  };

  // 关闭弹窗
  const closeModal = () => {
    setModalVisible(false);
    setEditingRole(null);
    form.resetFields();
  };

  // 打开权限设置弹窗
  const openPermissionModal = (role: Role) => {
    setEditingRole(role);
    setSelectedPermissions(role.permissions || []);
    setPermissionModalVisible(true);
  };

  // 关闭权限弹窗
  const closePermissionModal = () => {
    setPermissionModalVisible(false);
    setEditingRole(null);
    setSelectedPermissions([]);
  };

  // 保存角色
  const handleSave = async (values: any) => {
    try {
      const url = editingRole ? `/roles/${editingRole.id}` : '/roles';
      const method = editingRole ? 'put' : 'post';
      
      const response = await request[method]<ApiResponse<any>>(url, values);
      
      if (response.data.code === 0) {
        message.success(editingRole ? '更新成功' : '创建成功');
        closeModal();
        fetchRoles();
      }
    } catch (error) {
      message.error('保存失败');
    }
  };

  // 保存权限
  const handlePermissionSave = async () => {
    try {
      const response = await request.put<ApiResponse<any>>(`/roles/${editingRole?.id}/permissions`, {
        permissions: selectedPermissions,
      });
      
      if (response.data.code === 0) {
        message.success('权限更新成功');
        closePermissionModal();
        fetchRoles();
      }
    } catch (error) {
      message.error('权限更新失败');
    }
  };

  // 删除角色
  const handleDelete = async (id: number) => {
    try {
      const response = await request.delete<ApiResponse<any>>(`/roles/${id}`);
      
      if (response.data.code === 0) {
        message.success('删除成功');
        fetchRoles();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 权限树选择处理
  const onPermissionCheck = (checkedKeys: any) => {
    setSelectedPermissions(checkedKeys);
  };

  // 渲染权限标签
  const renderPermissions = (permissions: string[]) => {
    const maxShow = 3;
    const showPermissions = permissions.slice(0, maxShow);
    const remaining = permissions.length - maxShow;
    
    return (
      <Space wrap>
        {showPermissions.map(perm => (
          <Tag key={perm} color="blue" style={{ fontSize: '11px', padding: '1px 6px' }}>
            {perm.split('.').pop()}
          </Tag>
        ))}
        {remaining > 0 && (
          <Tag color="gray" style={{ fontSize: '11px', padding: '1px 6px' }}>
            +{remaining}
          </Tag>
        )}
      </Space>
    );
  };

  // 表格列配置
  const columns: ColumnsType<Role> = [
    {
      title: '角色信息',
      key: 'roleInfo',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <Text strong>{record.name}</Text>
          </div>
          <div style={{ marginBottom: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              代码: {record.code}
            </Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description || '暂无描述'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: '用户数量',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 100,
      render: (count) => (
        <Space>
          <UserOutlined />
          <Text>{count} 人</Text>
        </Space>
      ),
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      width: 250,
      render: (permissions) => renderPermissions(permissions || []),
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
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
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
            icon={<KeyOutlined />}
            onClick={() => openPermissionModal(record)}
          >
            权限
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个角色吗？删除后关联用户将失去该角色权限。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={record.userCount > 0}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="roles-page">
      <Card>
        <div className="page-header">
          <Title level={3} style={{ margin: 0 }}>
            角色管理
          </Title>
          <Text type="secondary">
            管理系统角色和权限分配
          </Text>
        </div>

        <Divider />

        {/* 操作区域 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input.Search
              placeholder="搜索角色名称、代码"
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              新增角色
            </Button>
          </Col>
        </Row>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={roles}
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

      {/* 新增/编辑角色弹窗 */}
      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            label="角色名称"
            name="name"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>

          <Form.Item
            label="角色代码"
            name="code"
            rules={[
              { required: true, message: '请输入角色代码' },
              { pattern: /^[A-Z_]+$/, message: '只能包含大写字母和下划线' },
            ]}
          >
            <Input placeholder="请输入角色代码，如：SALES_MANAGER" />
          </Form.Item>

          <Form.Item
            label="角色描述"
            name="description"
          >
            <TextArea
              rows={3}
              placeholder="请输入角色描述"
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

      {/* 权限设置弹窗 */}
      <Modal
        title={`设置角色权限 - ${editingRole?.name}`}
        open={permissionModalVisible}
        onCancel={closePermissionModal}
        footer={
          <Space>
            <Button onClick={closePermissionModal}>
              取消
            </Button>
            <Button type="primary" onClick={handlePermissionSave}>
              保存权限
            </Button>
          </Space>
        }
        width={600}
      >
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <Tree
            checkable
            checkedKeys={selectedPermissions}
            onCheck={onPermissionCheck}
            treeData={permissionTree}
            defaultExpandAll
          />
        </div>
      </Modal>
    </div>
  );
};

export default Roles;
