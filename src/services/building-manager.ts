import { BuildingType, buildingTypeParams } from './building-type';
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

  getColor(): string {
    return buildingTypeParams[this.type].color;
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

  update(deltaTime: number, context: { requirementManager: RequirementManager; planningManager: PlanningManager; mapWidth: number; mapHeight: number }) {
    // 使用 context 來獲取其他管理器的狀態
    const requirements = context.requirementManager.getRequirements();
    const plannedBlocks = context.planningManager.getPlannedBlocks();

    this.generateRandomBuildings(1, context.mapWidth, context.mapHeight, requirements);

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
    requirements: { [key in BuildingType]: number }
  ) {
    for (let i = 0; i < numBuildings; i++) {
      const width = Math.floor(Math.random() * 3) + 1; // 隨機寬度 1-3
      const height = Math.floor(Math.random() * 3) + 1; // 隨機高度 1-3
      const x = Math.floor(Math.random() * (mapWidth - width));
      const y = Math.floor(Math.random() * (mapHeight - height));

      // 檢查是否有重疊
      const isOverlapping = this.buildings.some(building => {
        const pos = building.getPosition();
        const size = building.getSize();
        return !(x + width <= pos.x || x >= pos.x + size.width || y + height <= pos.y || y >= pos.y + size.height);
      });

      if (!isOverlapping) {
        const buildingType = this.determineBuildingType(requirements); // 根據需求決定建築類型
        const building = new Building({ type: buildingType, x, y, size: { width, height } });
        this.buildings.push(building);
      }
    }
  }
}