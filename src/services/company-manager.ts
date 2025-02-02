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

  getCompanies(): Company[] {
    return Array.from(this.companies.values());
  }

  // when building is created, try to generate a new company to move in
  // when building is destroyed, try to remove the company
  introduceCompany(building: Building) {
    if (building) {
      const company = this.createCompany(building.address, building.getType(), building.id)
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

  update(deltaTime: number, context: {
    vehicleManager: VehicleManager,
    recipeManager: RecipeManager,
    companyManager: CompanyManager,
  }) {
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