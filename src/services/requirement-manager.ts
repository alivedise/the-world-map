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
    const buildings = context.buildingManager.buildings;

    // 根據人口數量和建築數量計算需求
    // 以住宅區來說 人口/住宅區比例越高 需求越高 最高為100
    // 有公園類建築會吸引人口
    // 有工作需求會吸引人口移入
    // 如果需求值為-1,則生成0-100之間的隨機值
    // 否則在上次的值基礎上隨機增減2以內的變化
    Object.keys(this.requirements).forEach(type => {
      if (this.requirements[type as BuildingType] === -1) {
        this.requirements[type as BuildingType] = Math.floor(Math.random() * 100);
      }
    });
    
    /*
    this.requirements[BuildingType.RESIDENTIAL] = Math.max(0, Math.floor(population / 2) - buildings.filter(b => b.getType() === BuildingType.RESIDENTIAL).length);
    this.requirements[BuildingType.COMMERCIAL] = Math.max(0, Math.floor(population / 3) - buildings.filter(b => b.getType() === BuildingType.COMMERCIAL).length);
    this.requirements[BuildingType.INDUSTRIAL] = Math.max(0, Math.floor(population / 4) - buildings.filter(b => b.getType() === BuildingType.INDUSTRIAL).length);
    this.requirements[BuildingType.OFFICE] = Math.max(0, Math.floor(population / 5) - buildings.filter(b => b.getType() === BuildingType.OFFICE).length);
    */
  }

  getRequirements(): { [key in BuildingType]: number } {
    return this.requirements;
  }
}