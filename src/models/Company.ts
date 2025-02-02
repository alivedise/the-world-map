import { BuildingType } from '../services/building-type';
import { Product, ProductDefinition } from './Product';
import { ProductRecipe } from './ProductRecipe';
import { RecipeManager } from './RecipeManager';
import { CompanyManager } from './CompanyManager';
import { CompanyType } from './CompanyType';
import { faker } from '@faker-js/faker';

export class Company {
  private id: string;
  private name: string;
  private type: CompanyType;
  private buildingIds: Set<string>;
  private inventory: Map<string, number> = new Map(); // 產品名稱 -> 數量
  private activeRecipes: Map<string, {
    recipe: ProductRecipe;
    progress: number;
    remainingInputs: Map<string, number>;
  }> = new Map();

  constructor(name: string, type: CompanyType, buildingId: string) {
    this.id = `company-${Math.random().toString(36).substr(2, 9)}`;
    this.name = faker.company.name();
    this.type = type;
    this.buildingIds = new Set([buildingId]);
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getType(): CompanyType {
    return this.type;
  }

  addBuilding(buildingId: string) {
    this.buildingIds.add(buildingId);
  }

  removeBuilding(buildingId: string) {
    this.buildingIds.delete(buildingId);
  }

  getBuildings(): string[] {
    return Array.from(this.buildingIds);
  }

  startProduction(recipe: ProductRecipe): boolean {
    // 檢查是否有足夠的原料
    const hasEnoughInputs = recipe.inputs.every(input => {
      const currentQuantity = this.inventory.get(input.productName) || 0;
      return currentQuantity >= input.quantity;
    });

    if (!hasEnoughInputs) {
      return false;
    }

    // 扣除原料
    recipe.inputs.forEach(input => {
      const currentQuantity = this.inventory.get(input.productName) || 0;
      this.inventory.set(input.productName, currentQuantity - input.quantity);
    });

    // 開始生產
    this.activeRecipes.set(recipe.id, {
      recipe,
      progress: 0,
      remainingInputs: new Map(
        recipe.inputs.map(input => [input.productName, input.quantity])
      )
    });

    return true;
  }

  addToInventory(productName: string, quantity: number) {
    const currentQuantity = this.inventory.get(productName) || 0;
    this.inventory.set(productName, currentQuantity + quantity);
  }

  update(deltaTime: number, context: {
    recipeManager: RecipeManager;
    companyManager: CompanyManager;
  }): Product[] {
    const completedProducts: Product[] = [];

    // 更新生產進度
    for (const [recipeId, production] of this.activeRecipes.entries()) {
      production.progress += deltaTime;
      
      if (production.progress >= production.recipe.productionTime) {
        // 生產完成
        const product: Product = {
          id: `product-${Math.random().toString(36).substr(2, 9)}`,
          name: production.recipe.output.productName,
          type: 'physical',
          quantity: production.recipe.output.quantity,
          producerId: this.id
        };

        completedProducts.push(product);
        this.activeRecipes.delete(recipeId);
      }
    }

    // 自動開始新的生產（如果有可用配方）
    const availableRecipes = context.recipeManager.getRecipesForType(this.type);
    for (const recipe of availableRecipes) {
      this.startProduction(recipe);
    }

    return completedProducts;
  }

  canProduceRecipe(recipe: ProductRecipe): boolean {
    return recipe.producerType === this.type;
  }

  canConsumeProduct(recipe: ProductRecipe): boolean {
    return recipe.consumerTypes.includes(this.type);
  }

  // 取得此公司需要的產品
  getRequiredProducts(): string[] {
    const recipes = defaultRecipes.filter(recipe => 
      recipe.consumerTypes.includes(this.type)
    );
    
    const requiredProducts = new Set<string>();
    recipes.forEach(recipe => {
      recipe.inputs.forEach(input => {
        requiredProducts.add(input.productName);
      });
    });
    
    return Array.from(requiredProducts);
  }

  // 取得此公司可以生產的產品
  getProducibleProducts(): string[] {
    const recipes = defaultRecipes.filter(recipe => 
      recipe.producerType === this.type
    );
    
    return recipes.map(recipe => recipe.output.productName);
  }

  // 取得目前庫存狀態
  getInventoryStatus(): { productName: string; quantity: number }[] {
    return Array.from(this.inventory.entries()).map(([productName, quantity]) => ({
      productName,
      quantity
    }));
  }
} 