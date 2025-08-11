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
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  RocketOutlined,
  BarChartOutlined,
  EyeOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import request from '@/utils/request';
import type { ApiResponse } from '@/types/api';
import './index.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface Campaign {
  id: number;
  name: string;
  type: string;
  status: string;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  targetAudience: string;
  channels: string[];
  leads: number;
  conversions: number;
  conversionRate: number;
  roi: number;
  description?: string;
  createdAt: string;
  createdBy: string;
}

interface CampaignsResponse {
  list: Campaign[];
  total: number;
  page: number;
  pageSize: number;
}

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [form] = Form.useForm();

  // 活动状态选项
  const statusOptions = [
    { label: '草稿', value: '草稿', color: 'default' },
    { label: '计划中', value: '计划中', color: 'blue' },
    { label: '进行中', value: '进行中', color: 'green' },
    { label: '已暂停', value: '已暂停', color: 'orange' },
    { label: '已结束', value: '已结束', color: 'red' },
    { label: '已完成', value: '已完成', color: 'purple' },
  ];

  // 活动类型选项
  const typeOptions = [
    '搜索引擎营销',
    '社交媒体推广',
    '内容营销',
    '邮件营销',
    '线下活动',
    '展会营销',
    '联盟推广',
    '其他',
  ];

  // 推广渠道选项
  const channelOptions = [
    '百度推广',
    '微信朋友圈',
    '微博推广',
    '抖音广告',
    '邮件营销',
    '短信营销',
    '线下展会',
    '合作伙伴',
  ];

  // 目标受众选项
  const audienceOptions = [
    '企业管理者',
    '财务人员',
    '中小企业主',
    '大型企业',
    '初创公司',
    '教育机构',
    '制造企业',
    '服务行业',
  ];

  // 获取活动列表
  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params = {
        page: current,
        pageSize,
        search: searchText,
        status: statusFilter,
        type: typeFilter,
      };
      
      const response = await request.get<ApiResponse<CampaignsResponse>>('/campaigns', { params });
      
      if (response.data.code === 0) {
        setCampaigns(response.data.data.list);
        setTotal(response.data.data.total);
      }
    } catch (error) {
      console.error('获取活动列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchCampaigns();
  }, [current, pageSize, searchText, statusFilter, typeFilter]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrent(1);
  };

  // 处理筛选
  const handleFilter = (type: string, value: string) => {
    if (type === 'status') {
      setStatusFilter(value);
    } else if (type === 'type') {
      setTypeFilter(value);
    }
    setCurrent(1);
  };

  // 打开新增/编辑弹窗
  const openModal = (campaign?: Campaign) => {
    setEditingCampaign(campaign || null);
    setModalVisible(true);
    
    if (campaign) {
      form.setFieldsValue({
        ...campaign,
        dateRange: [new Date(campaign.startDate), new Date(campaign.endDate)],
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: '草稿',
        budget: 0,
        spent: 0,
        leads: 0,
        conversions: 0,
      });
    }
  };

  // 关闭弹窗
  const closeModal = () => {
    setModalVisible(false);
    setEditingCampaign(null);
    form.resetFields();
  };

  // 保存活动
  const handleSave = async (values: any) => {
    try {
      const submitData = {
        ...values,
        startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
        conversionRate: values.conversions && values.leads ? 
          (values.conversions / values.leads * 100).toFixed(2) : 0,
        roi: values.budget && values.spent ? 
          ((values.budget - values.spent) / values.spent * 100).toFixed(2) : 0,
      };
      delete submitData.dateRange;
      
      const url = editingCampaign ? `/campaigns/${editingCampaign.id}` : '/campaigns';
      const method = editingCampaign ? 'put' : 'post';
      
      const response = await request[method]<ApiResponse<any>>(url, submitData);
      
      if (response.data.code === 0) {
        message.success(editingCampaign ? '更新成功' : '创建成功');
        closeModal();
        fetchCampaigns();
      }
    } catch (error) {
      message.error('保存失败');
    }
  };

  // 删除活动
  const handleDelete = async (id: number) => {
    try {
      const response = await request.delete<ApiResponse<any>>(`/campaigns/${id}`);
      
      if (response.data.code === 0) {
        message.success('删除成功');
        fetchCampaigns();
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

  // 计算转化率
  const calculateConversionRate = (conversions: number, leads: number) => {
    return leads > 0 ? ((conversions / leads) * 100).toFixed(1) : '0';
  };

  // 计算ROI
  const calculateROI = (budget: number, spent: number) => {
    return spent > 0 ? (((budget - spent) / spent) * 100).toFixed(1) : '0';
  };

  // 表格列配置
  const columns: ColumnsType<Campaign> = [
    {
      title: '活动信息',
      key: 'campaignInfo',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <RocketOutlined style={{ marginRight: 4, color: '#1890ff' }} />
            <Text strong>{record.name}</Text>
          </div>
          <div style={{ marginBottom: 2 }}>
            <Tag color="blue">{record.type}</Tag>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.targetAudience}
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
      title: '预算/支出',
      key: 'budget',
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 2 }}>
            <DollarOutlined style={{ marginRight: 4, color: '#faad14' }} />
            <Text strong>¥{record.budget?.toLocaleString() || 0}</Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              已花费: ¥{record.spent?.toLocaleString() || 0}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: '活动周期',
      key: 'period',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 2 }}>
            <CalendarOutlined style={{ marginRight: 4, color: '#52c41a' }} />
            <Text style={{ fontSize: 12 }}>{record.startDate}</Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              至 {record.endDate}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: '效果数据',
      key: 'performance',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <UserOutlined style={{ marginRight: 4 }} />
            <Text>{record.leads} 线索</Text>
          </div>
          <div style={{ marginBottom: 4 }}>
            <BarChartOutlined style={{ marginRight: 4 }} />
            <Text>{record.conversions} 转化</Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              转化率: {calculateConversionRate(record.conversions, record.leads)}%
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'ROI',
      dataIndex: 'roi',
      key: 'roi',
      width: 80,
      render: (_, record) => (
        <Text 
          style={{ 
            color: Number(calculateROI(record.budget, record.spent)) > 0 ? '#52c41a' : '#f5222d',
            fontWeight: 'bold'
          }}
        >
          {calculateROI(record.budget, record.spent)}%
        </Text>
      ),
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 100,
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
            icon={<EyeOutlined />}
          >
            详情
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
            title="确定要删除这个活动吗？"
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
    <div className="campaigns-page">
      {/* 数据统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6} lg={6}>
          <Card>
            <Statistic
              title="活动总数"
              value={total}
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={6}>
          <Card>
            <Statistic
              title="进行中"
              value={campaigns.filter(c => c.status === '进行中').length}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={6}>
          <Card>
            <Statistic
              title="总预算"
              value={campaigns.reduce((sum, c) => sum + (c.budget || 0), 0)}
              prefix="¥"
              valueStyle={{ color: '#faad14' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={6}>
          <Card>
            <Statistic
              title="总线索"
              value={campaigns.reduce((sum, c) => sum + (c.leads || 0), 0)}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div className="page-header">
          <Title level={3} style={{ margin: 0 }}>
            营销活动管理
          </Title>
          <Text type="secondary">
            管理营销推广活动，分析活动效果
          </Text>
        </div>

        <Divider />

        {/* 操作区域 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Input.Search
              placeholder="搜索活动名称"
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
              placeholder="类型筛选"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilter('type', value || '')}
            >
              {typeOptions.map(type => (
                <Option key={type} value={type}>
                  {type}
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
              新建活动
            </Button>
          </Col>
        </Row>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={campaigns}
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
        title={editingCampaign ? '编辑活动' : '新建活动'}
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
                label="活动名称"
                name="name"
                rules={[{ required: true, message: '请输入活动名称' }]}
              >
                <Input placeholder="请输入活动名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="活动类型"
                name="type"
                rules={[{ required: true, message: '请选择活动类型' }]}
              >
                <Select placeholder="请选择活动类型">
                  {typeOptions.map(type => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="活动状态"
                name="status"
                rules={[{ required: true, message: '请选择活动状态' }]}
              >
                <Select placeholder="请选择活动状态">
                  {statusOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="目标受众"
                name="targetAudience"
                rules={[{ required: true, message: '请选择目标受众' }]}
              >
                <Select placeholder="请选择目标受众">
                  {audienceOptions.map(audience => (
                    <Option key={audience} value={audience}>
                      {audience}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="推广渠道"
            name="channels"
            rules={[{ required: true, message: '请选择推广渠道' }]}
          >
            <Select mode="multiple" placeholder="请选择推广渠道">
              {channelOptions.map(channel => (
                <Option key={channel} value={channel}>
                  {channel}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="活动周期"
            name="dateRange"
            rules={[{ required: true, message: '请选择活动周期' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="预算 (¥)"
                name="budget"
                rules={[{ required: true, message: '请输入预算' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="已花费 (¥)"
                name="spent"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="创建人"
                name="createdBy"
                rules={[{ required: true, message: '请输入创建人' }]}
              >
                <Input placeholder="请输入创建人" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="获得线索"
                name="leads"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="转化数量"
                name="conversions"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="活动描述"
            name="description"
          >
            <TextArea
              rows={4}
              placeholder="请输入活动描述和目标"
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

export default Campaigns;
