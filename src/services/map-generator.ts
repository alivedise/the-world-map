export class MapGenerator {
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  generate(): number[][] {
    const map: number[][] = [];
    
    // 初始化地圖，主要填充草地(0)
    for (let y = 0; y < this.height; y++) {
      map[y] = [];
      for (let x = 0; x < this.width; x++) {
        map[y][x] = 0;
      }
    }

    // 生成一些隨機的地形特徵
    this.generateTerrain(map, 1, 0.1);  // 沙地
    this.generateTerrain(map, 2, 0.25); // 水域
    this.generateTerrain(map, 3, 0.08); // 山地
    this.generateTerrain(map, 0, 0.1);
    
    return map;
  }

  private generateTerrain(map: number[][], terrainType: number, density: number) {
    const numFeatures = Math.floor(this.width * this.height * density);
    
    for (let i = 0; i < numFeatures; i++) {
      const x = Math.floor(Math.random() * this.width);
      const y = Math.floor(Math.random() * this.height);
      
      // 生成一個小區域的地形
      const size = Math.floor(Math.random() * 3) + 2; // 2-4格大小
      
      for (let dy = -size; dy <= size; dy++) {
        for (let dx = -size; dx <= size; dx++) {
          if (Math.random() < 0.4) { // 40%機率生成地形
            const newX = x + dx;
            const newY = y + dy;
            
            if (newX >= 0 && newX < this.width && 
                newY >= 0 && newY < this.height) {
              map[newY][newX] = terrainType;
            }
          }
        }
      }
    }
  }
} 