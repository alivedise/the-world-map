import { Vehicle } from '../models/Vehicle';
import { Product } from '../models/Product';
import VehicleManager from './VehicleManager';
import CompanyManager from './company-manager';
import RoadManager from './RoadManager';
import { Company } from '../models/Company';
import BuildingManager from './building-manager';

export default class TransportationService {
  private lastDeliveryAttempt: number = 0;
  private deliveryInterval: number = 5000; // 每5秒嘗試一次配送

  constructor(
    private vehicleManager: VehicleManager,
    private companyManager: CompanyManager,
    private roadManager: RoadManager,
    private buildingManager: BuildingManager
  ) {}

  update(deltaTime: number, currentTime: number) {
    // 更新所有車輛狀態
    this.vehicleManager.update({ 
      roadManager: this.roadManager,
      deltaTime: deltaTime // 使用傳入的 deltaTime 參數
    });
    
    // 定期嘗試匹配產品和目的地公司
    if (currentTime - this.lastDeliveryAttempt > this.deliveryInterval) {
      this.matchProductsToDestinations();
      this.lastDeliveryAttempt = currentTime;
    }
  }

  /**
   * 處理完成的產品，尋找需要該產品的公司
   */
  processCompletedProducts(completedProducts: Product[], producerCompany: Company) {
    for (const product of completedProducts) {
      if (product.type === 'physical') {
        // 尋找需要此產品的目標公司
        const destinationCompany = this.findDestinationForProduct(product);
        
        if (destinationCompany) {
          const producerBuilding = this.buildingManager.getBuilding(producerCompany.getBuildingId());
          const destinationBuilding = this.buildingManager.getBuilding(destinationCompany.getBuildingId());
          
          if (producerBuilding && destinationBuilding) {
            // 設置產品目的地
            product.destination = destinationBuilding.getPosition();
            product.consumerId = destinationCompany.getId();
            
            // 尋找可用的運輸車輛
            const vehicle = this.vehicleManager.getAvailableVehicle(
              producerCompany.getId(),
              product.quantity
            );
            
            if (vehicle) {
              console.log(`分配車輛 ${vehicle.id} 運送 ${product.quantity} 個 ${product.name} 從 ${producerCompany.name} 到 ${destinationCompany.name}`);
              
              vehicle.assignDelivery(
                { name: product.name, quantity: product.quantity },
                product.destination
              );
              
              // 尋找從生產公司到目標公司的路徑
              const path = this.roadManager.findPath(
                producerBuilding.getPosition(),
                destinationBuilding.getPosition()
              );
              
              if (path) {
                // 擴展路徑，使移動更加平滑
                const expandedPath = this.expandPath(path, 32);
                vehicle.setPath(expandedPath);
              }
            }
          }
        }
      }
    }
  }

  /**
   * 根據產品類型尋找需要該產品的公司
   */
  private findDestinationForProduct(product: Product): Company | null {
    const companies = this.companyManager.getCompanies();
    
    // 篩選出所有可能需要此產品的公司
    const potentialConsumers = companies.filter(company => {
      // 排除生產者本身
      if (company.getId() === product.producerId) return false;
      
      // 檢查是否有使用此產品作為原材料的生產配方
      const recipes = company.getProducibleProducts();
      
      return recipes.some(recipe => {
        const recipeObj = company.getRecipeById(recipe.recipeId);
        return recipeObj && recipeObj.inputs.some(input => 
          input.productName === product.name
        );
      });
    });
    
    if (potentialConsumers.length === 0) return null;
    
    // 優先選擇庫存中該產品數量最少的公司
    return potentialConsumers.sort((a, b) => {
      const aQuantity = a.getInventory().get(product.name) || 0;
      const bQuantity = b.getInventory().get(product.name) || 0;
      return aQuantity - bQuantity;
    })[0];
  }

  /**
   * 匹配所有待配送的產品和目的地
   */
  private matchProductsToDestinations() {
    // 這個方法可以用於手動觸發產品匹配，例如在生產出新產品後
  }

  /**
   * 擴展路徑，使車輛移動更平滑
   */
  private expandPath(path: { x: number, y: number }[], steps: number): { x: number, y: number }[] {
    const expandedPath: { x: number, y: number }[] = [];
    
    for (let i = 0; i < path.length - 1; i++) {
      const start = path[i];
      const end = path[i + 1];
      
      for (let j = 0; j < steps; j++) {
        const x = start.x + (end.x - start.x) * (j / steps);
        const y = start.y + (end.y - start.y) * (j / steps);
        expandedPath.push({ x, y });
      }
    }
    
    return expandedPath;
  }
}
