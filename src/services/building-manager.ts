import { BuildingType, buildingTypeParams } from './building-type';
import RequirementManager from './requirement-manager';
import PlanningManager from './planning-manager';
import JobManager from './job-manager';
import Building from './building'; // 導入 Building 類別
import VehicleManager from './VehicleManager'; // 更正大小寫
import CompanyManager from './company-manager';

export interface BuildingConfig {
  type: BuildingType;
  x: number;
  y: number;
  size: Size;
}

export interface Size {
  width: number;
  height: number;
}

export default class BuildingManager {
  public buildings: Building[] = [];
  private plannedBlocks: Set<string> = new Set(); // 儲存已規劃的區塊

  addPlannedBlock(x: number, y: number) {
    this.plannedBlocks.add(`${x},${y}`);
  }

  getBuildings(): Building[]{
    return this.buildings;
  }

  update(deltaTime: number, context: {
    requirementManager: RequirementManager;
    planningManager: PlanningManager;
    mapWidth: number;
    mapHeight: number;
    jobManager: JobManager;
    vehicleManager: VehicleManager;
    companyManager: CompanyManager;
  }) {
    const requirements = context.requirementManager.getRequirements();
    const plannedBlocks = context.planningManager.getPlannedBlocks();

    // 如果建築物數量低於最小閾值，則生成新建築物
    const minBuildings = 15; // 最小建築物數量 - 增加了初始建築物數量要求
    const maxBuildingsPerUpdate = 5; // 每次更新最多生成的新建築物數量 - 增加了每次生成的數量
    
    if (this.buildings.length < minBuildings) {
      console.log(`建築物數量 (${this.buildings.length}) 低於閾值 ${minBuildings}，生成新建築物...`);
      this.generateRandomBuildings(
        maxBuildingsPerUpdate, 
        context.mapWidth, 
        context.mapHeight, 
        requirements, 
        context.jobManager,
        context.vehicleManager,
        context.companyManager
      );
    } else {
      // 以較高的概率隨機生成新建築
      if (Math.random() < 0.15 * deltaTime) { // 增加了生成概率
        this.generateRandomBuildings(
          1, 
          context.mapWidth, 
          context.mapHeight, 
          requirements, 
          context.jobManager,
          context.vehicleManager,
          context.companyManager
        );
      }
    }

    this.buildings.forEach(building => building.update());
  }

  private determineBuildingType(requirements: { [key in BuildingType]: number }): BuildingType {
    // 檢查是否已有住宅建築
    const hasResidential = this.buildings.some(b => b.getType() === BuildingType.RESIDENTIAL);
    
    // 如果沒有住宅建築或隨機機率30%，強制建造住宅
    if (!hasResidential || Math.random() < 0.3) {
      console.log('優先生成住宅建築');
      return BuildingType.RESIDENTIAL;
    }
    
    // 根據需求決定建築類型的邏輯
    // 計算每種建築類型的總需求權重
    const totalWeight = Object.values(requirements).reduce((sum, weight) => sum + weight, 0);
    
    if (totalWeight === 0) {
      return BuildingType.RESIDENTIAL;
    }

    // 根據需求權重隨機選擇建築類型
    let random = Math.random() * totalWeight;
    
    for (const [type, weight] of Object.entries(requirements)) {
      random -= weight;
      if (random <= 0) {
        return type as BuildingType;
      }
    }
    return BuildingType.RESIDENTIAL;
  }

  generateRandomBuildings(
    numBuildings: number, 
    mapWidth: number, 
    mapHeight: number, 
    requirements: { [key in BuildingType]: number },
    jobManager: JobManager,
    vehicleManager: VehicleManager,
    companyManager: CompanyManager,
  ) {
    console.log(`正在生成 ${numBuildings} 個建築物，需求情況:`, requirements);
    
    // 確保至少有一個非住宅建築
    let forcedNonResidential = false;
    if (
      this.buildings.length > 0 && 
      this.buildings.every(b => b.getType() === BuildingType.RESIDENTIAL) && 
      numBuildings > 0
    ) {
      forcedNonResidential = true;
      console.log('強制生成非住宅建築，因為目前全是住宅');
    }
    
    for (let i = 0; i < numBuildings; i++) {
      const width = Math.floor(Math.random() * 3) + 1;
      const height = Math.floor(Math.random() * 3) + 1;
      const x = Math.floor(Math.random() * (mapWidth - width));
      const y = Math.floor(Math.random() * (mapHeight - height));

      const isOverlapping = this.buildings.some(building => {
        const pos = building.getPosition();
        const size = building.getSize();
        return !(x + width <= pos.x || x >= pos.x + size.width || y + height <= pos.y || y >= pos.y + size.height);
      });

      if (!isOverlapping) {
        // 如果需要強制非住宅，並且這是第一個建築
        let buildingType: BuildingType;
        if (forcedNonResidential && i === 0) {
          // 從除了住宅外的建築類型中隨機選擇
          const nonResidentialTypes = Object.values(BuildingType).filter(
            type => type !== BuildingType.RESIDENTIAL
          );
          buildingType = nonResidentialTypes[Math.floor(Math.random() * nonResidentialTypes.length)];
          console.log(`強制生成非住宅建築: ${buildingType}`);
        } else {
          buildingType = this.determineBuildingType(requirements);
        }
        
        const building = new Building({ type: buildingType, x, y, size: { width, height } });
        
        // 為非住宅建築生成公司和車輛
        if (buildingType !== BuildingType.RESIDENTIAL) {
          // Create a company for this building
          const company = companyManager.createCompany(building.id, '', buildingType);
          
          // Add vehicles to the company (using company ID, not building ID)
          vehicleManager.addCompanyVehicles(company.getId(), { x, y });
          
          console.log(`生成了一個新的${buildingType}建築，公司ID: ${company.getId()}，並添加了車輛`);
        }
        
        jobManager.generateJobs(building);
        this.buildings.push(building);
        
        // Set gameState reference if available
        if (this.gameState) {
          building.gameState = this.gameState;
        }
      }
    }
  }

  addBuilding(x: number, y: number, type: BuildingType): Building {
    const width = Math.floor(Math.random() * 3) + 1;
    const height = Math.floor(Math.random() * 3) + 1;
    const building = new Building({ type, x, y, size: { width, height } });
    this.buildings.push(building);
    
    // Set gameState reference if available
    if (this.gameState) {
      building.gameState = this.gameState;
    }
    
    return building;
  }

  addRandomCommercialBuilding(x: number, y: number, companyId?: string): Building {
    const building = this.addBuilding(x, y, BuildingType.COMMERCIAL);
    if (companyId) {
      // Link building to company
      building.companyId = companyId;
    }
    return building;
  }

  getRandomBuilding(): Building | null {
    if (this.buildings.length === 0) {
      return null;
    }
    return this.buildings[Math.floor(Math.random() * this.buildings.length)];
  }

  getRandomResidentialBuilding(): Building | null {
    // 篩選出所有住宅建築
    const residentialBuildings = this.buildings.filter(building => 
      building.getType() === BuildingType.RESIDENTIAL
    );
    
    if (residentialBuildings.length === 0) {
      console.log('沒有住宅建築可用');
      return null;
    }
    
    // 從住宅建築中隨機選擇一個
    const randomIndex = Math.floor(Math.random() * residentialBuildings.length);
    return residentialBuildings[randomIndex];
  }

  getBuildingById(id: string): Building | null {
    if (!id) return null;
    return this.buildings.find(building => building.id === id) || null;
  }
}