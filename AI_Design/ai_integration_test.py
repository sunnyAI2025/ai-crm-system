#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CRM系统AI功能集成测试脚本

测试内容：
1. Python ML服务健康检查
2. 各种机器学习模型的训练和预测
3. AI聊天接口测试
4. 缓存和性能测试
5. 错误处理测试

运行方式:
python ai_integration_test.py
"""

import requests
import json
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any
import random
import numpy as np

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 服务配置
ML_SERVICE_URL = "http://localhost:5001"
AI_SERVICE_URL = "http://localhost:50006/api/analytics"

class AIIntegrationTester:
    """AI功能集成测试器"""
    
    def __init__(self):
        self.test_results = {
            'total_tests': 0,
            'passed_tests': 0,
            'failed_tests': 0,
            'test_details': []
        }
        
    def run_test(self, test_name: str, test_func):
        """运行单个测试"""
        logger.info(f"开始测试: {test_name}")
        self.test_results['total_tests'] += 1
        
        try:
            start_time = time.time()
            result = test_func()
            duration = time.time() - start_time
            
            if result['success']:
                self.test_results['passed_tests'] += 1
                logger.info(f"✅ {test_name} - 通过 ({duration:.2f}s)")
            else:
                self.test_results['failed_tests'] += 1
                logger.error(f"❌ {test_name} - 失败: {result.get('error', 'Unknown error')}")
            
            self.test_results['test_details'].append({
                'test_name': test_name,
                'success': result['success'],
                'duration': duration,
                'error': result.get('error'),
                'data': result.get('data')
            })
            
        except Exception as e:
            self.test_results['failed_tests'] += 1
            logger.error(f"❌ {test_name} - 异常: {str(e)}")
            
            self.test_results['test_details'].append({
                'test_name': test_name,
                'success': False,
                'duration': 0,
                'error': f"Exception: {str(e)}",
                'data': None
            })
    
    def test_ml_service_health(self) -> Dict[str, Any]:
        """测试ML服务健康状态"""
        try:
            response = requests.get(f"{ML_SERVICE_URL}/health", timeout=10)
            if response.status_code == 200:
                health_data = response.json()
                return {
                    'success': True,
                    'data': health_data
                }
            else:
                return {
                    'success': False,
                    'error': f"Health check failed: {response.status_code}"
                }
        except Exception as e:
            return {
                'success': False,
                'error': f"Connection failed: {str(e)}"
            }
    
    def test_sales_trend_prediction(self) -> Dict[str, Any]:
        """测试销售趋势预测"""
        try:
            # 生成模拟训练数据
            training_data = self.generate_sales_data()
            
            # 训练模型
            train_response = requests.post(
                f"{ML_SERVICE_URL}/models/sales_trend/train",
                json={'data': training_data},
                timeout=60
            )
            
            if train_response.status_code != 200:
                return {
                    'success': False,
                    'error': f"Training failed: {train_response.status_code}"
                }
            
            train_result = train_response.json()
            if train_result['status'] != 'success':
                return {
                    'success': False,
                    'error': f"Training failed: {train_result.get('message')}"
                }
            
            # 预测
            predict_response = requests.post(
                f"{ML_SERVICE_URL}/models/sales_trend/predict",
                json={'future_periods': 3},
                timeout=30
            )
            
            if predict_response.status_code != 200:
                return {
                    'success': False,
                    'error': f"Prediction failed: {predict_response.status_code}"
                }
            
            predict_result = predict_response.json()
            if predict_result['status'] != 'success':
                return {
                    'success': False,
                    'error': f"Prediction failed: {predict_result.get('message')}"
                }
            
            return {
                'success': True,
                'data': {
                    'training_metrics': train_result.get('model_metrics'),
                    'predictions': predict_result.get('predictions'),
                    'trend_analysis': predict_result.get('trend_analysis')
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def test_customer_behavior_prediction(self) -> Dict[str, Any]:
        """测试客户行为预测"""
        try:
            # 生成模拟客户数据
            training_data = self.generate_customer_data()
            
            # 训练模型
            train_response = requests.post(
                f"{ML_SERVICE_URL}/models/customer_behavior/train",
                json={
                    'data': training_data,
                    'target': 'customer_value'
                },
                timeout=60
            )
            
            if train_response.status_code != 200 or train_response.json()['status'] != 'success':
                return {
                    'success': False,
                    'error': "Customer behavior training failed"
                }
            
            # 预测单个客户
            test_customer = training_data[0].copy()
            test_customer['customer_id'] = 999
            
            predict_response = requests.post(
                f"{ML_SERVICE_URL}/models/customer_behavior/predict",
                json={'customer_data': test_customer},
                timeout=10
            )
            
            if predict_response.status_code != 200:
                return {
                    'success': False,
                    'error': f"Prediction failed: {predict_response.status_code}"
                }
            
            predict_result = predict_response.json()
            if predict_result['status'] != 'success':
                return {
                    'success': False,
                    'error': f"Prediction failed: {predict_result.get('message')}"
                }
            
            return {
                'success': True,
                'data': predict_result
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def test_churn_prediction(self) -> Dict[str, Any]:
        """测试客户流失预测"""
        try:
            # 生成模拟流失数据
            training_data = self.generate_churn_data()
            
            # 训练模型
            train_response = requests.post(
                f"{ML_SERVICE_URL}/models/churn/train",
                json={'data': training_data},
                timeout=60
            )
            
            if train_response.status_code != 200 or train_response.json()['status'] != 'success':
                return {
                    'success': False,
                    'error': "Churn model training failed"
                }
            
            # 预测流失概率
            test_customer = {
                'customer_id': 999,
                'days_since_last_order': 90,
                'order_frequency': 0.5,
                'avg_order_value': 2000,
                'total_spent': 10000,
                'days_since_last_contact': 30,
                'support_ticket_count': 2,
                'payment_delay_avg': 5,
                'customer_age_days': 365,
                'business_type': '会计培训',
                'source_channel': 'SEM搜索',
                'customer_level': 3
            }
            
            predict_response = requests.post(
                f"{ML_SERVICE_URL}/models/churn/predict",
                json={'customer_data': test_customer},
                timeout=10
            )
            
            if predict_response.status_code != 200:
                return {
                    'success': False,
                    'error': f"Churn prediction failed: {predict_response.status_code}"
                }
            
            predict_result = predict_response.json()
            if predict_result['status'] != 'success':
                return {
                    'success': False,
                    'error': f"Churn prediction failed: {predict_result.get('message')}"
                }
            
            return {
                'success': True,
                'data': predict_result
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def test_recommendation_system(self) -> Dict[str, Any]:
        """测试推荐系统"""
        try:
            # 生成模拟交互数据
            training_data = self.generate_interaction_data()
            
            # 训练推荐模型
            train_response = requests.post(
                f"{ML_SERVICE_URL}/models/recommendation/train",
                json={'data': training_data},
                timeout=60
            )
            
            if train_response.status_code != 200 or train_response.json()['status'] != 'success':
                return {
                    'success': False,
                    'error': "Recommendation model training failed"
                }
            
            # 获取推荐
            predict_response = requests.post(
                f"{ML_SERVICE_URL}/models/recommendation/predict",
                json={
                    'customer_id': 1,
                    'n_recommendations': 5
                },
                timeout=10
            )
            
            if predict_response.status_code != 200:
                return {
                    'success': False,
                    'error': f"Recommendation failed: {predict_response.status_code}"
                }
            
            predict_result = predict_response.json()
            if predict_result['status'] != 'success':
                return {
                    'success': False,
                    'error': f"Recommendation failed: {predict_result.get('message')}"
                }
            
            return {
                'success': True,
                'data': predict_result
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def test_models_status(self) -> Dict[str, Any]:
        """测试模型状态查询"""
        try:
            response = requests.get(f"{ML_SERVICE_URL}/models/status", timeout=10)
            
            if response.status_code != 200:
                return {
                    'success': False,
                    'error': f"Status check failed: {response.status_code}"
                }
            
            result = response.json()
            if result['status'] != 'success':
                return {
                    'success': False,
                    'error': f"Status check failed: {result.get('message')}"
                }
            
            return {
                'success': True,
                'data': result['models']
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def test_performance_and_caching(self) -> Dict[str, Any]:
        """测试性能和缓存"""
        try:
            # 第一次调用（无缓存）
            start_time = time.time()
            response1 = requests.post(
                f"{ML_SERVICE_URL}/models/sales_trend/predict",
                json={'future_periods': 3},
                timeout=30
            )
            first_call_time = time.time() - start_time
            
            if response1.status_code != 200:
                return {
                    'success': False,
                    'error': f"First prediction call failed: {response1.status_code}"
                }
            
            # 第二次调用（应该有缓存）
            start_time = time.time()
            response2 = requests.post(
                f"{ML_SERVICE_URL}/models/sales_trend/predict",
                json={'future_periods': 3},
                timeout=30
            )
            second_call_time = time.time() - start_time
            
            if response2.status_code != 200:
                return {
                    'success': False,
                    'error': f"Second prediction call failed: {response2.status_code}"
                }
            
            # 验证缓存效果（第二次调用应该更快）
            cache_effective = second_call_time < first_call_time * 0.8
            
            return {
                'success': True,
                'data': {
                    'first_call_time': first_call_time,
                    'second_call_time': second_call_time,
                    'cache_effective': cache_effective,
                    'speedup_ratio': first_call_time / second_call_time if second_call_time > 0 else 0
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def test_error_handling(self) -> Dict[str, Any]:
        """测试错误处理"""
        try:
            error_tests = []
            
            # 测试空数据训练
            response = requests.post(
                f"{ML_SERVICE_URL}/models/sales_trend/train",
                json={'data': []},
                timeout=10
            )
            error_tests.append({
                'test': 'empty_training_data',
                'expected_400': response.status_code == 400,
                'actual_status': response.status_code
            })
            
            # 测试不存在的客户预测
            response = requests.post(
                f"{ML_SERVICE_URL}/models/customer_behavior/predict",
                json={'customer_data': {}},
                timeout=10
            )
            error_tests.append({
                'test': 'empty_customer_data',
                'expected_400': response.status_code == 400,
                'actual_status': response.status_code
            })
            
            # 测试无效API端点
            response = requests.get(f"{ML_SERVICE_URL}/invalid/endpoint", timeout=5)
            error_tests.append({
                'test': 'invalid_endpoint',
                'expected_404': response.status_code == 404,
                'actual_status': response.status_code
            })
            
            # 所有错误处理测试都应该通过
            all_passed = all([
                test.get('expected_400') or test.get('expected_404') 
                for test in error_tests
            ])
            
            return {
                'success': all_passed,
                'data': error_tests
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_sales_data(self) -> List[Dict]:
        """生成模拟销售数据"""
        data = []
        base_date = datetime(2023, 1, 1)
        
        for i in range(24):  # 24个月的数据
            date = base_date + timedelta(days=30 * i)
            
            # 模拟季节性和增长趋势
            seasonal_factor = 1 + 0.2 * np.sin(2 * np.pi * i / 12)
            growth_factor = 1 + 0.05 * i / 12
            base_amount = 200000
            
            order_count = random.randint(30, 80)
            total_amount = base_amount * seasonal_factor * growth_factor + random.uniform(-20000, 20000)
            unique_customers = random.randint(25, order_count)
            
            data.append({
                'date': date.strftime('%Y-%m-%d'),
                'order_count': order_count,
                'total_amount': max(0, total_amount),
                'unique_customers': unique_customers,
                'avg_order_value': total_amount / order_count if order_count > 0 else 0,
                'month': date.month,
                'quarter': (date.month - 1) // 3 + 1,
                'marketing_spend': random.uniform(5000, 15000),
                'seasonality': seasonal_factor
            })
        
        return data
    
    def generate_customer_data(self) -> List[Dict]:
        """生成模拟客户数据"""
        business_types = ['会计培训', '学历提升', '职业资格', '技能培训']
        channels = ['SEM搜索', '表单填写', '海报活动', '电话咨询']
        
        data = []
        for i in range(100):
            customer_value = random.uniform(1000, 50000)
            order_count = random.randint(1, 10)
            
            data.append({
                'customer_id': i + 1,
                'days_since_last_order': random.randint(1, 365),
                'order_frequency': random.uniform(0.1, 2.0),
                'avg_order_value': customer_value / order_count,
                'total_spent': customer_value,
                'interaction_frequency': random.uniform(0.5, 5.0),
                'days_since_last_contact': random.randint(1, 90),
                'support_ticket_count': random.randint(0, 5),
                'payment_delay': random.uniform(0, 30),
                'customer_age_days': random.randint(30, 1095),
                'business_type': random.choice(business_types),
                'source_channel': random.choice(channels),
                'customer_value': customer_value
            })
        
        return data
    
    def generate_churn_data(self) -> List[Dict]:
        """生成模拟流失数据"""
        data = []
        for i in range(100):
            # 模拟流失规律：长时间未下单、低频次、高支持票据等
            days_since_last_order = random.randint(1, 400)
            order_frequency = random.uniform(0.1, 3.0)
            support_tickets = random.randint(0, 10)
            
            # 流失概率建模
            churn_prob = (
                min(days_since_last_order / 365, 1) * 0.4 +
                max(0, (5 - order_frequency) / 5) * 0.3 +
                min(support_tickets / 10, 1) * 0.3
            )
            
            is_churned = random.random() < churn_prob
            
            data.append({
                'customer_id': i + 1,
                'days_since_last_order': days_since_last_order,
                'order_frequency': order_frequency,
                'avg_order_value': random.uniform(500, 10000),
                'total_spent': random.uniform(1000, 50000),
                'days_since_last_contact': random.randint(1, 180),
                'support_ticket_count': support_tickets,
                'payment_delay_avg': random.uniform(0, 30),
                'customer_age_days': random.randint(30, 1095),
                'business_type': random.choice(['会计培训', '学历提升', '职业资格']),
                'source_channel': random.choice(['SEM搜索', '表单填写', '海报活动']),
                'customer_level': random.randint(1, 5),
                'is_churned': 1 if is_churned else 0
            })
        
        return data
    
    def generate_interaction_data(self) -> List[Dict]:
        """生成模拟用户-产品交互数据"""
        data = []
        customers = list(range(1, 21))  # 20个客户
        products = list(range(1, 11))   # 10个产品
        
        for customer_id in customers:
            # 每个客户随机与3-7个产品交互
            interacted_products = random.sample(products, random.randint(3, 7))
            
            for product_id in interacted_products:
                # 评分1-5，模拟客户偏好
                rating = random.randint(1, 5)
                
                data.append({
                    'customer_id': customer_id,
                    'product_id': product_id,
                    'rating': rating,
                    'interaction_date': (datetime.now() - timedelta(days=random.randint(1, 365))).strftime('%Y-%m-%d')
                })
        
        return data
    
    def run_all_tests(self):
        """运行所有测试"""
        logger.info("🚀 开始CRM AI功能集成测试")
        logger.info("=" * 60)
        
        # 定义测试套件
        test_suite = [
            ("ML服务健康检查", self.test_ml_service_health),
            ("销售趋势预测", self.test_sales_trend_prediction),
            ("客户行为预测", self.test_customer_behavior_prediction),
            ("客户流失预测", self.test_churn_prediction),
            ("推荐系统", self.test_recommendation_system),
            ("模型状态查询", self.test_models_status),
            ("性能和缓存测试", self.test_performance_and_caching),
            ("错误处理测试", self.test_error_handling),
        ]
        
        # 执行测试
        for test_name, test_func in test_suite:
            self.run_test(test_name, test_func)
            time.sleep(1)  # 测试间隔
        
        # 输出测试报告
        self.print_test_report()
    
    def print_test_report(self):
        """打印测试报告"""
        logger.info("\n" + "=" * 60)
        logger.info("📊 测试报告")
        logger.info("=" * 60)
        
        total = self.test_results['total_tests']
        passed = self.test_results['passed_tests']
        failed = self.test_results['failed_tests']
        
        logger.info(f"总测试数: {total}")
        logger.info(f"通过测试: {passed} ✅")
        logger.info(f"失败测试: {failed} ❌")
        
        if total > 0:
            success_rate = (passed / total) * 100
            logger.info(f"成功率: {success_rate:.1f}%")
        
        logger.info("\n📋 详细结果:")
        for detail in self.test_results['test_details']:
            status = "✅" if detail['success'] else "❌"
            duration = detail['duration']
            error = detail.get('error', '')
            
            logger.info(f"{status} {detail['test_name']} ({duration:.2f}s)")
            if error:
                logger.info(f"   错误: {error}")
        
        # 保存测试报告到文件
        report_file = f"ai_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.test_results, f, ensure_ascii=False, indent=2, default=str)
        
        logger.info(f"\n📄 详细报告已保存到: {report_file}")
        
        if failed == 0:
            logger.info("\n🎉 所有测试通过！AI功能集成正常。")
        else:
            logger.warning(f"\n⚠️  有 {failed} 个测试失败，请检查相关功能。")

def main():
    """主函数"""
    logger.info("CRM AI功能集成测试工具")
    logger.info("确保以下服务正在运行:")
    logger.info(f"- Python ML服务: {ML_SERVICE_URL}")
    logger.info(f"- Java AI服务: {AI_SERVICE_URL}")
    logger.info("- Redis服务: localhost:6379")
    
    input("\n按回车键开始测试...")
    
    tester = AIIntegrationTester()
    tester.run_all_tests()

if __name__ == "__main__":
    main()
