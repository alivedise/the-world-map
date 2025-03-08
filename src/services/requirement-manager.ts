import { BuildingType } from './building-type';
import PlanningManager from './planning-manager';
import PopulationManager from './population-manager';
import BuildingManager from './building-manager';

export default class RequirementManager {
  private requirements: { [key in BuildingType]: number } = {
    [BuildingType.RESIDENTIAL]: -1,
    [BuildingType.COMMERCIAL]: -1,
    [BuildingType.INDUSTRIAL]: -1,
    [BuildingType.OFFICE]: -1
  };

  update(deltaTime: number, context: {
    populationManager: PopulationManager;
    buildingManager: BuildingManager;
    planningManager: PlanningManager;
  }) {
    const population = context.populationManager.getPopulation();
    const buildings = context.buildingManager.getBuildings(); // 使用 getter 方法
    
    // 初始化需求值（如果是第一次）
    Object.keys(this.requirements).forEach(type => {
      if (this.requirements[type as BuildingType] === -1) {
        this.requirements[type as BuildingType] = 25; // 給每種類型相同的初始需求
      }
    });
    
    // 基於人口和現有建築數量計算每種類型的實際需求
    const residentialBuildings = buildings.filter(b => b.getType() === BuildingType.RESIDENTIAL).length;
    const commercialBuildings = buildings.filter(b => b.getType() === BuildingType.COMMERCIAL).length;
    const industrialBuildings = buildings.filter(b => b.getType() === BuildingType.INDUSTRIAL).length;
    const officeBuildings = buildings.filter(b => b.getType() === BuildingType.OFFICE).length;
    
    // 計算每種類型的需求
    this.requirements[BuildingType.RESIDENTIAL] = Math.max(10, Math.floor(population / 2) - residentialBuildings * 5);
    this.requirements[BuildingType.COMMERCIAL] = Math.max(20, Math.floor(population / 3) - commercialBuildings * 5);
    this.requirements[BuildingType.INDUSTRIAL] = Math.max(15, Math.floor(population / 4) - industrialBuildings * 5);
    this.requirements[BuildingType.OFFICE] = Math.max(15, Math.floor(population / 5) - officeBuildings * 5);
    
    console.log('更新建築需求:', this.requirements);
  }

  getRequirements(): { [key in BuildingType]: number } {
    return this.requirements;
  }
}