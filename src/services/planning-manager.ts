import { BuildingType } from './building-type';

interface PlannedBlock {
  virtualBlockId: string; // 虛擬區塊的唯一識別碼
  buildingType: BuildingType; // 規劃的建築類型
  actualBlocks: { x: number; y: number }[]; // 對應的實體區塊
}

export default class PlanningManager {
  private plannedBlocks: PlannedBlock[] = [];

  addPlannedBlock(virtualBlockId: string, buildingType: BuildingType, actualBlocks: { x: number; y: number }[]) {
    const plannedBlock: PlannedBlock = {
      virtualBlockId,
      buildingType,
      actualBlocks
    };
    this.plannedBlocks.push(plannedBlock);
  }

  update(deltaTime: number) {}

  getPlannedBlocks(): PlannedBlock[] {
    return this.plannedBlocks;
  }

  updatePlannedBlocks() {
    // 在這裡可以添加更新邏輯，例如根據需求來調整規劃
    this.plannedBlocks.forEach(block => {
      // 根據需求或其他條件更新規劃
    });
  }

  clearPlannedBlocks() {
    this.plannedBlocks = [];
  }
} 