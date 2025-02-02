import { MapGenerator } from './map-generator';
import PopulationManager from './population-manager';
import BuildingManager from './building-manager';
import RequirementManager from './requirement-manager';
import PlanningManager from './planning-manager';
import BlockManager from './BlockManager';
import JobManager from './job-manager';
import RoadManager from './RoadManager';
import VehicleManager from './VehicleManager';
import CompanyManager from './company-manager';
import RecipeManager from './recipe-manager';

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
  private jobManager: JobManager;
  private roadManager: RoadManager;
  private config: GameStateConfig;
  private vehicleManager: VehicleManager;
  private companyManager: CompanyManager;
  private recipeManager: RecipeManager;
  constructor(config: GameStateConfig) {
    this.config = config;
    this.mapGenerator = new MapGenerator(config.width, config.height);
    this.populationManager = new PopulationManager();
    this.buildingManager = new BuildingManager();
    this.planningManager = new PlanningManager();
    this.requirementManager = new RequirementManager();
    this.jobManager = new JobManager();
    this.blockManager = new BlockManager(config.width, config.height);
    this.roadManager = new RoadManager();
    this.vehicleManager = new VehicleManager();
    this.companyManager = new CompanyManager();
    this.recipeManager = new RecipeManager();
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

  gameContext() {
    return {
      populationManager: this.populationManager,
      buildingManager: this.buildingManager,
      requirementManager: this.requirementManager,
      planningManager: this.planningManager,
      jobManager: this.jobManager,
      blockManager: this.blockManager,
      roadManager: this.roadManager,
      mapWidth: this.config.width,
      mapHeight: this.config.height,
      vehicleManager: this.vehicleManager,
      companyManager: this.companyManager,
      recipeManager: this.recipeManager,
    };
  }

  update(deltaTime: number) {
    if (!this._isPaused) {
      this._gameTime += deltaTime * this._gameSpeed;

      const context = this.gameContext();
      this.populationManager.update(deltaTime, context);
      this.buildingManager.update(deltaTime, context);
      this.requirementManager.update(deltaTime, context);
      this.planningManager.update(deltaTime);
      this.blockManager.update(deltaTime);
      this.roadManager.update(context);
      this.vehicleManager.update(context);
      this.companyManager.update(deltaTime, context);
      this.notifySubscribers();
    }
  }

  handleBlockClick(x: number, y: number) {
    console.log(`點擊格子座標: x=${x}, y=${y}, 地形類型=${this.blockManager.getBlock(x, y)?.terrainType}`);
  }
} 