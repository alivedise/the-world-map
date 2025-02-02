import { BuildingType, buildingTypeParams } from './building-type';
import RequirementManager from './requirement-manager';
import PlanningManager from './planning-manager';
import JobManager from './job-manager';
import Building from './building'; // 導入 Building 類別
import VehicleManager from './vehicle-manager';
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
  private buildings: Building[] = [];
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

    this.generateRandomBuildings(
      1, 
      context.mapWidth, 
      context.mapHeight, 
      requirements, 
      context.jobManager,
      context.vehicleManager,
      context.companyManager
    );

    this.buildings.forEach(building => building.update());
  }

  private determineBuildingType(requirements: { [key in BuildingType]: number }): BuildingType {
    // 根據需求決定建築類型的邏輯
    // XXX: 隨機決定建築類型
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
        const buildingType = this.determineBuildingType(requirements);
        const building = new Building({ type: buildingType, x, y, size: { width, height } });
        
        // 為非住宅建築生成車輛
        if (buildingType !== BuildingType.RESIDENTIAL) {
          companyManager.introduceCompany(building);
          vehicleManager.addCompanyVehicles(building.id, { x, y });
        }
        
        jobManager.generateJobs(building);
        this.buildings.push(building);
      }
    }
  }

  getRandomResidentialBuilding(): Building | undefined {
    const residentialBuildings = this.buildings.filter(building => building.getType() === BuildingType.RESIDENTIAL);
    if (residentialBuildings.length === 0) return undefined;
    return residentialBuildings[Math.floor(Math.random() * residentialBuildings.length)];
  }
}