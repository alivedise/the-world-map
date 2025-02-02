interface WorkSubActionType {
  name: string;
  duration: number;
  product?: {
    type: 'physical' | 'virtual';
    name: string;
    quantity: number;
    destinationType?: BuildingType; // 實體產品需要的目的地類型
  };
}

export const OfficeSubActions: WorkSubActionType[] = [
  { 
    name: '撰寫報告', 
    duration: 30,
    product: {
      type: 'virtual',
      name: '業務報告',
      quantity: 1
    }
  },
  { 
    name: '開發程式', 
    duration: 45,
    product: {
      type: 'virtual',
      name: '軟體模組',
      quantity: 1
    }
  }
];

export const IndustrialSubActions: WorkSubActionType[] = [
  {
    name: '組裝零件',
    duration: 20,
    product: {
      type: 'physical',
      name: '電子零件',
      quantity: 5,
      destinationType: BuildingType.COMMERCIAL
    }
  },
  {
    name: '包裝產品',
    duration: 15,
    product: {
      type: 'physical',
      name: '包裝商品',
      quantity: 3,
      destinationType: BuildingType.COMMERCIAL
    }
  }
];

export class WorkSubAction {
  name: string;
  duration: number;
  product?: {
    type: 'physical' | 'virtual';
    name: string;
    quantity: number;
    destinationType?: BuildingType;
  };
  progress: number = 0;

  constructor(type: WorkSubActionType) {
    this.name = type.name;
    this.duration = type.duration;
    this.product = type.product;
  }

  update(deltaTime: number): boolean {
    this.progress += deltaTime;
    return this.progress >= this.duration;
  }
} 