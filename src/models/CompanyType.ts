import { BuildingType } from '../services/building-type';

export enum CompanyType {
  FARM = 'FARM',
  FACTORY = 'FACTORY',
  RETAIL = 'RETAIL',
  TECH = 'TECH',
  LOGISTICS = 'LOGISTICS',
  RESTAURANT = 'RESTAURANT'
}

export interface CompanyTypeDefinition {
  name: string;
  buildingTypes: BuildingType[];
  emoji: string;
  color: string;
}

export const companyTypeDefinitions: { [key in CompanyType]: CompanyTypeDefinition } = {
  [CompanyType.FARM]: {
    name: '農場',
    buildingTypes: [BuildingType.INDUSTRIAL],
    emoji: '🌾',
    color: '#90EE90'
  },
  [CompanyType.FACTORY]: {
    name: '工廠',
    buildingTypes: [BuildingType.INDUSTRIAL],
    emoji: '🏭',
    color: '#A0522D'
  },
  [CompanyType.RETAIL]: {
    name: '零售',
    buildingTypes: [BuildingType.COMMERCIAL],
    emoji: '🏪',
    color: '#4169E1'
  },
  [CompanyType.TECH]: {
    name: '科技',
    buildingTypes: [BuildingType.OFFICE],
    emoji: '💻',
    color: '#4B0082'
  },
  [CompanyType.LOGISTICS]: {
    name: '物流',
    buildingTypes: [BuildingType.INDUSTRIAL, BuildingType.COMMERCIAL],
    emoji: '🚛',
    color: '#FF8C00'
  },
  [CompanyType.RESTAURANT]: {
    name: '餐廳',
    buildingTypes: [BuildingType.COMMERCIAL],
    emoji: '🍽️',
    color: '#DC143C'
  }
};

export function getBuildingCompanyTypes(buildingType: BuildingType): CompanyType[] {
  // 根據建築類型返回可能的公司類型
  switch (buildingType) {
    case BuildingType.INDUSTRIAL:
      return [CompanyType.FACTORY, CompanyType.FARM, CompanyType.LOGISTICS];
    case BuildingType.COMMERCIAL:
      return [CompanyType.RETAIL, CompanyType.RESTAURANT, CompanyType.LOGISTICS];
    case BuildingType.OFFICE:
      return [CompanyType.TECH];
    default:
      return [];
  }
}

// 隨機選擇一個適合該建築類型的公司類型
export function getRandomCompanyType(buildingType: BuildingType): CompanyType {
  const possibleTypes = getBuildingCompanyTypes(buildingType);
  if (possibleTypes.length === 0) {
    throw new Error(`無法為建築類型 ${buildingType} 創建公司類型`);
  }
  return possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
} 