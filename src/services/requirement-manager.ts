import { BuildingType } from './building-type';

export default class RequirementManager {
  private requirements: { [key in BuildingType]: number } = {
    [BuildingType.RESIDENTIAL]: 0,
    [BuildingType.COMMERCIAL]: 0,
    [BuildingType.INDUSTRIAL]: 0,
    [BuildingType.OFFICE]: 0
  };

  update(deltaTime: number) {

  }

  updateRequirements() {
    // 更新需求的邏輯
    this.requirements[BuildingType.RESIDENTIAL] += Math.random() > 0.5 ? 1 : 0; // 隨機增加需求
    this.requirements[BuildingType.COMMERCIAL] += Math.random() > 0.5 ? 1 : 0;
    this.requirements[BuildingType.INDUSTRIAL] += Math.random() > 0.5 ? 1 : 0;
    this.requirements[BuildingType.OFFICE] += Math.random() > 0.5 ? 1 : 0;
  }

  getRequirements(): { [key in BuildingType]: number } {
    return this.requirements;
  }
}