import { BuildingType } from '../services/building-type';
import { Product, ProductDefinition } from './Product';
import { ProductRecipe, defaultRecipes } from './ProductRecipe';
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
    
    // 初始化公司庫存，添加一些基礎原料以便能夠啟動生產
    this.initializeInventory();
  }

  // 初始化公司庫存，添加基礎原料
  private initializeInventory() {
    // 為不同的公司類型添加適當的初始庫存
    switch(this.type) {
      case CompanyType.FARM:
        // 農場不需要輸入材料，但為了安全起見還是添加一些
        this.inventory.set('raw_materials', 10);
        break;
        
      case CompanyType.RESTAURANT:
        // 餐廳需要各種食材
        this.inventory.set('vegetables', 10);
        this.inventory.set('fruits', 8);
        this.inventory.set('grains', 5);
        break;
        
      case CompanyType.FACTORY:
        // 工廠需要原材料和電子零件
        this.inventory.set('raw_materials', 15);
        this.inventory.set('electronic_parts', 10);
        break;
        
      case CompanyType.RETAIL:
        // 零售店需要各種產品
        this.inventory.set('electronic_parts', 5);
        this.inventory.set('personal_computer', 3);
        this.inventory.set('smartphone', 4);
        this.inventory.set('fruits', 5);
        break;
        
      case CompanyType.TECH:
        // 科技公司需要電子產品和其他技術資源
        this.inventory.set('electronic_parts', 8);
        this.inventory.set('personal_computer', 4);
        this.inventory.set('cloud_service', 2);
        break;
        
      case CompanyType.LOGISTICS:
        // 物流公司需要原材料和燃料
        this.inventory.set('raw_materials', 10);
        break;
        
      default:
        // 為其他公司類型添加通用材料
        this.inventory.set('raw_materials', 5);
    }
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

    // 檢查是否已經在生產該配方
    if (this.activeRecipes.has(recipe.id)) {
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

        // 添加產品到庫存
        this.addToInventory(product.name, product.quantity);

        completedProducts.push(product);
        this.activeRecipes.delete(recipeId);
      }
    }

    // 如果沒有活躍的生產配方，嘗試開始新的生產
    if (this.activeRecipes.size < 2) {  // 限制同時生產的數量
      const availableRecipes = context.recipeManager.getRecipesForType(this.type);
      
      // 嘗試開始每個可用配方的生產
      for (const recipe of availableRecipes) {
        const started = this.startProduction(recipe);
        if (started) {
          // 成功啟動生產，如果不想一次啟動太多生產，可以在這裡break
          break;
        }
      }
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
  getProducibleProducts(): { productName: string, recipeId: string }[] {
    // Find recipes where this company is the producer type
    console.log('Company type:', this.type);
    console.log('All recipes:', defaultRecipes);
    
    const availableRecipes = defaultRecipes.filter(recipe => {
      console.log('Checking recipe:', recipe.id, 'producerType:', recipe.producerType, 'matches?', recipe.producerType === this.type);
      return recipe.producerType === this.type;
    });
    
    console.log('Available recipes:', availableRecipes);
    
    // Return product details including recipe IDs
    return availableRecipes.map(recipe => ({
      productName: recipe.output.productName,
      recipeId: recipe.id
    }));
  }

  // 取得目前庫存狀態
  getInventoryStatus(): { productName: string; quantity: number }[] {
    return Array.from(this.inventory.entries()).map(([productName, quantity]) => ({
      productName,
      quantity
    }));
  }

  // 取得公司地址（根據建築物ID）
  getAddress(): string | null {
    // 這裡可以根據建築物ID獲取地址，暫時返回第一個建築物ID
    if (this.buildingIds.size > 0) {
      return `Building ${Array.from(this.buildingIds)[0]}`;
    }
    return null;
  }

  // 取得目前進行中的生產
  getActiveProductions(): [string, {
    recipe: ProductRecipe;
    progress: number;
    remainingInputs: Map<string, number>;
  }][] {
    return Array.from(this.activeRecipes.entries());
  }
}