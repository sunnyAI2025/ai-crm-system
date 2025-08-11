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
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import request from '@/utils/request';
import type { ApiResponse } from '@/types/api';
import './index.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  source: string;
  status: string;
  assignedTo: string;
  createdAt: string;
  notes?: string;
}

interface LeadsResponse {
  list: Lead[];
  total: number;
  page: number;
  pageSize: number;
}

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [form] = Form.useForm();

  // 线索状态选项
  const statusOptions = [
    { label: '待跟进', value: '待跟进', color: 'orange' },
    { label: '已联系', value: '已联系', color: 'blue' },
    { label: '有意向', value: '有意向', color: 'green' },
    { label: '无意向', value: '无意向', color: 'red' },
    { label: '已转化', value: '已转化', color: 'purple' },
  ];

  // 线索来源选项
  const sourceOptions = [
    '网站咨询',
    '电话营销',
    '微信推广',
    '朋友推荐',
    '展会活动',
    '其他渠道',
  ];

  // 获取线索列表
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {
        page: current,
        pageSize,
        search: searchText,
        status: statusFilter,
        source: sourceFilter,
      };
      
      const response = await request.get<ApiResponse<LeadsResponse>>('/leads', { params });
      
      if (response.data.code === 0) {
        setLeads(response.data.data.list);
        setTotal(response.data.data.total);
      }
    } catch (error) {
      console.error('获取线索列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchLeads();
  }, [current, pageSize, searchText, statusFilter, sourceFilter]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrent(1);
  };

  // 处理筛选
  const handleFilter = (type: string, value: string) => {
    if (type === 'status') {
      setStatusFilter(value);
    } else if (type === 'source') {
      setSourceFilter(value);
    }
    setCurrent(1);
  };

  // 打开新增/编辑弹窗
  const openModal = (lead?: Lead) => {
    setEditingLead(lead || null);
    setModalVisible(true);
    
    if (lead) {
      form.setFieldsValue(lead);
    } else {
      form.resetFields();
    }
  };

  // 关闭弹窗
  const closeModal = () => {
    setModalVisible(false);
    setEditingLead(null);
    form.resetFields();
  };

  // 保存线索
  const handleSave = async (values: any) => {
    try {
      const url = editingLead ? `/leads/${editingLead.id}` : '/leads';
      const method = editingLead ? 'put' : 'post';
      
      const response = await request[method]<ApiResponse<any>>(url, values);
      
      if (response.data.code === 0) {
        message.success(editingLead ? '更新成功' : '创建成功');
        closeModal();
        fetchLeads();
      }
    } catch (error) {
      message.error('保存失败');
    }
  };

  // 删除线索
  const handleDelete = async (id: number) => {
    try {
      const response = await request.delete<ApiResponse<any>>(`/leads/${id}`);
      
      if (response.data.code === 0) {
        message.success('删除成功');
        fetchLeads();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 获取状态标签颜色
  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'default';
  };

  // 表格列配置
  const columns: ColumnsType<Lead> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text) => (
        <Space>
          <UserOutlined />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <PhoneOutlined style={{ marginRight: 4, color: '#1890ff' }} />
            {record.phone}
          </div>
          <div>
            <MailOutlined style={{ marginRight: 4, color: '#52c41a' }} />
            {record.email}
          </div>
        </div>
      ),
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 100,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (text) => (
        <Tag color={getStatusColor(text)}>{text}</Tag>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (text) => text ? <Text type="secondary">{text}</Text> : '-',
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
            title="确定要删除这个线索吗？"
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
    <div className="leads-page">
      <Card>
        <div className="page-header">
          <Title level={3} style={{ margin: 0 }}>
            线索管理
          </Title>
          <Text type="secondary">
            管理销售线索，跟进客户需求
          </Text>
        </div>

        <Divider />

        {/* 操作区域 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input.Search
              placeholder="搜索姓名、电话、邮箱"
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
              onChange={(value) => handleFilter('status', value || '')}
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
              placeholder="来源筛选"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilter('source', value || '')}
            >
              {sourceOptions.map(source => (
                <Option key={source} value={source}>
                  {source}
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
              新增线索
            </Button>
          </Col>
        </Row>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={leads}
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

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingLead ? '编辑线索' : '新增线索'}
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
                label="姓名"
                name="name"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
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
          </Row>

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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="来源"
                name="source"
                rules={[{ required: true, message: '请选择来源' }]}
              >
                <Select placeholder="请选择线索来源">
                  {sourceOptions.map(source => (
                    <Option key={source} value={source}>
                      {source}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
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
            </Col>
          </Row>

          <Form.Item
            label="负责人"
            name="assignedTo"
            rules={[{ required: true, message: '请输入负责人' }]}
          >
            <Input placeholder="请输入负责人" />
          </Form.Item>

          <Form.Item
            label="备注"
            name="notes"
          >
            <TextArea
              rows={4}
              placeholder="请输入备注信息"
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

export default Leads;
