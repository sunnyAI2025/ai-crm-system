import React from 'react';
import { Row, Col, Card, Statistic, Typography, Progress, List } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  TrophyOutlined,
  RiseOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  // 模拟数据
  const statisticsData = [
    {
      title: '总线索数',
      value: 1234,
      icon: <UserOutlined style={{ color: '#1890ff' }} />,
      color: '#1890ff',
      prefix: '',
      suffix: '个',
    },
    {
      title: '转化客户',
      value: 856,
      icon: <TeamOutlined style={{ color: '#52c41a' }} />,
      color: '#52c41a',
      prefix: '',
      suffix: '个',
    },
    {
      title: '成交订单',
      value: 432,
      icon: <ShoppingCartOutlined style={{ color: '#faad14' }} />,
      color: '#faad14',
      prefix: '',
      suffix: '笔',
    },
    {
      title: '总营收',
      value: 125680,
      icon: <DollarOutlined style={{ color: '#f5222d' }} />,
      color: '#f5222d',
      prefix: '¥',
      suffix: '',
    },
  ];

  const recentActivities = [
    {
      title: '新增线索：张三 - 会计培训',
      time: '5分钟前',
    },
    {
      title: '客户转化：李四成为正式客户',
      time: '15分钟前',
    },
    {
      title: '订单成交：王五购买高级课程',
      time: '1小时前',
    },
    {
      title: '营销活动：春季优惠活动开始',
      time: '2小时前',
    },
  ];

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          欢迎回来！
        </Title>
        <Text type="secondary">
          这里是您的数据概览，让我们一起查看今天的业务情况
        </Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statisticsData.map((item, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={item.title}
                value={item.value}
                prefix={item.prefix}
                suffix={item.suffix}
                valueStyle={{ color: item.color }}
              />
              <div style={{ marginTop: 8 }}>
                {item.icon}
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  较昨日 +12%
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* 销售趋势 */}
        <Col xs={24} lg={16}>
          <Card title="销售趋势" extra={<RiseOutlined />}>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <TrophyOutlined style={{ fontSize: 48, color: '#faad14' }} />
              <div style={{ marginTop: 16 }}>
                <Title level={4}>本月销售表现优秀</Title>
                <Text type="secondary">
                  相比上月同期增长 25%，继续保持良好势头
                </Text>
              </div>
              <div style={{ marginTop: 24 }}>
                <Text strong>目标完成度</Text>
                <Progress percent={75} status="active" style={{ marginTop: 8 }} />
              </div>
            </div>
          </Card>
        </Col>

        {/* 最近动态 */}
        <Col xs={24} lg={8}>
          <Card title="最近动态" style={{ height: '100%' }}>
            <List
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Text style={{ fontSize: 14 }}>{item.title}</Text>}
                    description={
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.time}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
