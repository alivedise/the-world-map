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
  {
    id: 'raw_food_production',
    output: {
      productName: 'raw_food',
      quantity: 1
    },
    inputs: [],
    producerType: CompanyType.FARM,
    consumerTypes: [CompanyType.RESTAURANT],
    productionTime: 30
  },
  {
    id: 'meal_preparation',
    output: {
      productName: 'prepared_meal',
      quantity: 1
    },
    inputs: [
      {
        productName: 'raw_food',
        quantity: 2
      }
    ],
    producerType: CompanyType.RESTAURANT,
    consumerTypes: [], // 終端產品，直接給市民消費
    productionTime: 20
  },
  {
    id: 'electronics_assembly',
    output: {
      productName: 'electronics',
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
  }
]; 