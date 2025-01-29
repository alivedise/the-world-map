import { MapGenerator } from './map-generator';
import PopulationManager from './population-manager';
import BuildingManager from './building-manager';
import RequirementManager from './requirement-manager';
import PlanningManager from './planning-manager';
import BlockManager from './BlockManager';

export interface GameStateConfig {
  width: number;
  height: number;
}

export class GameState {
  private mapGenerator: MapGenerator;
  private _gameSpeed: number = 1;
  private _isPaused: boolean = false;
  private _gameTime: number = 0;
  private subscribers: Set<() => void> = new Set();
  private populationManager: PopulationManager;
  private buildingManager: BuildingManager;
  private planningManager: PlanningManager;
  private requirementManager: RequirementManager;
  private blockManager: BlockManager;
  private config: GameStateConfig;

  constructor(config: GameStateConfig) {
    this.config = config;
    this.mapGenerator = new MapGenerator(config.width, config.height);
    this.populationManager = new PopulationManager();
    this.buildingManager = new BuildingManager();
    this.planningManager = new PlanningManager();
    this.requirementManager = new RequirementManager();
    this.blockManager = new BlockManager(config.width, config.height);
  }

  initialize() {
    const mapData = this.mapGenerator.generate();
    this.blockManager.setMapData(mapData);
  }

  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

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

  getContext() {
    return {
      population: this.populationManager,
      building: this.buildingManager,
    }
  }

  update(deltaTime: number) {
    if (!this._isPaused) {
      this._gameTime += deltaTime * this._gameSpeed;

      this.populationManager.update(deltaTime, {
        buildingManager: this.buildingManager,
      });
      this.buildingManager.update(deltaTime, {
        requirementManager: this.requirementManager,
        planningManager: this.planningManager,
        mapWidth: this.config.width,
        mapHeight: this.config.height,
      });
      this.requirementManager.update(deltaTime, {
        buildingManager: this.buildingManager,
        populationManager: this.populationManager,
        planningManager: this.planningManager,
      });
      this.planningManager.update(deltaTime);
      this.blockManager.update(deltaTime);
      this.notifySubscribers();
    }
  }

  handleBlockClick(x: number, y: number) {
    console.log(`點擊格子座標: x=${x}, y=${y}, 地形類型=${this.blockManager.getBlock(x, y)?.terrainType}`);
  }
} 