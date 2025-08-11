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
  Progress,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import request from '@/utils/request';
import type { ApiResponse } from '@/types/api';
import './index.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface Order {
  id: number;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  amount: number;
  status: string;
  salesPerson: string;
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  progress: number;
  notes?: string;
  createdAt: string;
}

interface OrdersResponse {
  list: Order[];
  total: number;
  page: number;
  pageSize: number;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [form] = Form.useForm();

  // 订单状态选项
  const statusOptions = [
    { label: '待确认', value: '待确认', color: 'orange' },
    { label: '已确认', value: '已确认', color: 'blue' },
    { label: '生产中', value: '生产中', color: 'purple' },
    { label: '待发货', value: '待发货', color: 'cyan' },
    { label: '已发货', value: '已发货', color: 'green' },
    { label: '已完成', value: '已完成', color: 'green' },
    { label: '已取消', value: '已取消', color: 'red' },
  ];

  // 产品选项
  const productOptions = [
    '会计基础培训',
    '企业管理咨询',
    '财务软件培训',
    '税务筹划服务',
    '内部审计培训',
    '成本控制咨询',
    '其他服务',
  ];

  // 获取订单列表
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: current,
        pageSize,
        search: searchText,
        status: statusFilter,
        startDate: dateRange[0]?.format('YYYY-MM-DD'),
        endDate: dateRange[1]?.format('YYYY-MM-DD'),
      };
      
      const response = await request.get<ApiResponse<OrdersResponse>>('/orders', { params });
      
      if (response.data.code === 0) {
        setOrders(response.data.data.list);
        setTotal(response.data.data.total);
      }
    } catch (error) {
      console.error('获取订单列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchOrders();
  }, [current, pageSize, searchText, statusFilter, dateRange]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrent(1);
  };

  // 处理筛选
  const handleFilter = (type: string, value: any) => {
    if (type === 'status') {
      setStatusFilter(value || '');
    } else if (type === 'dateRange') {
      setDateRange(value || []);
    }
    setCurrent(1);
  };

  // 打开新增/编辑弹窗
  const openModal = (order?: Order) => {
    setEditingOrder(order || null);
    setModalVisible(true);
    
    if (order) {
      form.setFieldsValue({
        ...order,
        orderDate: order.orderDate ? new Date(order.orderDate) : null,
        expectedDelivery: order.expectedDelivery ? new Date(order.expectedDelivery) : null,
        actualDelivery: order.actualDelivery ? new Date(order.actualDelivery) : null,
      });
    } else {
      form.resetFields();
      // 设置默认值
      form.setFieldsValue({
        orderNo: `ORD${Date.now()}`,
        orderDate: new Date(),
        status: '待确认',
        progress: 0,
      });
    }
  };

  // 关闭弹窗
  const closeModal = () => {
    setModalVisible(false);
    setEditingOrder(null);
    form.resetFields();
  };

  // 保存订单
  const handleSave = async (values: any) => {
    try {
      const submitData = {
        ...values,
        orderDate: values.orderDate ? values.orderDate.format('YYYY-MM-DD HH:mm:ss') : null,
        expectedDelivery: values.expectedDelivery ? values.expectedDelivery.format('YYYY-MM-DD') : null,
        actualDelivery: values.actualDelivery ? values.actualDelivery.format('YYYY-MM-DD') : null,
      };
      
      const url = editingOrder ? `/orders/${editingOrder.id}` : '/orders';
      const method = editingOrder ? 'put' : 'post';
      
      const response = await request[method]<ApiResponse<any>>(url, submitData);
      
      if (response.data.code === 0) {
        message.success(editingOrder ? '更新成功' : '创建成功');
        closeModal();
        fetchOrders();
      }
    } catch (error) {
      message.error('保存失败');
    }
  };

  // 删除订单
  const handleDelete = async (id: number) => {
    try {
      const response = await request.delete<ApiResponse<any>>(`/orders/${id}`);
      
      if (response.data.code === 0) {
        message.success('删除成功');
        fetchOrders();
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

  // 获取进度条状态
  const getProgressStatus = (status: string, progress: number) => {
    if (status === '已取消') return 'exception';
    if (status === '已完成') return 'success';
    if (progress === 100) return 'success';
    return 'active';
  };

  // 表格列配置
  const columns: ColumnsType<Order> = [
    {
      title: '订单信息',
      key: 'orderInfo',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <FileTextOutlined style={{ marginRight: 4, color: '#1890ff' }} />
            <Text strong>{record.orderNo}</Text>
          </div>
          <div style={{ marginBottom: 2 }}>
            <Text style={{ fontSize: 12 }}>{record.productName}</Text>
          </div>
          <div>
            <DollarOutlined style={{ marginRight: 4, color: '#faad14' }} />
            <Text strong style={{ color: '#f5222d' }}>
              ¥{record.amount?.toLocaleString() || 0}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: '客户信息',
      key: 'customer',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <UserOutlined style={{ marginRight: 4 }} />
            <Text strong>{record.customerName}</Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.customerPhone}
            </Text>
          </div>
        </div>
      ),
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
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress, record) => (
        <div>
          <Progress
            percent={progress}
            size="small"
            status={getProgressStatus(record.status, progress)}
            format={percent => `${percent}%`}
          />
        </div>
      ),
    },
    {
      title: '销售员',
      dataIndex: 'salesPerson',
      key: 'salesPerson',
      width: 100,
    },
    {
      title: '订单日期',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 120,
      render: (text) => (
        <div>
          <CalendarOutlined style={{ marginRight: 4, color: '#52c41a' }} />
          <Text style={{ fontSize: 12 }}>{text?.split(' ')[0]}</Text>
        </div>
      ),
    },
    {
      title: '交付日期',
      key: 'delivery',
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 2 }}>
            <Text type="secondary" style={{ fontSize: 11 }}>
              预期: {record.expectedDelivery || '-'}
            </Text>
          </div>
          {record.actualDelivery && (
            <div>
              <CheckCircleOutlined style={{ marginRight: 2, color: '#52c41a' }} />
              <Text style={{ fontSize: 11, color: '#52c41a' }}>
                {record.actualDelivery}
              </Text>
            </div>
          )}
        </div>
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
            title="确定要删除这个订单吗？"
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
    <div className="orders-page">
      <Card>
        <div className="page-header">
          <Title level={3} style={{ margin: 0 }}>
            订单管理
          </Title>
          <Text type="secondary">
            管理销售订单，跟踪订单进度
          </Text>
        </div>

        <Divider />

        {/* 操作区域 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Input.Search
              placeholder="搜索订单号、客户"
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
          <Col xs={12} sm={6} md={6} lg={4}>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              style={{ width: '100%' }}
              onChange={(dates) => handleFilter('dateRange', dates)}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              新增订单
            </Button>
          </Col>
        </Row>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1500 }}
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
        title={editingOrder ? '编辑订单' : '新增订单'}
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
                label="订单编号"
                name="orderNo"
                rules={[{ required: true, message: '请输入订单编号' }]}
              >
                <Input placeholder="请输入订单编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="订单日期"
                name="orderDate"
                rules={[{ required: true, message: '请选择订单日期' }]}
              >
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder="选择订单日期"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="客户姓名"
                name="customerName"
                rules={[{ required: true, message: '请输入客户姓名' }]}
              >
                <Input placeholder="请输入客户姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="客户电话"
                name="customerPhone"
                rules={[
                  { required: true, message: '请输入客户电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
                ]}
              >
                <Input placeholder="请输入客户电话" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="产品/服务"
                name="productName"
                rules={[{ required: true, message: '请选择产品/服务' }]}
              >
                <Select placeholder="请选择产品/服务">
                  {productOptions.map(product => (
                    <Option key={product} value={product}>
                      {product}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="订单金额 (¥)"
                name="amount"
                rules={[{ required: true, message: '请输入订单金额' }]}
              >
                <InputNumber
                  placeholder="0"
                  min={0}
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="订单状态"
                name="status"
                rules={[{ required: true, message: '请选择订单状态' }]}
              >
                <Select placeholder="请选择订单状态">
                  {statusOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="完成进度 (%)"
                name="progress"
                rules={[{ required: true, message: '请输入完成进度' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                  placeholder="0-100"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="销售员"
                name="salesPerson"
                rules={[{ required: true, message: '请输入销售员' }]}
              >
                <Input placeholder="请输入销售员" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="预期交付日期"
                name="expectedDelivery"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="选择预期交付日期"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="实际交付日期"
                name="actualDelivery"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="选择实际交付日期"
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
              placeholder="请输入订单相关备注信息"
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

export default Orders;
