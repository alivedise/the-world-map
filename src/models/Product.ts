export interface Product {
  id: string;
  name: string;
  type: 'physical' | 'virtual';
  quantity: number;
  producerId: string; // 生產者ID (可能是Company或Citizen)
  consumerId?: string; // 消費者ID
  destinationType?: BuildingType; // 實體產品的目的地類型
  destination?: { x: number; y: number }; // 實體產品的目的地座標
}

// 產品類型定義
export interface ProductDefinition {
  name: string;
  type: 'physical' | 'virtual';
  baseProductionTime: number;
  baseConsumptionTime: number;
  requiredResources?: {
    productName: string;
    quantity: number;
  }[];
}

// 預設產品定義
export const defaultProducts: { [key: string]: ProductDefinition } = {
  // 工業產品
  'electronics': {
    name: '電子產品',
    type: 'physical',
    baseProductionTime: 30,
    baseConsumptionTime: 15,
  },
  'furniture': {
    name: '傢俱',
    type: 'physical',
    baseProductionTime: 45,
    baseConsumptionTime: 20,
  },
  
  // 商業產品
  'retail_goods': {
    name: '零售商品',
    type: 'physical',
    baseProductionTime: 20,
    baseConsumptionTime: 10,
    requiredResources: [
      { productName: 'electronics', quantity: 2 },
      { productName: 'furniture', quantity: 1 }
    ]
  },
  
  // 辦公產品
  'business_report': {
    name: '業務報告',
    type: 'virtual',
    baseProductionTime: 25,
    baseConsumptionTime: 10
  },
  'software': {
    name: '軟體',
    type: 'virtual',
    baseProductionTime: 40,
    baseConsumptionTime: 20
  }
}; 