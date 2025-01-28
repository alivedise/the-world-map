import { terrainConfigs } from './block-config';

export class Block {
  private position: { x: number; y: number };
  private terrainType: number; // 地形類型，例如 0: 草地, 1: 沙地, 2: 水域, 3: 山地
  private resources: { [key: string]: number }; // 儲存資源，例如金錢、建材等

  constructor(x: number, y: number, terrainType: number) {
    this.position = { x, y };
    this.terrainType = terrainType;
    this.resources = {
      money: 0,
      materials: 0,
      population: 0,
    };
  }

  getPosition() {
    return this.position;
  }

  getTerrainType() {
    return this.terrainType;
  }

  getResources() {
    return this.resources;
  }

  updateResources(newResources: { [key: string]: number }) {
    for (const key in newResources) {
      if (this.resources.hasOwnProperty(key)) {
        this.resources[key] += newResources[key];
      }
    }
  }

  getTerrainColor(): string {
    const terrainConfig = terrainConfigs.find(config => config.type === this.terrainType);
    return terrainConfig ? terrainConfig.color : 'transparent'; // 默認顏色
  }
} 