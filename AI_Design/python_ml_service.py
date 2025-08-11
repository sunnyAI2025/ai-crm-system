#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CRM系统 - Python机器学习服务
提供AI数据分析所需的机器学习模型服务

功能：
1. 销售趋势预测 (Prophet + Random Forest)
2. 客户行为预测 (XGBoost)
3. 客户流失预测 (Random Forest)
4. 协同过滤推荐 (Matrix Factorization)
5. 风险评估模型 (Ensemble Methods)
"""

import os
import sys
import logging
import traceback
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any

# 基础库
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, g
from flask_cors import CORS
import redis
import joblib
import json

# 机器学习库
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_absolute_error, accuracy_score, roc_auc_score
import xgboost as xgb
from prophet import Prophet

# 推荐系统
from sklearn.decomposition import NMF
from sklearn.metrics.pairwise import cosine_similarity

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ml_service.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Flask应用初始化
app = Flask(__name__)
CORS(app)

# Redis连接
try:
    redis_client = redis.Redis(
        host=os.getenv('REDIS_HOST', 'localhost'),
        port=int(os.getenv('REDIS_PORT', 6379)),
        db=int(os.getenv('REDIS_DB', 1)),
        decode_responses=True
    )
    redis_client.ping()
    logger.info("Redis连接成功")
except Exception as e:
    logger.error(f"Redis连接失败: {e}")
    redis_client = None

# 模型存储路径
MODEL_PATH = os.getenv('MODEL_PATH', './models')
os.makedirs(MODEL_PATH, exist_ok=True)

# ================================================================================
# 工具函数
# ================================================================================

def cache_key(prefix: str, **kwargs) -> str:
    """生成缓存键"""
    key_parts = [prefix]
    for k, v in sorted(kwargs.items()):
        key_parts.append(f"{k}:{v}")
    return ":".join(key_parts)

def get_cached_result(key: str) -> Optional[Any]:
    """从Redis获取缓存结果"""
    if not redis_client:
        return None
    try:
        cached = redis_client.get(key)
        return json.loads(cached) if cached else None
    except Exception as e:
        logger.warning(f"缓存读取失败: {e}")
        return None

def set_cached_result(key: str, result: Any, ttl: int = 3600) -> None:
    """设置Redis缓存"""
    if not redis_client:
        return
    try:
        redis_client.setex(key, ttl, json.dumps(result, default=str))
    except Exception as e:
        logger.warning(f"缓存设置失败: {e}")

def save_model(model: Any, model_name: str) -> str:
    """保存模型到文件"""
    model_file = os.path.join(MODEL_PATH, f"{model_name}.pkl")
    joblib.dump(model, model_file)
    logger.info(f"模型已保存: {model_file}")
    return model_file

def load_model(model_name: str) -> Optional[Any]:
    """从文件加载模型"""
    model_file = os.path.join(MODEL_PATH, f"{model_name}.pkl")
    if os.path.exists(model_file):
        try:
            model = joblib.load(model_file)
            logger.info(f"模型已加载: {model_file}")
            return model
        except Exception as e:
            logger.error(f"模型加载失败: {e}")
    return None

# ================================================================================
# 销售趋势预测模型
# ================================================================================

class SalesTrendPredictor:
    """销售趋势预测器 - 结合Prophet和Random Forest"""
    
    def __init__(self):
        self.prophet_model = None
        self.rf_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.feature_columns = [
            'order_count', 'unique_customers', 'avg_order_value', 
            'month', 'quarter', 'marketing_spend', 'seasonality'
        ]
        
    def prepare_data(self, data: List[Dict]) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """数据预处理"""
        df = pd.DataFrame(data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Prophet数据格式
        prophet_df = pd.DataFrame({
            'ds': df['date'],
            'y': df['total_amount']
        })
        
        # Random Forest特征工程
        df['month'] = df['date'].dt.month
        df['quarter'] = df['date'].dt.quarter
        df['seasonality'] = np.sin(2 * np.pi * df['month'] / 12)
        
        # 填充缺失值
        df['marketing_spend'] = df.get('marketing_spend', 0).fillna(0)
        
        rf_df = df[self.feature_columns + ['total_amount']].copy()
        
        return prophet_df, rf_df
    
    def train(self, data: List[Dict]) -> Dict[str, Any]:
        """训练模型"""
        try:
            prophet_df, rf_df = self.prepare_data(data)
            
            # 训练Prophet模型
            self.prophet_model = Prophet(
                yearly_seasonality=True,
                weekly_seasonality=False,
                daily_seasonality=False,
                changepoint_prior_scale=0.05
            )
            self.prophet_model.fit(prophet_df)
            
            # 训练Random Forest模型
            X = rf_df[self.feature_columns]
            y = rf_df['total_amount']
            
            X_scaled = self.scaler.fit_transform(X)
            self.rf_model.fit(X_scaled, y)
            
            # 计算训练评估指标
            rf_pred = self.rf_model.predict(X_scaled)
            rf_mae = mean_absolute_error(y, rf_pred)
            
            # 保存模型
            model_data = {
                'prophet_model': self.prophet_model,
                'rf_model': self.rf_model,
                'scaler': self.scaler,
                'feature_columns': self.feature_columns
            }
            save_model(model_data, 'sales_trend_model')
            
            return {
                'status': 'success',
                'model_metrics': {
                    'rf_mae': float(rf_mae),
                    'training_samples': len(data)
                },
                'trained_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"销售趋势模型训练失败: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def predict(self, future_periods: int = 3, features: Optional[Dict] = None) -> Dict[str, Any]:
        """预测未来销售趋势"""
        try:
            if not self.prophet_model:
                # 尝试加载已保存的模型
                saved_model = load_model('sales_trend_model')
                if saved_model:
                    self.prophet_model = saved_model['prophet_model']
                    self.rf_model = saved_model['rf_model']
                    self.scaler = saved_model['scaler']
                    self.feature_columns = saved_model['feature_columns']
                else:
                    return {'status': 'error', 'message': '模型未训练'}
            
            # Prophet预测
            future_dates = self.prophet_model.make_future_dataframe(
                periods=future_periods, 
                freq='M'
            )
            prophet_forecast = self.prophet_model.predict(future_dates)
            
            # 提取预测结果
            future_forecast = prophet_forecast.tail(future_periods)
            
            predictions = []
            for _, row in future_forecast.iterrows():
                pred = {
                    'date': row['ds'].strftime('%Y-%m-%d'),
                    'predicted_amount': float(row['yhat']),
                    'lower_bound': float(row['yhat_lower']),
                    'upper_bound': float(row['yhat_upper']),
                    'confidence': 0.8,  # Prophet默认80%置信区间
                    'trend': float(row.get('trend', 0)),
                    'seasonal': float(row.get('seasonal', 0))
                }
                predictions.append(pred)
            
            # 计算趋势分析
            trend_analysis = self._analyze_trend(prophet_forecast)
            
            return {
                'status': 'success',
                'predictions': predictions,
                'trend_analysis': trend_analysis,
                'model_info': {
                    'algorithm': 'Prophet + Random Forest',
                    'prediction_horizon': future_periods,
                    'predicted_at': datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"销售趋势预测失败: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def _analyze_trend(self, forecast: pd.DataFrame) -> Dict[str, Any]:
        """分析趋势"""
        recent_trend = forecast['trend'].tail(6).pct_change().mean()
        
        trend_direction = 'stable'
        if recent_trend > 0.05:
            trend_direction = 'increasing'
        elif recent_trend < -0.05:
            trend_direction = 'decreasing'
        
        return {
            'direction': trend_direction,
            'trend_rate': float(recent_trend),
            'seasonality_strength': float(forecast['seasonal'].std()),
            'volatility': float(forecast['yhat'].std())
        }

# ================================================================================
# 客户行为预测模型
# ================================================================================

class CustomerBehaviorPredictor:
    """客户行为预测器 - 使用XGBoost"""
    
    def __init__(self):
        self.model = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_columns = [
            'days_since_last_order', 'order_frequency', 'avg_order_value',
            'total_spent', 'interaction_frequency', 'days_since_last_contact',
            'support_ticket_count', 'payment_delay', 'customer_age_days',
            'business_type_encoded', 'source_channel_encoded'
        ]
    
    def prepare_features(self, data: List[Dict]) -> pd.DataFrame:
        """特征预处理"""
        df = pd.DataFrame(data)
        
        # 编码分类变量
        categorical_columns = ['business_type', 'source_channel']
        for col in categorical_columns:
            if col in df.columns:
                if col not in self.label_encoders:
                    self.label_encoders[col] = LabelEncoder()
                    df[f'{col}_encoded'] = self.label_encoders[col].fit_transform(df[col].astype(str))
                else:
                    df[f'{col}_encoded'] = self.label_encoders[col].transform(df[col].astype(str))
        
        # 填充缺失值
        numeric_columns = ['days_since_last_order', 'order_frequency', 'avg_order_value',
                          'total_spent', 'interaction_frequency', 'days_since_last_contact',
                          'support_ticket_count', 'payment_delay', 'customer_age_days']
        
        for col in numeric_columns:
            if col in df.columns:
                df[col] = df[col].fillna(df[col].median())
        
        return df[self.feature_columns]
    
    def train(self, data: List[Dict], target_column: str = 'customer_value') -> Dict[str, Any]:
        """训练客户行为预测模型"""
        try:
            df = pd.DataFrame(data)
            X = self.prepare_features(data)
            y = df[target_column]
            
            # 数据划分
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # 特征缩放
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # 模型训练
            self.model.fit(X_train_scaled, y_train)
            
            # 模型评估
            train_pred = self.model.predict(X_train_scaled)
            test_pred = self.model.predict(X_test_scaled)
            
            train_mae = mean_absolute_error(y_train, train_pred)
            test_mae = mean_absolute_error(y_test, test_pred)
            
            # 特征重要性
            feature_importance = dict(zip(
                self.feature_columns,
                self.model.feature_importances_
            ))
            
            # 保存模型
            model_data = {
                'model': self.model,
                'scaler': self.scaler,
                'label_encoders': self.label_encoders,
                'feature_columns': self.feature_columns
            }
            save_model(model_data, 'customer_behavior_model')
            
            return {
                'status': 'success',
                'model_metrics': {
                    'train_mae': float(train_mae),
                    'test_mae': float(test_mae),
                    'feature_importance': {k: float(v) for k, v in feature_importance.items()}
                },
                'training_samples': len(data),
                'trained_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"客户行为模型训练失败: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def predict(self, customer_data: Dict) -> Dict[str, Any]:
        """预测客户行为"""
        try:
            # 加载模型
            if not hasattr(self.model, 'feature_importances_'):
                saved_model = load_model('customer_behavior_model')
                if saved_model:
                    self.model = saved_model['model']
                    self.scaler = saved_model['scaler']
                    self.label_encoders = saved_model['label_encoders']
                    self.feature_columns = saved_model['feature_columns']
                else:
                    return {'status': 'error', 'message': '模型未训练'}
            
            # 特征准备
            X = self.prepare_features([customer_data])
            X_scaled = self.scaler.transform(X)
            
            # 预测
            prediction = self.model.predict(X_scaled)[0]
            
            # 计算置信度 (基于特征的标准差)
            confidence = min(0.95, max(0.5, 1.0 - (X.std().mean() / 10)))
            
            return {
                'status': 'success',
                'customer_id': customer_data.get('customer_id'),
                'predicted_value': float(prediction),
                'confidence': float(confidence),
                'prediction_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"客户行为预测失败: {e}")
            return {'status': 'error', 'message': str(e)}

# ================================================================================
# 客户流失预测模型
# ================================================================================

class ChurnPredictor:
    """客户流失预测器"""
    
    def __init__(self):
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight='balanced'
        )
        self.scaler = StandardScaler()
        self.label_encoders = {}
    
    def train(self, data: List[Dict]) -> Dict[str, Any]:
        """训练流失预测模型"""
        try:
            df = pd.DataFrame(data)
            
            # 特征工程
            X = self._prepare_churn_features(df)
            y = df['is_churned']  # 0: 未流失, 1: 已流失
            
            # 数据划分
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            # 特征缩放
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # 模型训练
            self.model.fit(X_train_scaled, y_train)
            
            # 模型评估
            train_pred = self.model.predict(X_train_scaled)
            test_pred = self.model.predict(X_test_scaled)
            test_proba = self.model.predict_proba(X_test_scaled)[:, 1]
            
            train_acc = accuracy_score(y_train, train_pred)
            test_acc = accuracy_score(y_test, test_pred)
            auc_score = roc_auc_score(y_test, test_proba)
            
            # 保存模型
            model_data = {
                'model': self.model,
                'scaler': self.scaler,
                'label_encoders': self.label_encoders
            }
            save_model(model_data, 'churn_prediction_model')
            
            return {
                'status': 'success',
                'model_metrics': {
                    'train_accuracy': float(train_acc),
                    'test_accuracy': float(test_acc),
                    'auc_score': float(auc_score)
                },
                'training_samples': len(data),
                'trained_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"流失预测模型训练失败: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def predict_churn_probability(self, customer_data: Dict) -> Dict[str, Any]:
        """预测客户流失概率"""
        try:
            # 加载模型
            if not hasattr(self.model, 'feature_importances_'):
                saved_model = load_model('churn_prediction_model')
                if saved_model:
                    self.model = saved_model['model']
                    self.scaler = saved_model['scaler']
                    self.label_encoders = saved_model['label_encoders']
                else:
                    return {'status': 'error', 'message': '流失预测模型未训练'}
            
            # 特征准备
            df = pd.DataFrame([customer_data])
            X = self._prepare_churn_features(df)
            X_scaled = self.scaler.transform(X)
            
            # 预测流失概率
            churn_probability = self.model.predict_proba(X_scaled)[0, 1]
            
            # 风险等级分类
            if churn_probability >= 0.7:
                risk_level = 'high'
            elif churn_probability >= 0.4:
                risk_level = 'medium'
            else:
                risk_level = 'low'
            
            return {
                'status': 'success',
                'customer_id': customer_data.get('customer_id'),
                'churn_probability': float(churn_probability),
                'risk_level': risk_level,
                'prediction_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"流失概率预测失败: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def _prepare_churn_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """准备流失预测特征"""
        features = []
        
        # 基础特征
        basic_features = [
            'days_since_last_order', 'order_frequency', 'avg_order_value',
            'total_spent', 'days_since_last_contact', 'support_ticket_count',
            'payment_delay_avg', 'customer_age_days'
        ]
        
        for feature in basic_features:
            if feature in df.columns:
                features.append(feature)
                df[feature] = df[feature].fillna(df[feature].median())
        
        # 分类特征编码
        categorical_features = ['business_type', 'source_channel', 'customer_level']
        for feature in categorical_features:
            if feature in df.columns:
                encoded_feature = f'{feature}_encoded'
                if feature not in self.label_encoders:
                    self.label_encoders[feature] = LabelEncoder()
                    df[encoded_feature] = self.label_encoders[feature].fit_transform(df[feature].astype(str))
                else:
                    df[encoded_feature] = self.label_encoders[feature].transform(df[feature].astype(str))
                features.append(encoded_feature)
        
        return df[features]

# ================================================================================
# 推荐系统
# ================================================================================

class RecommendationEngine:
    """推荐系统引擎 - 基于矩阵分解"""
    
    def __init__(self):
        self.nmf_model = NMF(n_components=50, random_state=42)
        self.user_features = None
        self.item_features = None
        self.user_item_matrix = None
        
    def train(self, interaction_data: List[Dict]) -> Dict[str, Any]:
        """训练推荐模型"""
        try:
            df = pd.DataFrame(interaction_data)
            
            # 构建用户-物品交互矩阵
            self.user_item_matrix = df.pivot_table(
                index='customer_id',
                columns='product_id',
                values='rating',
                fill_value=0
            )
            
            # 矩阵分解
            W = self.nmf_model.fit_transform(self.user_item_matrix)
            H = self.nmf_model.components_
            
            self.user_features = W
            self.item_features = H.T
            
            # 计算重构误差
            reconstructed = np.dot(W, H)
            mse = np.mean((self.user_item_matrix.values - reconstructed) ** 2)
            
            # 保存模型
            model_data = {
                'nmf_model': self.nmf_model,
                'user_features': self.user_features,
                'item_features': self.item_features,
                'user_item_matrix': self.user_item_matrix
            }
            save_model(model_data, 'recommendation_model')
            
            return {
                'status': 'success',
                'model_metrics': {
                    'reconstruction_mse': float(mse),
                    'n_users': len(self.user_item_matrix.index),
                    'n_items': len(self.user_item_matrix.columns)
                },
                'trained_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"推荐模型训练失败: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def recommend(self, customer_id: int, n_recommendations: int = 10) -> Dict[str, Any]:
        """为客户生成推荐"""
        try:
            # 加载模型
            if self.user_features is None:
                saved_model = load_model('recommendation_model')
                if saved_model:
                    self.nmf_model = saved_model['nmf_model']
                    self.user_features = saved_model['user_features']
                    self.item_features = saved_model['item_features']
                    self.user_item_matrix = saved_model['user_item_matrix']
                else:
                    return {'status': 'error', 'message': '推荐模型未训练'}
            
            if customer_id not in self.user_item_matrix.index:
                return {'status': 'error', 'message': '客户不存在'}
            
            # 获取用户索引
            user_idx = self.user_item_matrix.index.get_loc(customer_id)
            
            # 计算推荐分数
            user_vector = self.user_features[user_idx]
            scores = np.dot(user_vector, self.item_features.T)
            
            # 排除已购买的商品
            purchased_items = self.user_item_matrix.loc[customer_id]
            purchased_mask = purchased_items > 0
            scores[purchased_mask] = -np.inf
            
            # 获取Top-N推荐
            top_indices = np.argsort(scores)[::-1][:n_recommendations]
            top_items = self.user_item_matrix.columns[top_indices]
            top_scores = scores[top_indices]
            
            recommendations = []
            for item_id, score in zip(top_items, top_scores):
                recommendations.append({
                    'product_id': str(item_id),
                    'score': float(score),
                    'confidence': min(1.0, max(0.0, score / np.max(scores) if np.max(scores) > 0 else 0))
                })
            
            return {
                'status': 'success',
                'customer_id': customer_id,
                'recommendations': recommendations,
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"推荐生成失败: {e}")
            return {'status': 'error', 'message': str(e)}

# ================================================================================
# Flask API路由
# ================================================================================

# 全局模型实例
sales_predictor = SalesTrendPredictor()
behavior_predictor = CustomerBehaviorPredictor()
churn_predictor = ChurnPredictor()
recommendation_engine = RecommendationEngine()

@app.before_request
def before_request():
    """请求前处理"""
    g.start_time = datetime.now()

@app.after_request
def after_request(response):
    """请求后处理"""
    if hasattr(g, 'start_time'):
        duration = (datetime.now() - g.start_time).total_seconds() * 1000
        logger.info(f"请求处理时间: {duration:.2f}ms")
    return response

@app.route('/health', methods=['GET'])
def health_check():
    """健康检查"""
    try:
        # 检查Redis连接
        redis_status = 'connected' if redis_client and redis_client.ping() else 'disconnected'
        
        # 检查模型文件
        model_files = os.listdir(MODEL_PATH) if os.path.exists(MODEL_PATH) else []
        
        return jsonify({
            'status': 'healthy',
            'service': 'CRM ML Service',
            'version': '1.0.0',
            'timestamp': datetime.now().isoformat(),
            'redis_status': redis_status,
            'available_models': len(model_files),
            'uptime': 'unknown'  # 可以添加服务启动时间计算
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@app.route('/models/sales_trend/train', methods=['POST'])
def train_sales_trend():
    """训练销售趋势预测模型"""
    try:
        data = request.json.get('data', [])
        if not data:
            return jsonify({'status': 'error', 'message': '训练数据为空'}), 400
        
        result = sales_predictor.train(data)
        return jsonify(result)
    except Exception as e:
        logger.error(f"销售趋势训练API错误: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/models/sales_trend/predict', methods=['POST'])
def predict_sales_trend():
    """预测销售趋势"""
    try:
        future_periods = request.json.get('future_periods', 3)
        features = request.json.get('features', {})
        
        # 检查缓存
        cache_key_str = cache_key('sales_trend', periods=future_periods)
        cached_result = get_cached_result(cache_key_str)
        if cached_result:
            return jsonify(cached_result)
        
        result = sales_predictor.predict(future_periods, features)
        
        # 缓存结果
        if result['status'] == 'success':
            set_cached_result(cache_key_str, result, ttl=3600)  # 1小时缓存
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"销售趋势预测API错误: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/models/customer_behavior/train', methods=['POST'])
def train_customer_behavior():
    """训练客户行为预测模型"""
    try:
        data = request.json.get('data', [])
        target = request.json.get('target', 'customer_value')
        
        if not data:
            return jsonify({'status': 'error', 'message': '训练数据为空'}), 400
        
        result = behavior_predictor.train(data, target)
        return jsonify(result)
    except Exception as e:
        logger.error(f"客户行为训练API错误: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/models/customer_behavior/predict', methods=['POST'])
def predict_customer_behavior():
    """预测客户行为"""
    try:
        customer_data = request.json.get('customer_data', {})
        if not customer_data:
            return jsonify({'status': 'error', 'message': '客户数据为空'}), 400
        
        result = behavior_predictor.predict(customer_data)
        return jsonify(result)
    except Exception as e:
        logger.error(f"客户行为预测API错误: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/models/churn/train', methods=['POST'])
def train_churn_model():
    """训练客户流失预测模型"""
    try:
        data = request.json.get('data', [])
        if not data:
            return jsonify({'status': 'error', 'message': '训练数据为空'}), 400
        
        result = churn_predictor.train(data)
        return jsonify(result)
    except Exception as e:
        logger.error(f"流失预测训练API错误: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/models/churn/predict', methods=['POST'])
def predict_churn():
    """预测客户流失概率"""
    try:
        customer_data = request.json.get('customer_data', {})
        if not customer_data:
            return jsonify({'status': 'error', 'message': '客户数据为空'}), 400
        
        result = churn_predictor.predict_churn_probability(customer_data)
        return jsonify(result)
    except Exception as e:
        logger.error(f"流失预测API错误: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/models/recommendation/train', methods=['POST'])
def train_recommendation():
    """训练推荐模型"""
    try:
        data = request.json.get('data', [])
        if not data:
            return jsonify({'status': 'error', 'message': '训练数据为空'}), 400
        
        result = recommendation_engine.train(data)
        return jsonify(result)
    except Exception as e:
        logger.error(f"推荐模型训练API错误: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/models/recommendation/predict', methods=['POST'])
def get_recommendations():
    """获取推荐"""
    try:
        customer_id = request.json.get('customer_id')
        n_recommendations = request.json.get('n_recommendations', 10)
        
        if not customer_id:
            return jsonify({'status': 'error', 'message': '客户ID为空'}), 400
        
        result = recommendation_engine.recommend(customer_id, n_recommendations)
        return jsonify(result)
    except Exception as e:
        logger.error(f"推荐API错误: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/models/status', methods=['GET'])
def models_status():
    """获取所有模型状态"""
    try:
        models_info = {}
        
        # 检查模型文件
        model_files = {
            'sales_trend': 'sales_trend_model.pkl',
            'customer_behavior': 'customer_behavior_model.pkl',
            'churn_prediction': 'churn_prediction_model.pkl',
            'recommendation': 'recommendation_model.pkl'
        }
        
        for model_name, file_name in model_files.items():
            file_path = os.path.join(MODEL_PATH, file_name)
            if os.path.exists(file_path):
                stat_info = os.stat(file_path)
                models_info[model_name] = {
                    'status': 'trained',
                    'file_size': stat_info.st_size,
                    'last_modified': datetime.fromtimestamp(stat_info.st_mtime).isoformat()
                }
            else:
                models_info[model_name] = {
                    'status': 'not_trained',
                    'file_size': 0,
                    'last_modified': None
                }
        
        return jsonify({
            'status': 'success',
            'models': models_info,
            'model_path': MODEL_PATH,
            'checked_at': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"模型状态检查错误: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'status': 'error', 'message': 'API接口不存在'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'status': 'error', 'message': '服务器内部错误'}), 500

if __name__ == '__main__':
    logger.info("启动CRM机器学习服务...")
    logger.info(f"模型存储路径: {MODEL_PATH}")
    
    # 启动Flask应用
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('ML_SERVICE_PORT', 5001)),
        debug=os.getenv('FLASK_DEBUG', 'False').lower() == 'true',
        threaded=True
    )
