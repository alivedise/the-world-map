import { BuildingType } from './building-type';
import RequirementManager from './requirement-manager';
import PlanningManager from './planning-manager';

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

export class Building {
  private type: BuildingType;
  private position: { x: number; y: number };
  private size: Size;
  private lifecycle: 'under_construction' | 'normal' | 'abandoned';
  
  constructor(config: BuildingConfig) {
    this.type = config.type;
    this.position = { x: config.x, y: config.y };
    this.size = config.size;
    this.lifecycle = 'under_construction';
  }

  update() {
    // 更新建築物的狀態
    if (this.lifecycle === 'under_construction') {
      // 假設施工時間為5秒
      this.lifecycle = 'normal'; // 假設施工完成
    }
  }

  getType(): BuildingType {
    return this.type;
  }

  getPosition(): { x: number; y: number } {
    return this.position;
  }

  getSize(): Size {
    return this.size;
  }

  getLifecycle(): string {
    return this.lifecycle;
  }
}

export default class BuildingManager {
  private buildings: Building[] = [];
  private plannedBlocks: Set<string> = new Set(); // 儲存已規劃的區塊

  addPlannedBlock(x: number, y: number) {
    this.plannedBlocks.add(`${x},${y}`);
  }

  update(deltaTime: number, context: { requirementManager: RequirementManager; planningManager: PlanningManager }) {
    // 使用 context 來獲取其他管理器的狀態
    const requirements = context.requirementManager.getRequirements();
    const plannedBlocks = context.planningManager.getPlannedBlocks();

    this.plannedBlocks.forEach(block => {
      const [x, y] = block.split(',').map(Number);
      if (!this.buildings.some(b => b.getPosition().x === x && b.getPosition().y === y)) {
        // 根據需求生成建築
        const buildingType = this.determineBuildingType(requirements); // 根據需求決定建築類型
        const building = new Building({ type: buildingType, x, y, size: { width: 2, height: 2 } });
        this.buildings.push(building);
      }
    });

    this.buildings.forEach(building => building.update());
  }

  private determineBuildingType(requirements: { [key in BuildingType]: number }): BuildingType {
    // 根據需求決定建築類型的邏輯
    return BuildingType.RESIDENTIAL; // 這裡簡化為返回住宅區
  }
}