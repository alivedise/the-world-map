import { Company } from '../models/Company';
import { CompanyType, getRandomCompanyType } from '../models/CompanyType';
import { BuildingType } from './building-type';
import VehicleManager from './VehicleManager';
import RecipeManager from './recipe-manager';
import BuildingManager from './building-manager';
import { Product } from '../models/Product';
import RoadManager from './RoadManager';
import Job from '../models/Job';
import { HistoryLogger } from './history-logger';
import Building from './building';

export default class CompanyManager {
  private companies: Map<string, Company> = new Map();
  private buildingToCompany: Map<string, string> = new Map(); // buildingId -> companyId
  private lastDistributionTime: number = 0;
  private distributionInterval: number = 30000; // 每30秒分發一次原材料
  private buildingManager: BuildingManager;
  private roadManager: RoadManager;

  constructor(buildingManager: BuildingManager, roadManager: RoadManager) {
    this.buildingManager = buildingManager;
    this.roadManager = roadManager;
  }

  getCompany(id: string): Company | undefined {
    return this.companies.get(id);
  }

  getCompanies(): Company[] {
    return Array.from(this.companies.values());
  }

  getCompaniesByType(type: CompanyType): Company[] {
    return this.getCompanies().filter(company => company.getType() === type);
  }

  // 創建一個新公司 
  createCompany(buildingId: string, name: string = '', type?: BuildingType): Company {
    if (this.buildingToCompany.has(buildingId)) {
      throw new Error(`建築 ${buildingId} 已經有一家公司了`);
    }
    
    // 如果未提供名稱，生成一個隨機名稱
    if (!name) {
      name = `Company ${Math.floor(Math.random() * 1000)}`;
    }
    
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

  /**
   * 嘗試為產品尋找目的地
   */
  findDestinationForProduct(product: Product, recipeManager: RecipeManager): { company: Company, location: { x: number, y: number } } | null {
    if (product.type !== 'physical') return null;
    
    // 尋找所有需要此產品的公司
    const potentialConsumers = this.getCompanies().filter(company => {
      // 排除生產者自己
      if (company.getId() === product.producerId) return false;
      
      return company.needsProduct(product.name, recipeManager);
    });
    
    if (potentialConsumers.length === 0) return null;
    
    // 選擇第一個合適的公司 (可以擴展為根據距離或其他因素選擇)
    const destinationCompany = potentialConsumers[0];
    const destinationBuilding = this.buildingManager.getBuilding(destinationCompany.getBuildingId());
    
    if (!destinationBuilding) return null;
    
    return {
      company: destinationCompany,
      location: destinationBuilding.getPosition()
    };
  }

  /**
   * 安排車輛運送產品
   */
  arrangeTransportation(product: Product, vehicleManager: VehicleManager): boolean {
    if (product.type !== 'physical' || !product.producerId) return false;
    
    // 尋找產品的目的地
    const destination = this.findDestinationForProduct(product, vehicleManager.getRecipeManager());
    if (!destination) return false;
    
    // 設置產品消費者
    product.consumerId = destination.company.getId();
    product.destination = destination.location;
    
    // 獲取生產者公司和建築位置
    const producerCompany = this.getCompany(product.producerId);
    if (!producerCompany) return false;
    
    const producerBuilding = this.buildingManager.getBuilding(producerCompany.getBuildingId());
    if (!producerBuilding) return false;
    
    const producerLocation = producerBuilding.getPosition();
    
    // 為產品分配車輛
    return vehicleManager.assignVehicleForProduct(
      product,
      producerLocation,
      destination.location,
      { roadManager: this.roadManager }
    );
  }

  /**
   * 處理產品交付
   */
  handleProductDelivery(product: Product, targetCompanyId: string): boolean {
    const targetCompany = this.getCompany(targetCompanyId);
    if (!targetCompany) return false;
    
    // 讓目標公司接收產品
    return targetCompany.receiveProduct(product.name, product.quantity);
  }

  // Assign citizens to companies
  assignCitizensToCompanies(citizens: any[], jobManager: any) {
    // Get all companies that need employees
    const companies = this.getCompanies();
    if (companies.length === 0) return;
    
    // Find citizens without jobs
    const unemployedCitizens = citizens.filter(citizen => !citizen.companyId && citizen.occupation === "Unemployed");
    if (unemployedCitizens.length === 0) return;
    
    for (const citizen of unemployedCitizens) {
      // Randomly select a company
      const randomCompany = companies[Math.floor(Math.random() * companies.length)];
      
      // Find buildings owned by this company
      const buildingIds = randomCompany.getBuildings();
      if (buildingIds.length === 0) continue;
      
      // Get a random building from this company
      const buildingId = buildingIds[Math.floor(Math.random() * buildingIds.length)];
      
      // Choose a random job title based on company type
      let jobTitle = this.getRandomJobTitle(randomCompany.getType());
      
      // Create a job for this building if it doesn't exist
      let job = jobManager.getJobByLocation(buildingId);
      if (!job) {
        // Create a new job for this citizen at this building
        job = new Job(
          jobTitle, 
          `Works at ${randomCompany.getName()}`, 
          buildingId,
          randomCompany.getId()
        );
        jobManager.addJob(job);
      }
      
      // Assign citizen to this job
      if (job && !job.occupied) {
        citizen.startWorkAt(job, {
          buildingManager: this.buildingManager,
          roadManager: this.roadManager,
          companyManager: this,
          deltaTime: 0
        });
        
        // Set the work location
        citizen.workAt = buildingId;
        
        // Don't update company employee count here - it's done in startWorkAt already
        
        // Log the assignment
        const historyLogger = HistoryLogger.getInstance();
        historyLogger.addLog('system', 'company', 'assign-employee', 
          `Assigned ${citizen.name} to work at ${randomCompany.getName()} as ${jobTitle}`);
      }
    }
  }
  
  // Generate random job title based on company type
  private getRandomJobTitle(companyType: CompanyType): string {
    switch(companyType) {
      case CompanyType.FARM:
        const farmJobs = ['Farmer', 'Harvester', 'Agricultural Specialist', 'Farm Manager'];
        return farmJobs[Math.floor(Math.random() * farmJobs.length)];
      
      case CompanyType.RESTAURANT:
        const restaurantJobs = ['Chef', 'Waiter', 'Host', 'Kitchen Manager', 'Bartender'];
        return restaurantJobs[Math.floor(Math.random() * restaurantJobs.length)];
      
      case CompanyType.FACTORY:
        const factoryJobs = ['Factory Worker', 'Line Supervisor', 'Quality Control', 'Machine Operator'];
        return factoryJobs[Math.floor(Math.random() * factoryJobs.length)];
      
      case CompanyType.RETAIL:
        const retailJobs = ['Sales Associate', 'Cashier', 'Store Manager', 'Inventory Specialist'];
        return retailJobs[Math.floor(Math.random() * retailJobs.length)];
      
      case CompanyType.TECH:
        const techJobs = ['Software Engineer', 'IT Specialist', 'Product Manager', 'UX Designer'];
        return techJobs[Math.floor(Math.random() * techJobs.length)];
      
      case CompanyType.LOGISTICS:
        const logisticsJobs = ['Driver', 'Warehouse Manager', 'Logistics Coordinator', 'Shipping Specialist'];
        return logisticsJobs[Math.floor(Math.random() * logisticsJobs.length)];
      
      default:
        return 'Employee';
    }
  }

  update(deltaTime: number, context: {
    vehicleManager: VehicleManager,
    recipeManager: RecipeManager,
    buildingManager: BuildingManager,
    jobManager: any,
    residentialManager: any,
    currentTime: number,
    citizens: any[],
    map: WorldMap,
    pathFinder: PathFinder,
    roadManager: any
  }) {
    const {
      vehicleManager,
      recipeManager,
      currentTime,
      citizens,
      jobManager,
      map,
      pathFinder,
      roadManager
    } = context;
    
    // Assign citizens to companies
    this.assignCitizensToCompanies(citizens, jobManager);

    // Schedule vehicle movements for companies with idle vehicles
    // Call this every update to make vehicles move more frequently
    this.moveCompanyVehicles({
      vehicleManager,
      map,
      pathFinder,
      roadManager,
      recipeManager,
      allCompanies: this.companies
    });
    
    // 定期向公司分發原材料，保持生產
    if (context.currentTime - this.lastDistributionTime > this.distributionInterval) {
      this.distributeRawMaterials(this.getCompanies());
      this.lastDistributionTime = context.currentTime;
    }
    
    // 更新所有公司並處理完成的產品
    for (const company of this.companies.values()) {
      const completedProducts = company.update(deltaTime, {
        vehicleManager: context.vehicleManager,
        recipeManager: context.recipeManager,
        companyManager: this
      });
      
      // 處理完成的產品
      for (const product of completedProducts) {
        if (product.type === 'physical') {
          // 嘗試為產品安排運輸
          const transportationArranged = this.arrangeTransportation(product, context.vehicleManager);
          
          if (!transportationArranged) {
            console.log(`無法為產品 ${product.name} 安排運輸`);
            // 如果無法安排運輸，可以將產品保留在公司庫存中
          }
        }
      }
    }
  }

  // Move company vehicles
  private moveCompanyVehicles(context: {
    vehicleManager: VehicleManager,
    map: WorldMap,
    pathFinder: PathFinder,
    roadManager: any,
    recipeManager: RecipeManager,
    allCompanies: Map<string, Company>
  }) {
    const historyLogger = HistoryLogger.getInstance();
    
    // Add diagnostic counters to monitor vehicle states across all companies
    let totalVehicles = 0;
    let idleVehicleCount = 0;
    let loadingVehicles = 0;
    let deliveringVehicles = 0;
    let returningVehicles = 0;
    let unloadingVehicles = 0;
    
    // Iterate through companies
    const companies = context.allCompanies.values();
    for (const company of companies) {
      try {
        // Get all vehicles for this company
        const vehicles = context.vehicleManager.getCompanyVehicles(company.getId());
        if (!vehicles || vehicles.length === 0) {
          const companyName = company.getName();
          historyLogger.addLog('company', company.getId() || 'unknown', 'vehicle-error', 
            `公司 ${companyName} 沒有任何車輛，正在嘗試添加`);
          
          // Try to add vehicles for this company
          const companyLocation = company.getLocation();
          if (companyLocation) {
            context.vehicleManager.addCompanyVehicles(company.getId(), companyLocation);
            historyLogger.addLog(
              'system',
              'company-manager',
              'fix-vehicles',
              `為公司 ${company.getName()} (ID: ${company.getId()}) 補充了缺失的車輛`
            );
          }
        }
        
        // Get all vehicles for this company again after potentially adding some
        const companyVehicles = context.vehicleManager.getCompanyVehicles(company.getId());
        
        // Filter idle vehicles for potential assignments
        const idleVehicles = companyVehicles.filter(vehicle => vehicle.isAvailable());
        
        // Check vehicle status and count by state for diagnostics
        for (const vehicle of companyVehicles) {
          totalVehicles++;
          
          // Count vehicles by status
          switch(vehicle.getStatus()) {
            case 'idle': idleVehicleCount++; break;
            case 'loading': loadingVehicles++; break;
            case 'delivering': deliveringVehicles++; break;
            case 'returning': returningVehicles++; break;
            case 'unloading': unloadingVehicles++; break;
          }
          
          // Check for stuck vehicles (loading for too long)
          if (vehicle.getStatus() === 'loading' && vehicle.getLoadingTime() > 20) {
            historyLogger.addLog('vehicle', vehicle.getId(), 'stuck-loading', 
              `車輛 ${vehicle.getId()} 可能卡在裝載狀態，裝載時間過長: ${vehicle.getLoadingTime().toFixed(1)}`);
            
            // Attempt to reset stuck vehicles
            vehicle.cancelDelivery();
            historyLogger.addLog('vehicle', vehicle.getId(), 'reset-vehicle', 
              `重置處於裝載狀態的車輛 ${vehicle.getId()}`);
          }
        }
        
        // If no idle vehicles, skip to next company
        if (idleVehicles.length === 0) {
          continue;
        }
        
        historyLogger.addLog('company', company.getId(), 'vehicle-status', 
          `公司 ${company.getName()} 有 ${idleVehicles.length} 輛閒置車輛可分配任務`);
        
        // Simplify vehicle movement - just send all idle vehicles to random locations
        for (const vehicle of idleVehicles) {
          if (!vehicle.isAvailable()) continue;
          
          // Find a random map point to travel to
          const mapSize = { width: 30, height: 20 };
          const randomPoint = { 
            x: Math.floor(Math.random() * mapSize.width), 
            y: Math.floor(Math.random() * mapSize.height)
          };
          
          // Calculate a path to the random point
          const path = context.pathFinder.findPath(
            vehicle.getPosition(),
            randomPoint,
            context.roadManager
          );
          
          if (path && path.length > 0) {
            vehicle.patrol(path);
            historyLogger.addLog('vehicle', vehicle.getId(), 'patrol-assigned', 
              `分配車輛 ${vehicle.getId()} 前往隨機點 (${randomPoint.x}, ${randomPoint.y}) 巡邏`);
          } else {
            historyLogger.addLog('vehicle', vehicle.getId(), 'path-error', 
              `無法為車輛 ${vehicle.getId()} 找到前往 (${randomPoint.x}, ${randomPoint.y}) 的路徑`);
          }
        }
          
      } catch (error) {
        historyLogger.addLog('company', company.getId() || 'unknown', 'vehicle-move-error', 
          `移動公司車輛時出錯: ${error.message}`);
      }
    }
    
    // Log overall vehicle statistics every 5 seconds
    if (Math.random() < 0.05) { // ~5% chance each update cycle
      historyLogger.addLog('system', 'vehicle-stats', 'debug', 
        `車輛狀態統計 - 總數: ${totalVehicles}, 閒置: ${idleVehicleCount}, 裝載中: ${loadingVehicles}, ` +
        `配送中: ${deliveringVehicles}, 返回中: ${returningVehicles}, 卸載中: ${unloadingVehicles}`);
    }
  }

  // ... rest of the class remains the same ...
}