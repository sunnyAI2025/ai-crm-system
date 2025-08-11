import React, { useState, useRef, useEffect } from 'react';
import {
  FloatButton,
  Modal,
  Input,
  Button,
  Space,
  Typography,
  Avatar,
  Card,
  Tag,
  Spin,
  Empty,
  message,
} from 'antd';
import {
  RobotOutlined,
  SendOutlined,
  CloseOutlined,
  UserOutlined,
  BarChartOutlined,
  BulbOutlined,
  QuestionCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import request from '@/utils/request';
import type { ApiResponse } from '@/types/api';
import './index.css';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface AiAnalysisType {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const AiChat: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AI分析功能类型
  const analysisTypes: AiAnalysisType[] = [
    {
      key: 'trend_analysis',
      title: '销售趋势分析',
      description: '分析销售数据趋势，预测未来走势',
      icon: <BarChartOutlined />,
      color: '#1890ff',
    },
    {
      key: 'customer_insight',
      title: '客户洞察分析',
      description: '深度分析客户行为和偏好',
      icon: <BulbOutlined />,
      color: '#52c41a',
    },
    {
      key: 'risk_assessment',
      title: '风险评估预警',
      description: '评估客户流失风险和订单风险',
      icon: <ThunderboltOutlined />,
      color: '#faad14',
    },
    {
      key: 'performance_report',
      title: '业绩报告生成',
      description: '自动生成详细的业绩分析报告',
      icon: <QuestionCircleOutlined />,
      color: '#722ed1',
    },
  ];

  // 示例问题
  const sampleQuestions = [
    '本月销售业绩如何？',
    '哪些客户有流失风险？',
    '最有效的营销渠道是什么？',
    '预测下个月的销售目标',
    '分析客户满意度趋势',
  ];

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化欢迎消息
  useEffect(() => {
    if (visible && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: '您好！我是AI数据分析助手🤖\n\n我可以帮您分析CRM系统中的数据，包括：\n• 销售趋势分析\n• 客户洞察分析\n• 风险评估预警\n• 业绩报告生成\n\n请告诉我您想了解什么？',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [visible]);

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    // AI思考状态
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: '正在分析数据...',
      timestamp: new Date(),
      isTyping: true,
    };

    setMessages(prev => [...prev, thinkingMessage]);

    try {
      // 模拟AI响应
      const response = await simulateAiResponse(content);
      
      setTimeout(() => {
        setMessages(prev => {
          const newMessages = prev.filter(m => !m.isTyping);
          return [...newMessages, {
            id: Date.now().toString(),
            type: 'ai',
            content: response,
            timestamp: new Date(),
          }];
        });
        setLoading(false);
      }, 1500);

    } catch (error) {
      message.error('AI分析失败，请重试');
      setMessages(prev => prev.filter(m => !m.isTyping));
      setLoading(false);
    }
  };

  // 模拟AI响应
  const simulateAiResponse = async (question: string): Promise<string> => {
    // 这里可以集成真实的AI API
    const responses: { [key: string]: string } = {
      '销售': `📊 **销售数据分析结果**\n\n**本月销售概况：**\n• 总订单数：156单 (+12%)\n• 销售金额：¥1,234,567 (+8.5%)\n• 平均客单价：¥7,913\n• 转化率：15.2% (+2.1%)\n\n**趋势分析：**\n• 销售呈上升趋势\n• 客单价稳定提升\n• 建议加强高价值客户维护`,
      
      '客户': `👥 **客户洞察分析**\n\n**客户结构分析：**\n• A级客户：23% (贡献70%营收)\n• B级客户：35% (贡献25%营收)\n• C级客户：42% (贡献5%营收)\n\n**客户行为洞察：**\n• 活跃度最高：制造业客户\n• 忠诚度最高：教育培训客户\n• 潜在流失：5个C级客户\n\n**建议：**\n• 重点维护A级客户\n• 提升B级客户价值`,
      
      '风险': `⚠️ **风险评估报告**\n\n**客户流失风险：**\n• 高风险：2个客户\n• 中风险：5个客户\n• 原因：长期未联系、满意度下降\n\n**订单风险：**\n• 逾期订单：3个\n• 延期交付风险：8个订单\n\n**建议措施：**\n• 立即联系高风险客户\n• 优化交付流程\n• 建立客户关怀计划`,
      
      '营销': `📈 **营销效果分析**\n\n**渠道效果排名：**\n1. 微信推广 - ROI: 320%\n2. 百度广告 - ROI: 180%\n3. 线下活动 - ROI: 150%\n4. 邮件营销 - ROI: 95%\n\n**转化数据：**\n• 线索转化率：23.5%\n• 平均转化周期：15天\n• 最佳转化时间：周二-周四\n\n**优化建议：**\n• 增加微信推广投入\n• 优化邮件营销策略`,
      
      '预测': `🔮 **销售预测分析**\n\n**下月预测：**\n• 预期订单数：180-200单\n• 预期金额：¥1,450,000-¥1,600,000\n• 预测准确度：85%\n\n**预测依据：**\n• 历史销售趋势\n• 季节性因素\n• 营销活动计划\n• 客户购买周期\n\n**风险因素：**\n• 市场竞争加剧\n• 经济环境变化\n\n**建议：**\n• 制定弹性销售计划\n• 加强客户关系维护`,
    };

    // 简单的关键词匹配
    for (const [key, response] of Object.entries(responses)) {
      if (question.includes(key)) {
        return response;
      }
    }

    return `🤔 **智能分析中...**\n\n根据您的问题："${question}"\n\n我正在分析相关数据，为了给您更准确的分析结果，请提供更具体的信息：\n\n• 您关注的时间范围？\n• 具体的业务模块？\n• 需要什么类型的分析？\n\n您也可以尝试问我：\n• 本月销售业绩分析\n• 客户流失风险评估\n• 营销效果分析\n• 业绩预测报告`;
  };

  // 快速问题点击
  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  // 分析类型点击
  const handleAnalysisType = (type: AiAnalysisType) => {
    const question = `请进行${type.title}`;
    sendMessage(question);
  };

  return (
    <>
      {/* 悬浮按钮 */}
      <FloatButton
        icon={<RobotOutlined />}
        type="primary"
        style={{
          right: 24,
          bottom: 24,
          width: 60,
          height: 60,
        }}
        onClick={() => setVisible(true)}
        tooltip="AI数据分析助手"
      />

      {/* 聊天弹窗 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <RobotOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <span>AI数据分析助手</span>
          </div>
        }
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={600}
        style={{ top: 20 }}
        className="ai-chat-modal"
      >
        <div className="ai-chat-container">
          {/* AI功能介绍 */}
          {messages.length <= 1 && (
            <div className="ai-features" style={{ marginBottom: 16 }}>
              <Title level={5}>🚀 AI分析功能</Title>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {analysisTypes.map(type => (
                  <Card
                    key={type.key}
                    size="small"
                    hoverable
                    style={{ 
                      cursor: 'pointer',
                      borderColor: type.color,
                    }}
                    onClick={() => handleAnalysisType(type)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ color: type.color, marginRight: 8 }}>
                        {type.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 12 }}>
                          {type.title}
                        </div>
                        <div style={{ fontSize: 11, color: '#666' }}>
                          {type.description}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 消息区域 */}
          <div className="messages-container">
            {messages.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="开始与AI助手对话"
              />
            ) : (
              messages.map(message => (
                <div
                  key={message.id}
                  className={`message ${message.type === 'user' ? 'user-message' : 'ai-message'}`}
                >
                  <div className="message-avatar">
                    <Avatar
                      icon={message.type === 'user' ? <UserOutlined /> : <RobotOutlined />}
                      style={{
                        backgroundColor: message.type === 'user' ? '#1890ff' : '#52c41a',
                      }}
                    />
                  </div>
                  <div className="message-content">
                    <div className="message-bubble">
                      {message.isTyping ? (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Spin size="small" style={{ marginRight: 8 }} />
                          <Text type="secondary">{message.content}</Text>
                        </div>
                      ) : (
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                          {message.content}
                        </div>
                      )}
                    </div>
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 快速问题 */}
          {messages.length > 0 && messages.length < 3 && (
            <div className="quick-questions" style={{ margin: '16px 0' }}>
              <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
                💡 试试这些问题：
              </Text>
              <Space wrap>
                {sampleQuestions.slice(0, 3).map((question, index) => (
                  <Tag
                    key={index}
                    color="blue"
                    style={{ cursor: 'pointer', margin: 2 }}
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </Tag>
                ))}
              </Space>
            </div>
          )}

          {/* 输入区域 */}
          <div className="input-area">
            <div style={{ display: 'flex', gap: 8 }}>
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="请输入您的问题，比如：本月销售业绩如何？"
                autoSize={{ minRows: 1, maxRows: 3 }}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    sendMessage(inputValue);
                  }
                }}
                disabled={loading}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim() || loading}
                loading={loading}
              >
                发送
              </Button>
            </div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
              Shift + Enter 换行，Enter 发送
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AiChat;
