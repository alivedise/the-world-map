import { Road } from '../models/Road';
import BlockManager from './BlockManager';
import BuildingManager from './building-manager';
import { HistoryLogger } from './history-logger';

interface Node {
  x: number;
  y: number;
  f?: number;
}

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

  // Implementation of PathFinder interface for compatibility
  findPath(startParam: number | { x: number, y: number }, endXorEnd: number | { x: number, y: number }, endY?: number, unused?: number): { x: number, y: number }[] | null {
    // Handle both method signatures
    if (typeof startParam === 'number' && typeof endXorEnd === 'number' && typeof endY === 'number') {
      // First signature: findPath(startX, startY, endX, endY)
      return this.findPathImpl({ x: startParam, y: endXorEnd }, { x: endY, y: unused });
    } else if (typeof startParam === 'object' && typeof endXorEnd === 'object') {
      // Second signature: findPath(start, end)
      return this.findPathImpl(startParam, endXorEnd);
    }
    
    const historyLogger = HistoryLogger.getInstance();
    historyLogger.addLog('system', 'road-manager', 'path-error', 
      `無效的findPath參數: ${JSON.stringify(startParam)}, ${JSON.stringify(endXorEnd)}, ${endY}, ${unused}`);
    return null;
  }
  
  // The actual implementation of path finding
  private findPathImpl(start: any, end: any): { x: number; y: number }[] | null {
    const historyLogger = HistoryLogger.getInstance();
    
    try {
      // Check if start and end are valid points
      if (!start || !end) {
        historyLogger.addLog('system', 'road-manager', 'path-error', 
          `無效的起點或終點，無法計算路徑`);
        return null;
      }
      
      // Make sure start and end have x and y properties
      const startPoint = { 
        x: typeof start.x === 'number' ? Math.floor(start.x) : 0, 
        y: typeof start.y === 'number' ? Math.floor(start.y) : 0 
      };
      
      const endPoint = { 
        x: typeof end.x === 'number' ? Math.floor(end.x) : 0, 
        y: typeof end.y === 'number' ? Math.floor(end.y) : 0 
      };
      
      // Verify the points
      if (isNaN(startPoint.x) || isNaN(startPoint.y) || 
          isNaN(endPoint.x) || isNaN(endPoint.y)) {
        historyLogger.addLog('system', 'road-manager', 'path-error', 
          `無效的座標值: 起點(${startPoint.x},${startPoint.y}) 終點(${endPoint.x},${endPoint.y})`);
        return null;
      }
      
      // Log path finding attempt
      historyLogger.addLog('system', 'road-manager', 'findPath', 
        `搜尋路徑從 (${startPoint.x}, ${startPoint.y}) 到 (${endPoint.x}, ${endPoint.y})`);
      
      // Get map dimensions
      const mapWidth = this.getMapWidth();
      const mapHeight = this.getMapHeight();
      
      // Make sure the coordinates are within map bounds
      const boundedStartPoint = {
        x: Math.max(0, Math.min(mapWidth - 1, startPoint.x)),
        y: Math.max(0, Math.min(mapHeight - 1, startPoint.y))
      };
      
      const boundedEndPoint = {
        x: Math.max(0, Math.min(mapWidth - 1, endPoint.x)),
        y: Math.max(0, Math.min(mapHeight - 1, endPoint.y))
      };
      
      // For simple implementation, return a path with intermediate points
      const directPath = [
        { x: boundedStartPoint.x, y: boundedStartPoint.y }
      ];
      
      // Add intermediate points if the distance is significant
      const distance = Math.sqrt(
        Math.pow(boundedEndPoint.x - boundedStartPoint.x, 2) + 
        Math.pow(boundedEndPoint.y - boundedStartPoint.y, 2)
      );
      
      if (distance > 5) {
        // Add intermediate points for smoother movement
        directPath.push({ x: boundedStartPoint.x, y: boundedEndPoint.y });
      }
      
      // Add endpoint
      if (directPath[directPath.length - 1].x !== boundedEndPoint.x || 
          directPath[directPath.length - 1].y !== boundedEndPoint.y) {
        directPath.push({ x: boundedEndPoint.x, y: boundedEndPoint.y });
      }
      
      historyLogger.addLog('system', 'road-manager', 'direct-path', 
        `路徑已生成: ${directPath.length} 個點，路徑: ${directPath.map(p => `(${p.x},${p.y})`).join(' -> ')}`);
      
      return directPath;
    } catch (error) {
      historyLogger.addLog('system', 'road-manager', 'path-error', 
        `路徑計算出錯: ${error.message}`);
      return null;
    }
  }

  private isValidPosition(pos: { x: number; y: number }): boolean {
    // 檢查位置是否有效，這裡可以根據需要進行擴展
    return this.roads.some(road => 
        road.getPoints().some(point => point.x === pos.x && point.y === pos.y)
    );
  }

  private heuristic(node: { x: number; y: number }, endNode: { x: number; y: number }): number {
    return Math.abs(node.x - endNode.x) + Math.abs(node.y - endNode.y);
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

  // Helper methods for map dimensions
  private getMapWidth(): number {
    return 50; // Default width if not available
  }
  
  private getMapHeight(): number {
    return 50; // Default height if not available
  }
} 