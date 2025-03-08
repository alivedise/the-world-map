/**
 * 公司顏色工具
 * 為不同公司類型提供一致的顏色
 */

import { CompanyType } from '../models/CompanyType';

/**
 * 為不同公司類型選擇顏色
 * @param type 公司類型
 * @returns 顏色代碼
 */
export function getCompanyColor(type: CompanyType | string): string {
  // 確保 type 是 CompanyType 類型
  const companyType = typeof type === 'string' ? type as CompanyType : type;

  switch(companyType) {
    case CompanyType.FARM: return '#8BC34A';
    case CompanyType.RESTAURANT: return '#FF9800';
    case CompanyType.FACTORY: return '#607D8B';
    case CompanyType.RETAIL: return '#E91E63';
    case CompanyType.TECH: return '#2196F3';
    case CompanyType.LOGISTICS: return '#9C27B0';
    default: return '#9E9E9E';
  }
}
