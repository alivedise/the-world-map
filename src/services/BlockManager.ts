import { Block } from './Block';

export default class BlockManager {
  private blocks: Block[][];

  constructor(width: number, height: number) {
    this.blocks = Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => new Block(x, y, 0)) // 初始化為草地
    );
  }

  setMapData(mapData: number[][]) {
    for (let y = 0; y < mapData.length; y++) {
      for (let x = 0; x < mapData[y].length; x++) {
        this.setBlockTerrain(x, y, mapData[y][x]);
      }
    }
  }

  update(deltaTime: number) {
    
  }

  setBlockTerrain(x: number, y: number, terrainType: number) {
    if (this.isValidPosition(x, y)) {
      this.blocks[y][x] = new Block(x, y, terrainType);
    }
  }

  getBlock(x: number, y: number): Block | null {
    if (this.isValidPosition(x, y)) {
      return this.blocks[y][x];
    }
    return null;
  }

  getAllBlocks(): Block[][] {
    return this.blocks;
  }

  private isValidPosition(x: number, y: number): boolean {
    return y >= 0 && y < this.blocks.length && x >= 0 && x < this.blocks[0].length;
  }

  // Return a map object with width and height for compatibility with WorldMap
  getMap() {
    return {
      getMapSize: () => ({
        width: this.blocks[0].length,
        height: this.blocks.length
      })
    };
  }
} 