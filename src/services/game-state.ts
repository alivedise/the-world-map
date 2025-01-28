import { MapGenerator } from './map-generator';
import PopulationManager from './population-manager';
import BuildingManager from './building-manager';
export interface GameStateConfig {
  width: number;
  height: number;
}

export class GameState {
  private mapGenerator: MapGenerator;
  private _mapData: number[][] = [];
  private _gameSpeed: number = 1;
  private _isPaused: boolean = false;
  private _gameTime: number = 0;
  private subscribers: Set<() => void> = new Set();
  private populationManager: PopulationManager;
  private buildingManager: BuildingManager;

  constructor(config: GameStateConfig) {
    this.mapGenerator = new MapGenerator(config.width, config.height);
    this.populationManager = new PopulationManager();
    this.buildingManager = new BuildingManager();
  }

  initialize() {
    this._mapData = this.mapGenerator.generate();
  }

  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  get mapData() { return this._mapData; }
  get gameSpeed() { return this._gameSpeed; }
  get isPaused() { return this._isPaused; }
  get gameTime() { return this._gameTime; }
  get population() { 
    return this.populationManager.getPopulation(); 
  }

  setGameSpeed(speed: number) {
    this._gameSpeed = speed;
    this.notifySubscribers();
  }

  setPaused(isPaused: boolean) {
    this._isPaused = isPaused;
    this.notifySubscribers();
  }

  update(deltaTime: number) {
    if (!this._isPaused) {
      this._gameTime += deltaTime * this._gameSpeed;
      this.populationManager.update(deltaTime);
      this.buildingManager.update(deltaTime);
      this.notifySubscribers();
    }
  }

  handleTileClick(x: number, y: number) {
    console.log(`點擊格子座標: x=${x}, y=${y}, 地形類型=${this._mapData[y][x]}`);
  }
} 