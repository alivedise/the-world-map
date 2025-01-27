import { MapGenerator } from './map-generator';

export interface WorldState {
  mapData: number[][];
  gameTime: number;
  isPaused: boolean;
  speed: number;
}

export class WorldSimulation {
  private mapGenerator: MapGenerator;
  private state: WorldState;
  private subscribers: ((state: WorldState) => void)[] = [];

  constructor(width: number, height: number) {
    this.mapGenerator = new MapGenerator(width, height);
    this.state = {
      mapData: [],
      gameTime: 0,
      isPaused: false,
      speed: 1
    };
    this.init();
  }

  private init() {
    this.state.mapData = this.mapGenerator.generate();
  }

  subscribe(callback: (state: WorldState) => void) {
    this.subscribers.push(callback);
    // 立即發送當前狀態
    callback({ ...this.state });
    // 返回取消訂閱的函數
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback({ ...this.state }));
  }

  update(deltaTime: number) {
    if (this.state.isPaused) return;

    const adjustedDelta = deltaTime * this.state.speed;
    this.state.gameTime += adjustedDelta;

    // 在這裡添加世界模擬邏輯
    // 例如：更新地形、生成事件等

    this.notifySubscribers();
  }

  setPaused(isPaused: boolean) {
    this.state.isPaused = isPaused;
    this.notifySubscribers();
  }

  setSpeed(speed: number) {
    this.state.speed = speed;
    this.notifySubscribers();
  }

  // 提供一個方法來獲取當前狀態的副本
  getState(): WorldState {
    return { ...this.state };
  }
} 