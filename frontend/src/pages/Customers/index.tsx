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
  DatePicker,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  StarOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import request from '@/utils/request';
import type { ApiResponse } from '@/types/api';
import './index.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  company?: string;
  industry?: string;
  level: string;
  status: string;
  assignedTo: string;
  totalValue: number;
  lastContact: string;
  createdAt: string;
  notes?: string;
}

interface CustomersResponse {
  list: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form] = Form.useForm();

  // 客户等级选项
  const levelOptions = [
    { label: 'A级客户', value: 'A', color: 'red' },
    { label: 'B级客户', value: 'B', color: 'orange' },
    { label: 'C级客户', value: 'C', color: 'green' },
    { label: 'D级客户', value: 'D', color: 'gray' },
  ];

  // 客户状态选项
  const statusOptions = [
    { label: '活跃', value: '活跃', color: 'green' },
    { label: '潜在', value: '潜在', color: 'blue' },
    { label: '休眠', value: '休眠', color: 'orange' },
    { label: '流失', value: '流失', color: 'red' },
  ];

  // 行业选项
  const industryOptions = [
    '制造业',
    '服务业',
    '金融业',
    '教育培训',
    '医疗健康',
    '互联网',
    '房地产',
    '其他',
  ];

  // 获取客户列表
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = {
        page: current,
        pageSize,
        search: searchText,
        level: levelFilter,
        status: statusFilter,
      };
      
      const response = await request.get<ApiResponse<CustomersResponse>>('/customers', { params });
      
      if (response.data.code === 0) {
        setCustomers(response.data.data.list);
        setTotal(response.data.data.total);
      }
    } catch (error) {
      console.error('获取客户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchCustomers();
  }, [current, pageSize, searchText, levelFilter, statusFilter]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrent(1);
  };

  // 处理筛选
  const handleFilter = (type: string, value: string) => {
    if (type === 'level') {
      setLevelFilter(value);
    } else if (type === 'status') {
      setStatusFilter(value);
    }
    setCurrent(1);
  };

  // 打开新增/编辑弹窗
  const openModal = (customer?: Customer) => {
    setEditingCustomer(customer || null);
    setModalVisible(true);
    
    if (customer) {
      form.setFieldsValue({
        ...customer,
        lastContact: customer.lastContact ? new Date(customer.lastContact) : null,
      });
    } else {
      form.resetFields();
    }
  };

  // 关闭弹窗
  const closeModal = () => {
    setModalVisible(false);
    setEditingCustomer(null);
    form.resetFields();
  };

  // 保存客户
  const handleSave = async (values: any) => {
    try {
      const submitData = {
        ...values,
        lastContact: values.lastContact ? values.lastContact.format('YYYY-MM-DD HH:mm:ss') : null,
      };
      
      const url = editingCustomer ? `/customers/${editingCustomer.id}` : '/customers';
      const method = editingCustomer ? 'put' : 'post';
      
      const response = await request[method]<ApiResponse<any>>(url, submitData);
      
      if (response.data.code === 0) {
        message.success(editingCustomer ? '更新成功' : '创建成功');
        closeModal();
        fetchCustomers();
      }
    } catch (error) {
      message.error('保存失败');
    }
  };

  // 删除客户
  const handleDelete = async (id: number) => {
    try {
      const response = await request.delete<ApiResponse<any>>(`/customers/${id}`);
      
      if (response.data.code === 0) {
        message.success('删除成功');
        fetchCustomers();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 获取等级标签颜色
  const getLevelColor = (level: string) => {
    const option = levelOptions.find(opt => opt.value === level);
    return option?.color || 'default';
  };

  // 获取状态标签颜色
  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'default';
  };

  // 表格列配置
  const columns: ColumnsType<Customer> = [
    {
      title: '客户信息',
      key: 'customer',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <Space>
              <UserOutlined />
              <Text strong>{record.name}</Text>
              <Tag color={getLevelColor(record.level)}>
                {record.level}级
              </Tag>
            </Space>
          </div>
          {record.company && (
            <div style={{ marginBottom: 2 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.company}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '联系方式',
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
      title: '行业',
      dataIndex: 'industry',
      key: 'industry',
      width: 100,
      render: (text) => text ? <Tag color="blue">{text}</Tag> : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (text) => (
        <Tag color={getStatusColor(text)}>{text}</Tag>
      ),
    },
    {
      title: '客户价值',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 120,
      render: (value) => (
        <Space>
          <DollarOutlined style={{ color: '#faad14' }} />
          <Text strong>¥{value?.toLocaleString() || 0}</Text>
        </Space>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      width: 100,
    },
    {
      title: '最后联系',
      dataIndex: 'lastContact',
      key: 'lastContact',
      width: 150,
      render: (text) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {text || '暂无'}
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
      width: 150,
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
          <Popconfirm
            title="确定要删除这个客户吗？"
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
    <div className="customers-page">
      <Card>
        <div className="page-header">
          <Title level={3} style={{ margin: 0 }}>
            客户管理
          </Title>
          <Text type="secondary">
            管理客户信息，维护客户关系
          </Text>
        </div>

        <Divider />

        {/* 操作区域 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input.Search
              placeholder="搜索客户姓名、公司"
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="客户等级"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilter('level', value || '')}
            >
              {levelOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="客户状态"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilter('status', value || '')}
            >
              {statusOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
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
              新增客户
            </Button>
          </Col>
        </Row>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={customers}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
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

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingCustomer ? '编辑客户' : '新增客户'}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="客户姓名"
                name="name"
                rules={[{ required: true, message: '请输入客户姓名' }]}
              >
                <Input placeholder="请输入客户姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="公司名称"
                name="company"
              >
                <Input placeholder="请输入公司名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="电话"
                name="phone"
                rules={[
                  { required: true, message: '请输入电话' },
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
            <Col span={8}>
              <Form.Item
                label="所属行业"
                name="industry"
              >
                <Select placeholder="请选择行业">
                  {industryOptions.map(industry => (
                    <Option key={industry} value={industry}>
                      {industry}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="客户等级"
                name="level"
                rules={[{ required: true, message: '请选择客户等级' }]}
              >
                <Select placeholder="请选择客户等级">
                  {levelOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="客户状态"
                name="status"
                rules={[{ required: true, message: '请选择客户状态' }]}
              >
                <Select placeholder="请选择客户状态">
                  {statusOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="客户价值 (¥)"
                name="totalValue"
              >
                <InputNumber
                  placeholder="0"
                  min={0}
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="负责人"
                name="assignedTo"
                rules={[{ required: true, message: '请输入负责人' }]}
              >
                <Input placeholder="请输入负责人" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="最后联系时间"
                name="lastContact"
              >
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder="选择最后联系时间"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="备注"
            name="notes"
          >
            <TextArea
              rows={4}
              placeholder="请输入客户相关备注信息"
              maxLength={500}
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
    </div>
  );
};

export default Customers;
