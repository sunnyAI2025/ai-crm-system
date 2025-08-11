import dayjs from 'dayjs';
import { DICT } from './constants';

/**
 * 格式化日期时间
 * @param date 日期
 * @param format 格式
 * @returns 格式化后的日期字符串
 */
export const formatDateTime = (date: string | Date, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  return dayjs(date).format(format);
};

/**
 * 格式化日期
 * @param date 日期
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: string | Date): string => {
  return formatDateTime(date, 'YYYY-MM-DD');
};

/**
 * 格式化金额
 * @param amount 金额
 * @param currency 货币符号
 * @returns 格式化后的金额字符串
 */
export const formatCurrency = (amount: number, currency = '¥'): string => {
  return `${currency}${amount.toLocaleString()}`;
};

/**
 * 脱敏手机号
 * @param phone 手机号
 * @returns 脱敏后的手机号
 */
export const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 7) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

/**
 * 根据值获取字典标签
 * @param dictKey 字典键
 * @param value 值
 * @returns 标签
 */
export const getDictLabel = (dictKey: keyof typeof DICT, value: unknown): string => {
  const dict = DICT[dictKey] as unknown as Array<{ value: unknown; label: string }>;
  const item = dict.find?.((item: { value: unknown; label: string }) => item.value === value);
  return item?.label || String(value);
};

/**
 * 根据值获取字典颜色
 * @param dictKey 字典键
 * @param value 值
 * @returns 颜色
 */
export const getDictColor = (dictKey: keyof typeof DICT, value: unknown): string => {
  const dict = DICT[dictKey] as unknown as Array<{ value: unknown; color: string }>;
  const item = dict.find?.((item: { value: unknown; color: string }) => item.value === value);
  return item?.color || 'default';
};

/**
 * 计算百分比
 * @param numerator 分子
 * @param denominator 分母
 * @param precision 精度
 * @returns 百分比
 */
export const calculatePercentage = (numerator: number, denominator: number, precision = 2): number => {
  if (denominator === 0) return 0;
  return Number(((numerator / denominator) * 100).toFixed(precision));
};

/**
 * 生成随机ID
 * @returns 随机ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * 深拷贝对象
 * @param obj 对象
 * @returns 拷贝后的对象
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * 防抖函数
 * @param func 函数
 * @param wait 等待时间
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * 节流函数
 * @param func 函数
 * @param limit 限制时间
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
