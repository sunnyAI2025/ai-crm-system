# CRM系统AI功能实现方案

## 概述

本文档详细定义了CRM系统中AI数据分析模块的技术实现方案，包括五大核心功能的技术架构、算法选择、数据流程、API设计和部署策略。

## AI功能架构设计

### 1. 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            AI数据分析服务 (50006)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   AI聊天引擎     │  │   NLP处理器     │  │   ML模型管理器   │              │
│  │  ChatController │  │ NLPService     │  │ MLModelService │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│              │                 │                 │                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   智能预测分析   │  │   个性化推荐     │  │   风险评估       │              │
│  │ PredictionService│  │RecommendService │  │ RiskService    │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│              │                 │                 │                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   自动报告生成   │  │   情感分析       │  │   数据预处理     │              │
│  │ ReportService   │  │SentimentService │  │ DataProcessor  │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
├─────────────────────────────────────────────────────────────────────────────┤
│                           数据访问层                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │    CRM数据库     │  │    AI模型存储    │  │   缓存服务       │              │
│  │   PostgreSQL    │  │    MinIO/S3     │  │     Redis      │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
├─────────────────────────────────────────────────────────────────────────────┤
│                         外部AI服务集成                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   OpenAI GPT    │  │   百度AI API    │  │   腾讯AI API     │              │
│  │   (主要LLM)     │  │   (备用LLM)     │  │   (情感分析)     │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2. 技术栈选择

#### 2.1 核心框架
- **后端框架**: Spring Boot 3.2.x + Spring AI
- **AI集成框架**: LangChain4j (Java版本的LangChain)
- **机器学习**: Python + scikit-learn + pandas (通过API调用)
- **自然语言处理**: OpenAI GPT-4 + 本地NLP模型
- **数据处理**: Apache Spark (可选，用于大数据处理)

#### 2.2 存储和缓存
- **主数据库**: PostgreSQL (CRM业务数据)
- **向量数据库**: Pinecone/Chroma (存储文本embeddings)
- **模型存储**: MinIO/AWS S3 (AI模型文件)
- **缓存服务**: Redis (热点数据缓存)
- **时序数据**: InfluxDB (可选，用于趋势分析)

#### 2.3 外部服务
- **主要LLM**: OpenAI GPT-4 Turbo
- **备用LLM**: 百度文心一言 / 阿里通义千问
- **情感分析**: 腾讯云NLP / 百度AI
- **图表生成**: ECharts / Chart.js

## 五大核心功能实现

### 1. 智能预测分析 (PredictionService)

#### 1.1 功能描述
基于历史数据预测销售趋势、客户行为和市场走向。

#### 1.2 技术实现

**算法选择**:
- **时间序列预测**: ARIMA + Prophet + LSTM
- **回归分析**: Random Forest + XGBoost
- **分类预测**: Support Vector Machine + Neural Networks

**数据源**:
```sql
-- 销售趋势预测数据源
SELECT 
    DATE_TRUNC('month', order_date) as month,
    COUNT(*) as order_count,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_order_value,
    COUNT(DISTINCT customer_id) as unique_customers
FROM orders 
WHERE order_status IN (3,4,5) 
    AND order_date >= NOW() - INTERVAL '24 months'
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month;

-- 客户行为预测数据源
SELECT 
    customer_id,
    business_type,
    source_channel,
    customer_level,
    total_order_amount,
    order_count,
    EXTRACT(EPOCH FROM (NOW() - last_order_date))/86400 as days_since_last_order,
    EXTRACT(EPOCH FROM (NOW() - created_at))/86400 as customer_age_days
FROM customers 
WHERE status = 1;
```

**实现架构**:
```java
@Service
public class PredictionService {
    
    @Autowired
    private PythonMLService mlService;
    
    @Autowired
    private CRMDataService dataService;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    /**
     * 销售趋势预测
     */
    public PredictionResult predictSalesTrend(PredictionRequest request) {
        // 1. 数据获取和预处理
        List<SalesData> historicalData = dataService.getSalesData(request);
        MLDataset dataset = preprocessData(historicalData);
        
        // 2. 模型预测
        PythonMLRequest mlRequest = buildMLRequest(dataset, "sales_trend");
        MLPredictionResult mlResult = mlService.predict(mlRequest);
        
        // 3. 结果后处理
        PredictionResult result = buildPredictionResult(mlResult, request);
        
        // 4. 缓存结果
        String cacheKey = "prediction:sales:" + request.getCacheKey();
        redisTemplate.opsForValue().set(cacheKey, result, Duration.ofHours(6));
        
        return result;
    }
    
    /**
     * 客户行为预测
     */
    public CustomerBehaviorPrediction predictCustomerBehavior(Long customerId) {
        // 获取客户特征数据
        CustomerFeatureData features = dataService.getCustomerFeatures(customerId);
        
        // 预测客户价值、流失概率、购买倾向
        Map<String, Double> predictions = mlService.predictMultipleTargets(
            features, Arrays.asList("customer_value", "churn_probability", "purchase_intent")
        );
        
        return CustomerBehaviorPrediction.builder()
            .customerId(customerId)
            .predictedValue(predictions.get("customer_value"))
            .churnProbability(predictions.get("churn_probability"))
            .purchaseIntent(predictions.get("purchase_intent"))
            .confidence(calculateConfidence(predictions))
            .build();
    }
}
```

**Python ML服务**:
```python
# ml_service.py - 独立的Python机器学习服务
from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from prophet import Prophet
import joblib
import redis

app = Flask(__name__)
redis_client = redis.Redis(host='localhost', port=6379, db=0)

class SalesTrendPredictor:
    def __init__(self):
        self.prophet_model = None
        self.rf_model = RandomForestRegressor(n_estimators=100)
        self.scaler = StandardScaler()
        
    def train_models(self, data):
        # Prophet模型训练 (时间序列)
        df_prophet = pd.DataFrame({
            'ds': data['date'],
            'y': data['revenue']
        })
        self.prophet_model = Prophet()
        self.prophet_model.fit(df_prophet)
        
        # Random Forest模型训练 (多特征)
        features = ['order_count', 'unique_customers', 'avg_order_value', 
                   'month', 'quarter', 'marketing_spend']
        X = data[features]
        y = data['revenue']
        
        X_scaled = self.scaler.fit_transform(X)
        self.rf_model.fit(X_scaled, y)
        
    def predict(self, future_periods=3):
        # Prophet预测
        future_dates = self.prophet_model.make_future_dataframe(periods=future_periods, freq='M')
        prophet_forecast = self.prophet_model.predict(future_dates)
        
        # Random Forest预测 (需要构造特征)
        # ... 特征工程逻辑
        
        return {
            'prophet_prediction': prophet_forecast.tail(future_periods).to_dict(),
            'rf_prediction': rf_predictions.tolist(),
            'confidence_intervals': prophet_forecast[['yhat_lower', 'yhat_upper']].tail(future_periods).to_dict()
        }

@app.route('/predict/sales_trend', methods=['POST'])
def predict_sales_trend():
    data = request.json
    predictor = SalesTrendPredictor()
    
    # 从Redis获取或重新训练模型
    model_key = f"model:sales_trend:{data['model_version']}"
    if redis_client.exists(model_key):
        predictor = joblib.loads(redis_client.get(model_key))
    else:
        training_data = pd.DataFrame(data['training_data'])
        predictor.train_models(training_data)
        redis_client.setex(model_key, 3600*24, joblib.dumps(predictor))
    
    # 执行预测
    result = predictor.predict(data.get('future_periods', 3))
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
```

#### 1.3 配置参数

```yaml
# application-ai.yml
ai:
  prediction:
    enabled: true
    models:
      sales-trend:
        algorithm: "prophet+randomforest"
        retrain-interval: "7d"
        confidence-threshold: 0.8
      customer-behavior:
        algorithm: "xgboost"
        retrain-interval: "30d"
        features: ["order_history", "interaction_frequency", "demographics"]
    cache:
      ttl: 6h
      redis-key-prefix: "prediction:"
  python-service:
    url: "http://localhost:5001"
    timeout: 30s
    retry-count: 3
```

### 2. 个性化推荐 (RecommendService)

#### 2.1 功能描述
基于客户画像和行为数据，提供个性化的产品推荐和服务策略。

#### 2.2 技术实现

**推荐算法**:
- **协同过滤**: User-Based + Item-Based
- **内容推荐**: TF-IDF + 余弦相似度
- **深度学习**: Neural Collaborative Filtering
- **混合推荐**: 加权融合多种算法

**实现代码**:
```java
@Service
public class RecommendService {
    
    @Autowired
    private CustomerProfileService profileService;
    
    @Autowired
    private CollaborativeFilteringEngine cfEngine;
    
    @Autowired
    private ContentBasedEngine contentEngine;
    
    /**
     * 获取个性化推荐
     */
    public PersonalizedRecommendation getRecommendations(Long customerId, String recommendationType) {
        // 1. 获取客户画像
        CustomerProfile profile = profileService.getCustomerProfile(customerId);
        
        // 2. 执行多种推荐算法
        List<RecommendationItem> cfRecommendations = cfEngine.recommend(customerId, 10);
        List<RecommendationItem> contentRecommendations = contentEngine.recommend(profile, 10);
        
        // 3. 混合推荐结果
        List<RecommendationItem> hybridResults = hybridRecommend(
            cfRecommendations, contentRecommendations, profile.getPreferences()
        );
        
        // 4. 生成推荐策略
        ServiceStrategy strategy = generateServiceStrategy(profile, hybridResults);
        
        return PersonalizedRecommendation.builder()
            .customerId(customerId)
            .recommendedProducts(hybridResults.subList(0, 5))
            .serviceStrategy(strategy)
            .reasoning(generateReasoning(profile, hybridResults))
            .confidence(calculateConfidence(hybridResults))
            .build();
    }
    
    /**
     * 混合推荐算法
     */
    private List<RecommendationItem> hybridRecommend(
            List<RecommendationItem> cfResults, 
            List<RecommendationItem> contentResults,
            CustomerPreferences preferences) {
        
        Map<String, Double> itemScores = new HashMap<>();
        
        // 协同过滤权重
        double cfWeight = 0.6;
        cfResults.forEach(item -> 
            itemScores.put(item.getItemId(), item.getScore() * cfWeight)
        );
        
        // 内容推荐权重
        double contentWeight = 0.4;
        contentResults.forEach(item -> 
            itemScores.merge(item.getItemId(), item.getScore() * contentWeight, Double::sum)
        );
        
        // 根据客户偏好调整权重
        itemScores.replaceAll((itemId, score) -> 
            score * getPreferenceMultiplier(itemId, preferences)
        );
        
        return itemScores.entrySet().stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .map(entry -> RecommendationItem.builder()
                .itemId(entry.getKey())
                .score(entry.getValue())
                .build())
            .collect(Collectors.toList());
    }
}

/**
 * 协同过滤推荐引擎
 */
@Component
public class CollaborativeFilteringEngine {
    
    public List<RecommendationItem> recommend(Long customerId, int count) {
        // 1. 获取用户-物品交互矩阵
        Map<Long, Map<String, Double>> userItemMatrix = getUserItemMatrix();
        
        // 2. 计算用户相似度
        Map<Long, Double> userSimilarities = calculateUserSimilarities(customerId, userItemMatrix);
        
        // 3. 生成推荐
        Map<String, Double> recommendations = new HashMap<>();
        
        userSimilarities.entrySet().stream()
            .filter(entry -> entry.getValue() > 0.3) // 相似度阈值
            .forEach(entry -> {
                Long similarUserId = entry.getKey();
                Double similarity = entry.getValue();
                
                Map<String, Double> similarUserItems = userItemMatrix.get(similarUserId);
                Map<String, Double> currentUserItems = userItemMatrix.get(customerId);
                
                similarUserItems.entrySet().stream()
                    .filter(item -> !currentUserItems.containsKey(item.getKey()))
                    .forEach(item -> 
                        recommendations.merge(item.getKey(), 
                            item.getValue() * similarity, Double::sum)
                    );
            });
        
        return recommendations.entrySet().stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(count)
            .map(entry -> RecommendationItem.builder()
                .itemId(entry.getKey())
                .score(entry.getValue())
                .algorithm("collaborative_filtering")
                .build())
            .collect(Collectors.toList());
    }
}
```

### 3. 自动报告生成 (ReportService)

#### 3.1 功能描述
基于CRM数据自动生成各类业务分析报告。

#### 3.2 技术实现

**报告类型**:
- **销售业绩报告**: 销售数据分析和趋势
- **客户分析报告**: 客户群体特征和行为
- **营销效果报告**: 推广活动ROI分析
- **风险评估报告**: 业务风险识别和建议

**实现架构**:
```java
@Service
public class ReportService {
    
    @Autowired
    private ReportTemplateEngine templateEngine;
    
    @Autowired
    private DataAnalysisService analysisService;
    
    @Autowired
    private ChartGenerationService chartService;
    
    @Autowired
    private OpenAIService openAIService;
    
    /**
     * 生成销售业绩报告
     */
    public Report generateSalesReport(ReportRequest request) {
        // 1. 数据收集
        SalesReportData data = collectSalesData(request);
        
        // 2. 数据分析
        SalesAnalysisResult analysis = analysisService.analyzeSalesData(data);
        
        // 3. 图表生成
        List<Chart> charts = chartService.generateSalesCharts(analysis);
        
        // 4. AI洞察生成
        String insights = openAIService.generateInsights(analysis, 
            "请分析以下销售数据，提供关键洞察和建议");
        
        // 5. 报告组装
        return Report.builder()
            .title("销售业绩分析报告")
            .period(request.getPeriod())
            .summary(generateSummary(analysis))
            .insights(insights)
            .charts(charts)
            .recommendations(generateRecommendations(analysis))
            .generatedAt(LocalDateTime.now())
            .build();
    }
    
    /**
     * 使用AI生成报告洞察
     */
    private String generateInsights(SalesAnalysisResult analysis) {
        String prompt = String.format("""
            基于以下CRM销售数据，请生成专业的业务分析洞察：
            
            数据概览：
            - 总销售额：¥%,.2f
            - 订单数量：%d
            - 平均客单价：¥%,.2f
            - 环比增长：%,.1f%%
            
            渠道分布：
            %s
            
            产品分析：
            %s
            
            请从以下角度分析：
            1. 关键业绩指标解读
            2. 增长驱动因素分析
            3. 潜在风险识别
            4. 优化建议
            
            要求：
            - 语言专业但易懂
            - 提供具体的数据支撑
            - 给出可执行的建议
            """, 
            analysis.getTotalRevenue(),
            analysis.getOrderCount(),
            analysis.getAvgOrderValue(),
            analysis.getGrowthRate(),
            formatChannelData(analysis.getChannelData()),
            formatProductData(analysis.getProductData())
        );
        
        return openAIService.chatCompletion(prompt);
    }
}

/**
 * OpenAI服务集成
 */
@Service
public class OpenAIService {
    
    @Value("${ai.openai.api-key}")
    private String apiKey;
    
    @Value("${ai.openai.model:gpt-4-turbo}")
    private String model;
    
    private final WebClient webClient;
    
    public OpenAIService() {
        this.webClient = WebClient.builder()
            .baseUrl("https://api.openai.com/v1")
            .defaultHeader("Authorization", "Bearer " + apiKey)
            .defaultHeader("Content-Type", "application/json")
            .build();
    }
    
    public String chatCompletion(String prompt) {
        ChatCompletionRequest request = ChatCompletionRequest.builder()
            .model(model)
            .messages(List.of(
                ChatMessage.builder()
                    .role("system")
                    .content("你是一个专业的CRM数据分析师，擅长解读业务数据并提供有价值的洞察。")
                    .build(),
                ChatMessage.builder()
                    .role("user")
                    .content(prompt)
                    .build()
            ))
            .temperature(0.7)
            .maxTokens(2000)
            .build();
        
        return webClient.post()
            .uri("/chat/completions")
            .bodyValue(request)
            .retrieve()
            .bodyToMono(ChatCompletionResponse.class)
            .map(response -> response.getChoices().get(0).getMessage().getContent())
            .block();
    }
}
```

### 4. 风险评估 (RiskService)

#### 4.1 功能描述
识别和评估业务风险，包括客户流失、业绩目标风险等。

#### 4.2 技术实现

**风险类型**:
- **客户流失风险**: 基于行为模式预测客户流失概率
- **业绩达成风险**: 预测销售目标完成情况
- **现金流风险**: 分析收款和资金流动风险
- **竞争风险**: 市场竞争态势分析

**实现代码**:
```java
@Service
public class RiskService {
    
    @Autowired
    private CustomerChurnPredictor churnPredictor;
    
    @Autowired
    private PerformanceRiskAnalyzer performanceAnalyzer;
    
    @Autowired
    private CashFlowAnalyzer cashFlowAnalyzer;
    
    /**
     * 客户流失风险评估
     */
    public ChurnRiskAssessment assessChurnRisk(ChurnRiskRequest request) {
        List<CustomerRiskProfile> riskProfiles = new ArrayList<>();
        
        // 获取所有活跃客户
        List<Customer> activeCustomers = customerService.getActiveCustomers(request.getDepartmentId());
        
        for (Customer customer : activeCustomers) {
            // 计算流失概率
            double churnProbability = churnPredictor.predict(customer.getId());
            
            // 风险等级分类
            RiskLevel riskLevel = categorizeRiskLevel(churnProbability);
            
            // 计算客户价值
            double customerValue = calculateCustomerValue(customer);
            
            // 风险影响评估
            double riskImpact = churnProbability * customerValue;
            
            if (riskLevel != RiskLevel.LOW) {
                riskProfiles.add(CustomerRiskProfile.builder()
                    .customerId(customer.getId())
                    .customerName(customer.getName())
                    .churnProbability(churnProbability)
                    .riskLevel(riskLevel)
                    .customerValue(customerValue)
                    .riskImpact(riskImpact)
                    .riskFactors(identifyRiskFactors(customer))
                    .mitigationActions(generateMitigationActions(customer, riskLevel))
                    .build());
            }
        }
        
        // 按风险影响排序
        riskProfiles.sort((a, b) -> Double.compare(b.getRiskImpact(), a.getRiskImpact()));
        
        return ChurnRiskAssessment.builder()
            .assessmentDate(LocalDateTime.now())
            .totalCustomers(activeCustomers.size())
            .highRiskCount(riskProfiles.stream().mapToInt(p -> p.getRiskLevel() == RiskLevel.HIGH ? 1 : 0).sum())
            .mediumRiskCount(riskProfiles.stream().mapToInt(p -> p.getRiskLevel() == RiskLevel.MEDIUM ? 1 : 0).sum())
            .totalRiskImpact(riskProfiles.stream().mapToDouble(CustomerRiskProfile::getRiskImpact).sum())
            .riskProfiles(riskProfiles)
            .overallRiskScore(calculateOverallRiskScore(riskProfiles, activeCustomers.size()))
            .build();
    }
    
    /**
     * 客户流失预测器
     */
    @Component
    public class CustomerChurnPredictor {
        
        public double predict(Long customerId) {
            // 获取客户特征
            CustomerFeatures features = extractCustomerFeatures(customerId);
            
            // 使用预训练模型预测
            return mlModelService.predict("churn_model", features.toArray());
        }
        
        private CustomerFeatures extractCustomerFeatures(Long customerId) {
            Customer customer = customerService.getById(customerId);
            List<Order> orders = orderService.getByCustomerId(customerId);
            List<TrackingRecord> records = trackingService.getByCustomerId(customerId);
            
            return CustomerFeatures.builder()
                .daysSinceLastOrder(calculateDaysSinceLastOrder(orders))
                .orderFrequency(calculateOrderFrequency(orders))
                .avgOrderValue(calculateAvgOrderValue(orders))
                .totalSpent(calculateTotalSpent(orders))
                .interactionFrequency(calculateInteractionFrequency(records))
                .daysSinceLastContact(calculateDaysSinceLastContact(records))
                .supportTicketCount(calculateSupportTicketCount(customerId))
                .paymentDelay(calculateAvgPaymentDelay(orders))
                .customerAge(calculateCustomerAge(customer))
                .businessType(encodeBusinessType(customer.getBusinessType()))
                .sourceChannel(encodeSourceChannel(customer.getSourceChannel()))
                .build();
        }
    }
}
```

### 5. 情感分析 (SentimentService)

#### 5.1 功能描述
分析客户反馈、评价和沟通记录中的情感倾向。

#### 5.2 技术实现

**分析维度**:
- **客户满意度**: 基于沟通记录分析客户情感
- **服务质量**: 分析客户对服务的情感反馈
- **产品体验**: 分析客户对产品的情感态度
- **团队士气**: 分析员工工作状态和情感

**实现代码**:
```java
@Service
public class SentimentService {
    
    @Autowired
    private TencentNLPService tencentNLP;
    
    @Autowired
    private BaiduNLPService baiduNLP;
    
    @Autowired
    private LocalNLPService localNLP;
    
    /**
     * 客户情感分析
     */
    public CustomerSentimentAnalysis analyzeCustomerSentiment(Long customerId, String timeRange) {
        // 1. 获取客户沟通记录
        List<TrackingRecord> trackingRecords = trackingService.getByCustomerId(customerId, timeRange);
        
        // 2. 提取文本内容
        List<String> textContents = trackingRecords.stream()
            .map(TrackingRecord::getContent)
            .filter(content -> content != null && !content.trim().isEmpty())
            .collect(Collectors.toList());
        
        if (textContents.isEmpty()) {
            return CustomerSentimentAnalysis.builder()
                .customerId(customerId)
                .overallSentiment(SentimentType.NEUTRAL)
                .confidence(0.0)
                .message("无足够的文本数据进行分析")
                .build();
        }
        
        // 3. 批量情感分析
        List<SentimentResult> sentimentResults = new ArrayList<>();
        for (String text : textContents) {
            SentimentResult result = analyzeSingleText(text);
            sentimentResults.add(result);
        }
        
        // 4. 聚合分析结果
        SentimentAggregation aggregation = aggregateSentiments(sentimentResults);
        
        // 5. 生成洞察
        String insights = generateSentimentInsights(aggregation, trackingRecords);
        
        return CustomerSentimentAnalysis.builder()
            .customerId(customerId)
            .analysisTimeRange(timeRange)
            .overallSentiment(aggregation.getOverallSentiment())
            .confidence(aggregation.getConfidence())
            .sentimentDistribution(aggregation.getDistribution())
            .sentimentTrend(aggregation.getTrend())
            .insights(insights)
            .recommendations(generateSentimentRecommendations(aggregation))
            .analyzedAt(LocalDateTime.now())
            .build();
    }
    
    /**
     * 单条文本情感分析
     */
    private SentimentResult analyzeSingleText(String text) {
        // 尝试多个NLP服务，取最可信的结果
        List<SentimentResult> results = new ArrayList<>();
        
        // 腾讯云NLP
        try {
            SentimentResult tencentResult = tencentNLP.analyzeSentiment(text);
            results.add(tencentResult);
        } catch (Exception e) {
            log.warn("腾讯云NLP分析失败: {}", e.getMessage());
        }
        
        // 百度NLP (备用)
        try {
            SentimentResult baiduResult = baiduNLP.analyzeSentiment(text);
            results.add(baiduResult);
        } catch (Exception e) {
            log.warn("百度NLP分析失败: {}", e.getMessage());
        }
        
        // 本地NLP模型 (兜底)
        if (results.isEmpty()) {
            SentimentResult localResult = localNLP.analyzeSentiment(text);
            results.add(localResult);
        }
        
        // 融合多个结果
        return fuseSentimentResults(results);
    }
    
    /**
     * 融合多个情感分析结果
     */
    private SentimentResult fuseSentimentResults(List<SentimentResult> results) {
        if (results.size() == 1) {
            return results.get(0);
        }
        
        // 加权平均
        double positiveScore = results.stream()
            .mapToDouble(r -> r.getPositiveScore() * r.getConfidence())
            .average().orElse(0.0);
        
        double negativeScore = results.stream()
            .mapToDouble(r -> r.getNegativeScore() * r.getConfidence())
            .average().orElse(0.0);
        
        double neutralScore = results.stream()
            .mapToDouble(r -> r.getNeutralScore() * r.getConfidence())
            .average().orElse(0.0);
        
        double avgConfidence = results.stream()
            .mapToDouble(SentimentResult::getConfidence)
            .average().orElse(0.0);
        
        // 归一化
        double total = positiveScore + negativeScore + neutralScore;
        if (total > 0) {
            positiveScore /= total;
            negativeScore /= total;
            neutralScore /= total;
        }
        
        // 确定主要情感
        SentimentType sentiment = SentimentType.NEUTRAL;
        if (positiveScore > negativeScore && positiveScore > neutralScore) {
            sentiment = SentimentType.POSITIVE;
        } else if (negativeScore > positiveScore && negativeScore > neutralScore) {
            sentiment = SentimentType.NEGATIVE;
        }
        
        return SentimentResult.builder()
            .sentiment(sentiment)
            .positiveScore(positiveScore)
            .negativeScore(negativeScore)
            .neutralScore(neutralScore)
            .confidence(avgConfidence)
            .build();
    }
}

/**
 * 腾讯云NLP服务
 */
@Service
public class TencentNLPService {
    
    @Value("${ai.tencent.secret-id}")
    private String secretId;
    
    @Value("${ai.tencent.secret-key}")
    private String secretKey;
    
    private NlpClient nlpClient;
    
    @PostConstruct
    public void init() {
        Credential cred = new Credential(secretId, secretKey);
        HttpProfile httpProfile = new HttpProfile();
        httpProfile.setEndpoint("nlp.tencentcloudapi.com");
        
        ClientProfile clientProfile = new ClientProfile();
        clientProfile.setHttpProfile(httpProfile);
        
        this.nlpClient = new NlpClient(cred, "ap-beijing", clientProfile);
    }
    
    public SentimentResult analyzeSentiment(String text) {
        try {
            SentimentAnalysisRequest request = new SentimentAnalysisRequest();
            request.setText(text);
            
            SentimentAnalysisResponse response = nlpClient.SentimentAnalysis(request);
            
            return SentimentResult.builder()
                .sentiment(mapTencentSentiment(response.getSentiment()))
                .positiveScore(response.getPositive())
                .negativeScore(response.getNegative())
                .neutralScore(response.getNeutral())
                .confidence(response.getConfidence())
                .build();
        } catch (Exception e) {
            throw new RuntimeException("腾讯云情感分析失败", e);
        }
    }
}
```

## AI聊天引擎实现

### 1. 聊天架构设计

```java
@RestController
@RequestMapping("/api/analytics/chat")
public class AIChatController {
    
    @Autowired
    private AIChatService chatService;
    
    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request) {
        return chatService.processMessage(request);
    }
}

@Service
public class AIChatService {
    
    @Autowired
    private IntentRecognitionService intentService;
    
    @Autowired
    private EntityExtractionService entityService;
    
    @Autowired
    private ContextManagementService contextService;
    
    @Autowired
    private Map<String, AIFunctionHandler> functionHandlers;
    
    public ChatResponse processMessage(ChatRequest request) {
        // 1. 意图识别
        Intent intent = intentService.recognizeIntent(request.getMessage());
        
        // 2. 实体提取
        List<Entity> entities = entityService.extractEntities(request.getMessage());
        
        // 3. 上下文管理
        ChatContext context = contextService.getContext(request.getSessionId());
        context.updateWithMessage(request, intent, entities);
        
        // 4. 功能路由
        AIFunctionHandler handler = functionHandlers.get(intent.getFunctionName());
        if (handler != null) {
            return handler.handle(request, context);
        }
        
        // 5. 默认对话处理
        return handleGeneralChat(request, context);
    }
}

/**
 * 销售分析功能处理器
 */
@Component("sales_analysis")
public class SalesAnalysisHandler implements AIFunctionHandler {
    
    @Autowired
    private SalesDataService salesDataService;
    
    @Autowired
    private OpenAIService openAIService;
    
    @Override
    public ChatResponse handle(ChatRequest request, ChatContext context) {
        // 解析查询参数
        SalesQueryParams params = parseQueryParams(request, context);
        
        // 获取销售数据
        SalesAnalysisData data = salesDataService.getSalesAnalysis(params);
        
        // 生成AI回复
        String aiResponse = generateSalesAnalysisResponse(data, request.getMessage());
        
        // 构建响应
        return ChatResponse.builder()
            .response(aiResponse)
            .sessionId(request.getSessionId())
            .actions(generateActionButtons(data))
            .relatedQuestions(generateRelatedQuestions(data))
            .charts(generateCharts(data))
            .timestamp(LocalDateTime.now())
            .build();
    }
    
    private String generateSalesAnalysisResponse(SalesAnalysisData data, String userMessage) {
        String prompt = String.format("""
            用户问题：%s
            
            销售数据分析结果：
            %s
            
            请以CRM智能助手的身份，用专业但易懂的语言回答用户问题。
            要求：
            1. 直接回答用户关心的问题
            2. 提供具体的数据支撑
            3. 给出有价值的业务洞察
            4. 建议具体的优化行动
            5. 使用emoji增强可读性
            """, 
            userMessage, 
            formatSalesData(data)
        );
        
        return openAIService.chatCompletion(prompt);
    }
}
```

### 2. 对话管理

```java
@Service
public class ContextManagementService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    public ChatContext getContext(String sessionId) {
        String key = "chat_context:" + sessionId;
        ChatContext context = (ChatContext) redisTemplate.opsForValue().get(key);
        
        if (context == null) {
            context = ChatContext.builder()
                .sessionId(sessionId)
                .createdAt(LocalDateTime.now())
                .messages(new ArrayList<>())
                .entities(new HashMap<>())
                .build();
        }
        
        return context;
    }
    
    public void saveContext(ChatContext context) {
        String key = "chat_context:" + context.getSessionId();
        redisTemplate.opsForValue().set(key, context, Duration.ofHours(24));
    }
}

@Data
@Builder
public class ChatContext {
    private String sessionId;
    private Long userId;
    private String currentPage;
    private Map<String, Object> pageFilters;
    private List<ChatMessage> messages;
    private Map<String, Object> entities;
    private LocalDateTime createdAt;
    private LocalDateTime lastActiveAt;
    
    public void updateWithMessage(ChatRequest request, Intent intent, List<Entity> entities) {
        // 添加消息历史
        this.messages.add(ChatMessage.builder()
            .role("user")
            .content(request.getMessage())
            .timestamp(LocalDateTime.now())
            .build());
        
        // 更新实体信息
        entities.forEach(entity -> 
            this.entities.put(entity.getType(), entity.getValue())
        );
        
        // 更新上下文信息
        this.userId = request.getUserId();
        this.currentPage = request.getCurrentPage();
        this.pageFilters = request.getFilters();
        this.lastActiveAt = LocalDateTime.now();
    }
}
```

## 部署和运维

### 1. Docker部署配置

```dockerfile
# AI服务Dockerfile
FROM openjdk:17-jdk-alpine

# 安装Python和依赖
RUN apk add --no-cache python3 py3-pip
RUN pip3 install flask pandas scikit-learn prophet redis joblib

# 复制应用
COPY target/analytics-service-*.jar app.jar
COPY python-ml-service/ /app/ml-service/

# 创建启动脚本
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 50006 5001

CMD ["/start.sh"]
```

```bash
#!/bin/bash
# start.sh - 启动脚本

# 启动Python ML服务
cd /app/ml-service
python3 app.py &

# 等待Python服务启动
sleep 10

# 启动Java应用
java -jar /app.jar
```

### 2. Kubernetes部署

```yaml
# analytics-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: analytics-service
  labels:
    app: analytics-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: analytics-service
  template:
    metadata:
      labels:
        app: analytics-service
    spec:
      containers:
      - name: analytics-service
        image: crm/analytics-service:latest
        ports:
        - containerPort: 50006
        - containerPort: 5001
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "k8s"
        - name: AI_OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: ai-secrets
              key: openai-api-key
        - name: AI_TENCENT_SECRET_ID
          valueFrom:
            secretKeyRef:
              name: ai-secrets
              key: tencent-secret-id
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 50006
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /actuator/health
            port: 50006
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: analytics-service
spec:
  selector:
    app: analytics-service
  ports:
  - name: java-api
    port: 50006
    targetPort: 50006
  - name: python-ml
    port: 5001
    targetPort: 5001
  type: ClusterIP
```

### 3. 监控和告警

```yaml
# application-monitoring.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
  health:
    redis:
      enabled: true
    db:
      enabled: true

# 自定义指标
ai:
  metrics:
    enabled: true
    prediction-accuracy-threshold: 0.8
    response-time-threshold: 5000ms
    
logging:
  level:
    com.crm.analytics: INFO
  pattern:
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/analytics-service.log
    max-size: 100MB
    max-history: 30
```

## 成本控制和优化

### 1. API调用优化

```java
@Service
public class AIServiceOptimizer {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    /**
     * 带缓存的OpenAI调用
     */
    public String cachedChatCompletion(String prompt, Duration cacheDuration) {
        String cacheKey = "openai_cache:" + DigestUtils.md5DigestAsHex(prompt.getBytes());
        
        // 尝试从缓存获取
        String cachedResult = (String) redisTemplate.opsForValue().get(cacheKey);
        if (cachedResult != null) {
            return cachedResult;
        }
        
        // 调用OpenAI API
        String result = openAIService.chatCompletion(prompt);
        
        // 缓存结果
        redisTemplate.opsForValue().set(cacheKey, result, cacheDuration);
        
        return result;
    }
    
    /**
     * 批量请求优化
     */
    public List<String> batchChatCompletion(List<String> prompts) {
        // 合并多个短prompt为一个请求
        if (prompts.size() > 1 && prompts.stream().allMatch(p -> p.length() < 500)) {
            String combinedPrompt = buildBatchPrompt(prompts);
            String combinedResult = openAIService.chatCompletion(combinedPrompt);
            return parseBatchResult(combinedResult, prompts.size());
        }
        
        // 并发处理
        return prompts.parallelStream()
            .map(this::cachedChatCompletion)
            .collect(Collectors.toList());
    }
}
```

### 2. 模型管理

```java
@Service
public class MLModelManager {
    
    private final Map<String, Object> loadedModels = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);
    
    @PostConstruct
    public void init() {
        // 定期更新模型
        scheduler.scheduleAtFixedRate(this::updateModels, 0, 24, TimeUnit.HOURS);
        
        // 定期清理缓存
        scheduler.scheduleAtFixedRate(this::cleanupCache, 0, 1, TimeUnit.HOURS);
    }
    
    public Object getModel(String modelName) {
        return loadedModels.computeIfAbsent(modelName, this::loadModel);
    }
    
    private Object loadModel(String modelName) {
        // 从MinIO/S3加载模型文件
        byte[] modelData = fileStorageService.downloadModel(modelName);
        
        // 反序列化模型
        return ModelSerializer.deserialize(modelData);
    }
    
    private void updateModels() {
        // 检查是否有新版本的模型
        List<String> modelsToUpdate = checkForModelUpdates();
        
        modelsToUpdate.forEach(modelName -> {
            loadedModels.remove(modelName); // 清除旧模型
            getModel(modelName); // 加载新模型
        });
    }
}
```

## 总结

AI功能实现方案包含以下核心组件：

### 技术架构
- **Spring Boot 3.2.x + Spring AI**: 主要后端框架
- **LangChain4j**: Java版本的AI应用开发框架
- **OpenAI GPT-4**: 主要大语言模型
- **Python ML服务**: 机器学习模型服务
- **多种存储**: PostgreSQL + Redis + MinIO

### 五大核心功能
1. **智能预测分析**: Prophet + XGBoost算法
2. **个性化推荐**: 协同过滤 + 内容推荐
3. **自动报告生成**: AI驱动的报告生成
4. **风险评估**: 客户流失预测 + 业绩风险分析
5. **情感分析**: 多NLP服务融合

### 部署和运维
- **容器化部署**: Docker + Kubernetes
- **监控告警**: Prometheus + Grafana
- **成本优化**: 缓存策略 + 批量处理
- **模型管理**: 自动更新 + 版本控制

这个实现方案为CRM系统提供了完整的AI能力，支持智能决策和业务优化。
