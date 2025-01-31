import { Road } from '../models/Road';
import BlockManager from './BlockManager';
import BuildingManager from './building-manager';

export default class RoadManager {
  private roads: Road[] = [];
  private blockRoads: Road[] = [];

  constructor() {

  }

  update(context: {
    blockManager: BlockManager,
    buildingManager: BuildingManager,
   }) {
    // 建立道路如果必要
    context.buildingManager.getBuildings().forEach((building) => {
      // 在建築物周圍啟用道路
      this.connectBuilding(building.getPosition());
    });

    context.blockManager.getAllBlocks().forEach((blocks) => {
      blocks.forEach((block) => {
        // 如果區塊的地形不是海洋，則建立預設道路
        if (block.getTerrainType() === 0) { // 假設 2 代表海洋
          this.buildDefaultRoads(block.getPosition());
        }
      });
    });
  }

  public addRoad(points: { x: number; y: number }[]) {
    const road = new Road(points);
    this.roads.push(road);
  }

  public findPath(start: { x: number; y: number }, end: { x: number; y: number }): Road | null {
    // 實現路徑查找邏輯
    // 這裡可以使用 A* 算法或其他路徑查找算法
    // 返回找到的路徑
    return null; // 這裡需要實現具體的查找邏輯
  }

  public connectBuilding(buildingPosition: { x: number; y: number }) {
    // 在建築物周圍建立人行道
    const points = this.getSidewalkPoints(buildingPosition);
    this.addRoad(points);
  }

  private getSidewalkPoints(buildingPosition: { x: number; y: number }): { x: number; y: number }[] {
    // 根據建築物位置計算人行道的點
    const sidewalkPoints = [
      { x: buildingPosition.x - 1, y: buildingPosition.y },
      { x: buildingPosition.x + 1, y: buildingPosition.y },
      { x: buildingPosition.x, y: buildingPosition.y - 1 },
      { x: buildingPosition.x, y: buildingPosition.y + 1 },
    ];
    return sidewalkPoints;
  }

  private buildDefaultRoads(blockPosition: { x: number; y: number }) {
    // 在區塊周圍建立預設道路
    const roadPoints = [
      { x: blockPosition.x - 1, y: blockPosition.y },
      { x: blockPosition.x + 1, y: blockPosition.y },
      { x: blockPosition.x, y: blockPosition.y - 1 },
      { x: blockPosition.x, y: blockPosition.y + 1 },
    ];
    this.addRoad(roadPoints);
  }
} 