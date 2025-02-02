export enum BuildingType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial',
  OFFICE = 'office'
}


export const BuildingEmoji: { [key in BuildingType]: string } = {
  [BuildingType.RESIDENTIAL]: '🏠', // 住宅
  [BuildingType.COMMERCIAL]: '🏪', // 商業
  [BuildingType.INDUSTRIAL]: '🏭', // 工業
  [BuildingType.OFFICE]: '🏢'  // 辦公
};

export interface BuildingTypeParams {
  name: string;
  color: string;
  emoji: string;
  maxSize: {
    width: number;
    height: number;
  };
  minSize: {
    width: number; 
    height: number;
  };
}

export const buildingTypeParams: { [key in BuildingType]: BuildingTypeParams } = {
  [BuildingType.RESIDENTIAL]: {
    name: '住宅區',
    color: '#90EE90', // 淺綠色
    emoji: BuildingEmoji[BuildingType.RESIDENTIAL],
    maxSize: {
      width: 3,
      height: 3
    },
    minSize: {
      width: 1,
      height: 1
    }
  },
  [BuildingType.COMMERCIAL]: {
    name: '商業區',
    color: '#87CEEB', // 淺藍色
    emoji: BuildingEmoji[BuildingType.COMMERCIAL],
    maxSize: {
      width: 2,
      height: 2  
    },
    minSize: {
      width: 1,
      height: 1
    }
  },
  [BuildingType.INDUSTRIAL]: {
    name: '工業區',
    color: '#DEB887', // 褐色
    emoji: BuildingEmoji[BuildingType.INDUSTRIAL],
    maxSize: {
      width: 4,
      height: 4
    },
    minSize: {
      width: 2,
      height: 2
    }
  },
  [BuildingType.OFFICE]: {
    name: '辦公區',
    color: '#DDA0DD', // 淺紫色
    emoji: BuildingEmoji[BuildingType.OFFICE],
    maxSize: {
      width: 2,
      height: 3
    },
    minSize: {
      width: 1,
      height: 2
    }
  }
};