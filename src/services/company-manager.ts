import { Company } from '../models/Company';
import { BuildingType } from './building-type';
import Building from '../services/building';
import { Product, defaultProducts } from '../models/Product';
import { VehicleManager } from './vehicle-manager';
import { CompanyType } from '../models/CompanyType';
import { getRandomCompanyType } from '../models/CompanyType';
import RecipeManager from './recipe-manager';

export default class CompanyManager {
  private companies: Map<string, Company> = new Map();
  private buildingToCompany: Map<string, string> = new Map();
  
  // 上一次分發原材料的時間（用於週期性分發）
  private lastDistributionTime: number = 0;
  // 分發原材料的頻率（毫秒）
  private distributionInterval: number = 60000; // 1分鐘

  getCompanies(): Company[] {
    const companies = Array.from(this.companies.values());
    console.log('CompanyManager.getCompanies called, returning:', companies);
    return companies;
  }

  // when building is created, try to generate a new company to move in
  // when building is destroyed, try to remove the company
  introduceCompany(building: Building) {
    if (building) {
      const company = this.createCompany(building.address, building.getType(), building.id);
      // 初始化時確保公司有原材料
      this.distributeRawMaterials([company]);
    }
  }

  private convertBuildingTypeToCompanyType(type: BuildingType): CompanyType {
    // 根據建築類型返回對應的公司類型
    return type as unknown as CompanyType; // 臨時解決方案
  }

  createCompany(name: string, type: BuildingType, buildingId: string): Company {
    const companyType = getRandomCompanyType(type);
    const company = new Company(name, companyType, buildingId);
    this.companies.set(company.getId(), company);
    this.buildingToCompany.set(buildingId, company.getId());
    return company;
  }

  getCompanyByBuilding(buildingId: string): Company | undefined {
    const companyId = this.buildingToCompany.get(buildingId);
    if (companyId) {
      return this.companies.get(companyId);
    }
    return undefined;
  }
  
  // 向指定的公司分發原材料
  distributeRawMaterials(targetCompanies: Company[]) {
    for (const company of targetCompanies) {
      const companyType = company.getType();
      
      // 根據公司類型提供適當的原材料
      switch (companyType) {
        case CompanyType.FARM:
          // 農場不需要輸入原料，但可以給予少量初始資源使生產保持活躍
          company.addToInventory('raw_materials', 5);
          break;
        case CompanyType.RESTAURANT:
          // 餐廳需要食物原料
          company.addToInventory('vegetables', 5);
          company.addToInventory('fruits', 3);
          break;
        case CompanyType.FACTORY:
          // 工廠需要原材料
          company.addToInventory('raw_materials', 5);
          break;
        case CompanyType.RETAIL:
          // 零售店需要各種產品
          company.addToInventory('electronic_parts', 3);
          break;
        case CompanyType.TECH:
          // 科技公司可能需要電子產品
          company.addToInventory('electronic_parts', 3);
          break;
        case CompanyType.LOGISTICS:
          // 物流公司需要各種產品
          company.addToInventory('raw_materials', 3);
          break;
      }
    }
  }

  update(deltaTime: number, context: {
    vehicleManager: VehicleManager,
    recipeManager: RecipeManager,
    companyManager: CompanyManager,
  }) {
    const currentTime = Date.now();
    
    // 定期向公司分發原材料，保持生產
    if (currentTime - this.lastDistributionTime > this.distributionInterval) {
      this.distributeRawMaterials(this.getCompanies());
      this.lastDistributionTime = currentTime;
    }
    
    for (const company of this.companies.values()) {
      const completedProducts = company.update(deltaTime, context);
      
      // 處理完成的產品
      for (const product of completedProducts) {
        if (product.type === 'physical' && product.destination) {
          // 尋找可用的運輸車輛
          const vehicle = context.vehicleManager.getAvailableVehicle(
            company.getId(),
            product.quantity
          );
          
          if (vehicle) {
            vehicle.assignDelivery(
              { name: product.name, quantity: product.quantity },
              product.destination
            );
          }
        }
      }
    }
  }
}