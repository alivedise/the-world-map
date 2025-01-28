export interface TerrainConfig {
  type: number; // 地形類型
  color: string; // 對應顏色
}

export const terrainConfigs: TerrainConfig[] = [
  { type: 0, color: 'green' },  // 草地
  { type: 1, color: 'yellow' }, // 沙地
  { type: 2, color: 'blue' },   // 水域
  { type: 3, color: 'gray' }    // 山地
]; 