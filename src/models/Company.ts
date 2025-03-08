import { BuildingType } from '../services/building-type';
import { Product, ProductDefinition, defaultProducts } from './Product';
import { ProductRecipe, defaultRecipes } from './ProductRecipe';
import RecipeManager from '../services/recipe-manager';
import { CompanyManager } from './CompanyManager';
import { CompanyType } from './CompanyType';
import { faker } from '@faker-js/faker';
import { HistoryLogger } from '../services/history-logger';

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
  private employees: number = 0; // 公司員工數量

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

    // 記錄生產開始
    const historyLogger = HistoryLogger.getInstance();
    historyLogger.addLog(
      'company', 
      this.id, 
      'start_production', 
      `${this.name} 開始生產 ${recipe.output.productName}`
    );

    return true;
  }

  addToInventory(productName: string, quantity: number) {
    const currentQuantity = this.inventory.get(productName) || 0;
    this.inventory.set(productName, currentQuantity + quantity);
  }

  // 產品完成時的處理方法
  private handleProductCompletion(recipeId: string, recipe: ProductRecipe): Product[] {
    // 將成功生產的產品添加到庫存
    const outputProduct: Product = {
      id: `product-${Math.random().toString(36).substr(2, 9)}`,
      name: recipe.output.productName,
      type: defaultProducts[recipe.output.productName]?.type || 'physical',
      quantity: recipe.output.quantity,
      producerId: this.id
    };
    
    this.addToInventory(recipe.output.productName, recipe.output.quantity);

    // 清空該配方的活動狀態
    this.activeRecipes.delete(recipeId);
    
    // 記錄產品完成
    const historyLogger = HistoryLogger.getInstance();
    historyLogger.addLog(
      'company', 
      this.id, 
      'finish_production', 
      `${this.name} 完成了 ${recipe.output.productName} 的生產`
    );

    // 返回完成的產品信息，以便外層處理運輸
    return [outputProduct];
  }

  // 更新公司狀態
  update(deltaTime: number, context: {
    vehicleManager: any;
    recipeManager: RecipeManager;
    companyManager: any;
  }): Product[] {
    // 初始化完成產品數組
    const completedProducts: Product[] = [];
    
    // 計算生產速度倍率
    const productionSpeedMultiplier = this.getSpeedMultiplier();
    const adjustedDeltaTime = deltaTime * productionSpeedMultiplier;
    
    // 更新生產進度
    for (const [recipeId, production] of this.activeRecipes.entries()) {
      production.progress += adjustedDeltaTime;
      const recipe = context.recipeManager.getRecipeById(recipeId);
      
      if (recipe && production.progress >= recipe.productionTime) {
        // 產品完成
        const products = this.handleProductCompletion(recipeId, recipe);
        completedProducts.push(...products);
      }
    }
    
    // 檢查是否需要啟動新的生產
    this.checkAndStartProductions(context.recipeManager);
    
    return completedProducts;
  }

  // 接收從別的公司運來的產品
  receiveProduct(productName: string, quantity: number) {
    this.addToInventory(productName, quantity);
    
    // 記錄產品接收
    const historyLogger = HistoryLogger.getInstance();
    historyLogger.addLog(
      'company', 
      this.id, 
      'receive', 
      `${this.name} 接收了 ${quantity} 個 ${productName}`
    );

    // 可以在這裡添加更多的處理邏輯，例如通知UI更新等
    return true;
  }

  // 檢查是否有需求某個產品
  needsProduct(productName: string, recipeManager?: RecipeManager): boolean {
    if (!recipeManager) {
      console.error('RecipeManager is required for needsProduct');
      return false;
    }
    
    // Get all recipes that this company can produce
    const recipes = recipeManager.getRecipesForType(this.type);
    if (!recipes || recipes.length === 0) return false;
    
    // Check if any recipe requires this product as an input
    for (const recipe of recipes) {
      for (const input of recipe.inputs) {
        if (input.productName === productName) {
          // Check current inventory to see if we need more
          const currentInventory = this.inventory.get(productName) || 0;
          return currentInventory < 10; // Return true if inventory is low
        }
      }
    }
    
    return false;
  }

  // 獲取生產速度倍率
  getSpeedMultiplier(): number {
    return Math.min(0.2 + this.employees * 0.2, 2.0);
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
  getProducibleProducts(): { productName: string, recipeId: string, isProducing?: boolean, productionProgress?: number }[] {
    // Find recipes where this company is the producer type
    console.log('Company type:', this.type);
    console.log('All recipes:', defaultRecipes);
    
    const availableRecipes = defaultRecipes.filter(recipe => {
      console.log('Checking recipe:', recipe.id, 'producerType:', recipe.producerType, 'matches?', recipe.producerType === this.type);
      return recipe.producerType === this.type;
    });
    
    console.log('Available recipes:', availableRecipes);
    
    // Return product details including recipe IDs and production status
    return availableRecipes.map(recipe => {
      const activeProduction = this.activeRecipes.get(recipe.id);
      const isProducing = !!activeProduction;
      const productionProgress = isProducing 
        ? (activeProduction.progress / recipe.productionTime) * 100
        : 0;
        
      return {
        productName: recipe.output.productName,
        recipeId: recipe.id,
        isProducing,
        productionProgress
      };
    });
  }

  // 取得目前庫存狀態
  getInventoryStatus(): { productName: string; quantity: number }[] {
    return Array.from(this.inventory.entries()).map(([productName, quantity]) => ({
      productName,
      quantity
    }));
  }

  // 獲取公司庫存Map對象
  getInventory(): Map<string, number> {
    return this.inventory;
  }
  
  /**
   * Reduce the quantity of a product in inventory
   * @param productName The name of the product to reduce
   * @param quantity The quantity to remove from inventory
   * @returns true if successful, false if not enough inventory
   */
  reduceInventory(productName: string, quantity: number): boolean {
    const currentQuantity = this.inventory.get(productName) || 0;
    
    if (currentQuantity < quantity) {
      // Not enough inventory
      return false;
    }
    
    this.inventory.set(productName, currentQuantity - quantity);
    
    // Log the inventory reduction
    const historyLogger = HistoryLogger.getInstance();
    historyLogger.addLog(
      'company', 
      this.id, 
      'reduce_inventory', 
      `${this.name} 從庫存中移除了 ${quantity} 個 ${productName}, 剩餘: ${currentQuantity - quantity}`
    );
    
    return true;
  }

  // 獲取公司位置
  getLocation(): { x: number, y: number } {
    // 假設公司位置是第一個建築物的位置
    // 在實際應用中應該從 buildingManager 獲取建築物位置
    // 這裡提供一個默認位置，以便代碼能夠繼續運行
    return { x: 13, y: 10 };
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

  getEmployees(): number {
    return this.employees;
  }

  setEmployees(number: number) {
    this.employees = number;
  }

  // 檢查並啟動新的生產
  private checkAndStartProductions(recipeManager: RecipeManager) {
    // 如果沒有活躍的生產配方，嘗試開始新的生產
    if (this.activeRecipes.size < 2) {  // 限制同時生產的數量
      const availableRecipes = recipeManager.getRecipesForType(this.type);
      
      // 嘗試開始每個可用配方的生產
      for (const recipe of availableRecipes) {
        const started = this.startProduction(recipe);
        if (started) {
          // 成功啟動生產，如果不想一次啟動太多生產，可以在這裡break
          break;
        }
      }
    }
  }
}