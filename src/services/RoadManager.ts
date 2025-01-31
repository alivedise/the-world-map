import { Road } from '../models/Road';
import BlockManager from './BlockManager';
import BuildingManager from './building-manager';

export default class RoadManager {
  private roads: Road[] = [];
  private blockRoads: Road[] = [];
  private built: boolean;

  constructor() {
    this.built = false;
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

    if (this.built) {
      return;
    }
    this.built = true;

    context.blockManager.getAllBlocks().forEach((blocks) => {
      blocks.forEach((block) => {
        // 如果區塊的地形是草地，則建立預設道路
        if (block.getTerrainType() === 0) {
          this.buildDefaultRoads(block.getPosition());
        }
      });
    });
  }

  public addRoad(points: { x: number; y: number }[]) {
    // 檢查道路是否已存在
    if (!this.roadExists(points)) {
      const road = new Road(points);
      this.roads.push(road);
    }
  }

  private roadExists(points: { x: number; y: number }[]): boolean {
    return this.roads.some(road => 
      road.getPoints().length === points.length && 
      road.getPoints().every((point, index) => 
        point.x === points[index].x && point.y === points[index].y
      )
    );
  }

  public findPath(start: { x: number; y: number }, end: { x: number; y: number }): { x: number; y: number }[] | null {
    // 簡單的 BFS 路徑查找邏輯
    const queue: { x: number; y: number }[] = [start];
    const visited: Set<string> = new Set();
    const parent: { [key: string]: { x: number; y: number } } = {};
    const directions = [
        { x: 0, y: 1 },  // 下
        { x: 1, y: 0 },  // 右
        { x: 0, y: -1 }, // 上
        { x: -1, y: 0 }, // 左
    ];

    while (queue.length > 0) {
        const current = queue.shift()!;
        const key = `${current.x},${current.y}`;
        if (visited.has(key)) continue;
        visited.add(key);

        if (current.x === end.x && current.y === end.y) {
            // 回溯路徑
            const path: { x: number; y: number }[] = [];
            let step = current;
            while (step) {
                path.push(step);
                step = parent[`${step.x},${step.y}`];
            }
            return path.reverse();
        }

        for (const dir of directions) {
            const next = { x: current.x + dir.x, y: current.y + dir.y };
            if (this.isValidPosition(next) && !visited.has(`${next.x},${next.y}`)) {
                queue.push(next);
                parent[`${next.x},${next.y}`] = current;
            }
        }
    }
    return null; // 找不到路徑
  }

  private isValidPosition(pos: { x: number; y: number }): boolean {
    // 檢查位置是否有效，這裡可以根據需要進行擴展
    return this.roads.some(road => 
        road.getPoints().some(point => point.x === pos.x && point.y === pos.y)
    );
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