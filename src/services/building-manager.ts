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

export enum BuildingType {
  HOUSE = 'house',
  SHOP = 'shop',
  FACTORY = 'factory'
}

export class Building {
  private type: BuildingType;
  private x: number;
  private y: number;
  private size: Size;
  private constructionProgress: number = 0;
  private isComplete: boolean = false;

  constructor(config: BuildingConfig) {
    this.type = config.type;
    this.x = config.x;
    this.y = config.y;
    this.size = config.size;
  }

  update(deltaTime: number) {
    if (!this.isComplete) {
      this.constructionProgress += deltaTime;
      if (this.constructionProgress >= this.getConstructionTime()) {
        this.isComplete = true;
      }
    }
  }

  private getConstructionTime(): number {
    switch (this.type) {
      case BuildingType.HOUSE:
        return 10; // 10秒
      case BuildingType.SHOP:
        return 20; // 20秒
      case BuildingType.FACTORY:
        return 30; // 30秒
    }
  }

  getType(): BuildingType {
    return this.type;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  getSize(): Size {
    return this.size;
  }

  isConstructionComplete(): boolean {
    return this.isComplete;
  }

  getConstructionProgress(): number {
    return this.constructionProgress / this.getConstructionTime();
  }
}

export default class BuildingManager {
  private buildings: Building[];

  constructor() {
    this.buildings = [];
  }

  addBuilding(config: BuildingConfig): boolean {
    // 檢查是否可以在指定位置建造
    if (this.canBuildAt(config)) {
      const building = new Building(config);
      this.buildings.push(building);
      return true;
    }
    return false;
  }

  private canBuildAt(config: BuildingConfig): boolean {
    // 檢查是否與其他建築物重疊
    for (const building of this.buildings) {
      if (this.isOverlapping(building, config)) {
        return false;
      }
    }
    return true;
  }

  private isOverlapping(building: Building, newConfig: BuildingConfig): boolean {
    const pos1 = building.getPosition();
    const size1 = building.getSize();
    const pos2 = { x: newConfig.x, y: newConfig.y };
    const size2 = newConfig.size;

    return !(pos1.x + size1.width <= pos2.x ||
             pos2.x + size2.width <= pos1.x ||
             pos1.y + size1.height <= pos2.y ||
             pos2.y + size2.height <= pos1.y);
  }

  update(deltaTime: number) {
    this.buildings.forEach(building => building.update(deltaTime));
  }

  getBuildingsAt(x: number, y: number): Building[] {
    return this.buildings.filter(building => {
      const pos = building.getPosition();
      const size = building.getSize();
      return x >= pos.x && x < pos.x + size.width &&
             y >= pos.y && y < pos.y + size.height;
    });
  }

  getAllBuildings(): Building[] {
    return [...this.buildings];
  }

  removeBuilding(x: number, y: number): boolean {
    const index = this.buildings.findIndex(building => {
      const pos = building.getPosition();
      return pos.x === x && pos.y === y;
    });

    if (index !== -1) {
      this.buildings.splice(index, 1);
      return true;
    }
    return false;
  }
}