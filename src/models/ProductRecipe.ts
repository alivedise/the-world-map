import { CompanyType } from '../models/CompanyType';

export interface ProductRecipe {
  id: string;
  output: {
    productName: string;
    quantity: number;
  };
  inputs: {
    productName: string;
    quantity: number;
  }[];
  producerType: CompanyType;
  consumerTypes: CompanyType[];
  productionTime: number;
}

// 預設配方定義
export const defaultRecipes: ProductRecipe[] = [
  // 農場產品
  {
    id: 'raw_food_production',
    output: {
      productName: 'vegetables',
      quantity: 1
    },
    inputs: [],
    producerType: CompanyType.FARM,
    consumerTypes: [CompanyType.RESTAURANT],
    productionTime: 30
  },
  {
    id: 'fruit_production',
    output: {
      productName: 'fruits',
      quantity: 1
    },
    inputs: [],
    producerType: CompanyType.FARM,
    consumerTypes: [CompanyType.RESTAURANT, CompanyType.RETAIL],
    productionTime: 40
  },
  {
    id: 'grain_production',
    output: {
      productName: 'grains',
      quantity: 1
    },
    inputs: [],
    producerType: CompanyType.FARM,
    consumerTypes: [CompanyType.RESTAURANT, CompanyType.FACTORY],
    productionTime: 50
  },
  
  // 餐廳產品
  {
    id: 'meal_preparation',
    output: {
      productName: 'meal',
      quantity: 1
    },
    inputs: [
      {
        productName: 'vegetables',
        quantity: 2
      }
    ],
    producerType: CompanyType.RESTAURANT,
    consumerTypes: [], // 終端產品，直接給市民消費
    productionTime: 20
  },
  {
    id: 'dessert_preparation',
    output: {
      productName: 'dessert',
      quantity: 1
    },
    inputs: [
      {
        productName: 'fruits',
        quantity: 1
      }
    ],
    producerType: CompanyType.RESTAURANT,
    consumerTypes: [], // 終端產品
    productionTime: 15
  },
  {
    id: 'fast_food_production',
    output: {
      productName: 'fast_food',
      quantity: 2
    },
    inputs: [
      {
        productName: 'grains',
        quantity: 1
      }
    ],
    producerType: CompanyType.RESTAURANT,
    consumerTypes: [], // 終端產品
    productionTime: 10
  },
  
  // 工廠產品
  {
    id: 'electronics_assembly',
    output: {
      productName: 'electronic_parts',
      quantity: 1
    },
    inputs: [
      {
        productName: 'raw_materials',
        quantity: 2
      }
    ],
    producerType: CompanyType.FACTORY,
    consumerTypes: [CompanyType.RETAIL, CompanyType.TECH],
    productionTime: 30
  },
  {
    id: 'pc_assembly',
    output: {
      productName: 'personal_computer',
      quantity: 1
    },
    inputs: [
      {
        productName: 'electronic_parts',
        quantity: 3
      }
    ],
    producerType: CompanyType.FACTORY,
    consumerTypes: [CompanyType.RETAIL, CompanyType.TECH],
    productionTime: 45
  },
  {
    id: 'smartphone_assembly',
    output: {
      productName: 'smartphone',
      quantity: 2
    },
    inputs: [
      {
        productName: 'electronic_parts',
        quantity: 2
      }
    ],
    producerType: CompanyType.FACTORY,
    consumerTypes: [CompanyType.RETAIL],
    productionTime: 35
  },
  {
    id: 'furniture_manufacturing',
    output: {
      productName: 'furniture',
      quantity: 1
    },
    inputs: [
      {
        productName: 'raw_materials',
        quantity: 3
      }
    ],
    producerType: CompanyType.FACTORY,
    consumerTypes: [CompanyType.RETAIL],
    productionTime: 50
  },
  
  // 零售產品
  {
    id: 'retail_packaging',
    output: {
      productName: 'retail_goods',
      quantity: 1
    },
    inputs: [
      {
        productName: 'electronic_parts',
        quantity: 1
      }
    ],
    producerType: CompanyType.RETAIL,
    consumerTypes: [], // 終端產品
    productionTime: 15
  },
  {
    id: 'electronics_retail',
    output: {
      productName: 'electronics_retail',
      quantity: 1
    },
    inputs: [
      {
        productName: 'personal_computer',
        quantity: 1
      }
    ],
    producerType: CompanyType.RETAIL,
    consumerTypes: [], // 終端產品
    productionTime: 10
  },
  {
    id: 'smartphone_retail',
    output: {
      productName: 'smartphone_retail',
      quantity: 1
    },
    inputs: [
      {
        productName: 'smartphone',
        quantity: 1
      }
    ],
    producerType: CompanyType.RETAIL,
    consumerTypes: [], // 終端產品
    productionTime: 10
  },
  {
    id: 'grocery_retail',
    output: {
      productName: 'grocery',
      quantity: 2
    },
    inputs: [
      {
        productName: 'fruits',
        quantity: 1
      }
    ],
    producerType: CompanyType.RETAIL,
    consumerTypes: [], // 終端產品
    productionTime: 10
  },
  
  // 科技公司產品
  {
    id: 'software_development',
    output: {
      productName: 'software_app',
      quantity: 1
    },
    inputs: [
      {
        productName: 'personal_computer',
        quantity: 1
      }
    ],
    producerType: CompanyType.TECH,
    consumerTypes: [CompanyType.RETAIL],
    productionTime: 40
  },
  {
    id: 'cloud_service',
    output: {
      productName: 'cloud_service',
      quantity: 1
    },
    inputs: [
      {
        productName: 'electronic_parts',
        quantity: 2
      }
    ],
    producerType: CompanyType.TECH,
    consumerTypes: [CompanyType.RETAIL, CompanyType.FACTORY],
    productionTime: 35
  },
  {
    id: 'saas_development',
    output: {
      productName: 'saas_solution',
      quantity: 1
    },
    inputs: [
      {
        productName: 'cloud_service',
        quantity: 1
      }
    ],
    producerType: CompanyType.TECH,
    consumerTypes: [CompanyType.FACTORY, CompanyType.LOGISTICS],
    productionTime: 50
  },
  {
    id: 'ai_service',
    output: {
      productName: 'ai_service',
      quantity: 1
    },
    inputs: [
      {
        productName: 'personal_computer',
        quantity: 2
      },
      {
        productName: 'cloud_service',
        quantity: 1
      }
    ],
    producerType: CompanyType.TECH,
    consumerTypes: [CompanyType.RETAIL, CompanyType.FACTORY],
    productionTime: 60
  },
  
  // 物流公司服務
  {
    id: 'logistics_service',
    output: {
      productName: 'logistics_service',
      quantity: 1
    },
    inputs: [
      {
        productName: 'raw_materials',
        quantity: 1
      }
    ],
    producerType: CompanyType.LOGISTICS,
    consumerTypes: [CompanyType.FARM, CompanyType.FACTORY, CompanyType.RETAIL, CompanyType.RESTAURANT],
    productionTime: 20
  },
  {
    id: 'express_delivery',
    output: {
      productName: 'express_delivery',
      quantity: 2
    },
    inputs: [
      {
        productName: 'raw_materials',
        quantity: 1
      }
    ],
    producerType: CompanyType.LOGISTICS,
    consumerTypes: [CompanyType.RETAIL],
    productionTime: 15
  },
  {
    id: 'warehousing_service',
    output: {
      productName: 'warehousing',
      quantity: 1
    },
    inputs: [
      {
        productName: 'raw_materials',
        quantity: 2
      }
    ],
    producerType: CompanyType.LOGISTICS,
    consumerTypes: [CompanyType.FACTORY, CompanyType.RETAIL],
    productionTime: 30
  }
];