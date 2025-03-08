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
import TransportationService from './transportation-service';

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
  private transportationService: TransportationService;
  private _lastVehicleCheck: number | null = null;

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
    this.companyManager = new CompanyManager(this.buildingManager, this.roadManager);
    this.recipeManager = new RecipeManager();
    this.jobManager.setCompanyManager(this.companyManager);
    // 初始化運輸服務
    this.transportationService = new TransportationService(
      this.vehicleManager,
      this.companyManager,
      this.roadManager,
      this.buildingManager
    );
  }

  initialize() {
    const mapData = this.mapGenerator.generate();
    this.blockManager.setMapData(mapData);
    
    // 初始化建築物
    // 生成 10 個初始建築物
    console.log('生成初始建築物...');
    this.buildingManager.generateRandomBuildings(
      10, 
      this.config.width, 
      this.config.height, 
      this.requirementManager.getRequirements(),
      this.jobManager,
      this.vehicleManager,
      this.companyManager
    );
    
    // 初始化道路
    // TODO: 生成基本道路網絡
    
    console.log(`初始化完成，生成了 ${this.buildingManager.getBuildings().length} 個建築物`);
    
    // 確保所有公司都有分配車輛
    const companies = this.companyManager.getCompanies();
    const fixedCount = this.vehicleManager.ensureCompaniesHaveVehicles(companies);
    console.log(`已檢查並為 ${fixedCount} 家公司補充了缺失的車輛`);
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

  // 修正: 使用普通方法取代getter
  getBlockManager() { return this.blockManager; }
  getBuildingManager() { return this.buildingManager; }
  getPopulationManager() { return this.populationManager; }
  getVehicleManager() { return this.vehicleManager; }
  getCompanyManager() { return this.companyManager; }
  getRecipeManager() { return this.recipeManager; }
  getTransportationService() { return this.transportationService; }

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
    if (this._isPaused) return;
    
    const adjustedDeltaTime = deltaTime * this._gameSpeed;
    this._gameTime += adjustedDeltaTime;
    
    const currentTime = Date.now();
    
    // 更新需求管理器
    this.requirementManager.update(adjustedDeltaTime, {
      populationManager: this.populationManager,
      buildingManager: this.buildingManager,
      planningManager: this.planningManager
    });
    
    // 更新公司管理器
    this.companyManager.update(adjustedDeltaTime, {
      vehicleManager: this.vehicleManager,
      recipeManager: this.recipeManager,
      buildingManager: this.buildingManager,
      jobManager: this.jobManager,
      residentialManager: null,
      currentTime: currentTime,
      citizens: this.populationManager.getCitizens(),
      map: this.blockManager.getMap(), // Use blockManager for map
      pathFinder: this.roadManager, // Use roadManager as pathFinder
      roadManager: this.roadManager
    });
    
    // 每5分鐘檢查一次公司是否都有分配車輛
    const vehicleCheckInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
    if (currentTime - (this._lastVehicleCheck || 0) > vehicleCheckInterval) {
      this._lastVehicleCheck = currentTime;
      
      // 確保所有公司都有分配車輛
      const companies = this.companyManager.getCompanies();
      this.vehicleManager.ensureCompaniesHaveVehicles(companies);
    }
    
    // 更新建築管理器
    this.buildingManager.update(adjustedDeltaTime, {
      requirementManager: this.requirementManager,
      planningManager: this.planningManager,
      mapWidth: this.config.width,
      mapHeight: this.config.height,
      jobManager: this.jobManager,
      vehicleManager: this.vehicleManager,
      companyManager: this.companyManager
    });
    
    // 處理人口更新
    this.populationManager.update({
      buildingManager: this.buildingManager,
      roadManager: this.roadManager,
      deltaTime: adjustedDeltaTime
    });
    
    // 更新車輛和公司
    this.vehicleManager.update({ 
      roadManager: this.roadManager,
      deltaTime: adjustedDeltaTime
    });
    
    // 更新運輸服務
    this.transportationService.update(adjustedDeltaTime, currentTime);
    
    this.notifySubscribers();
  }

  handleBlockClick(x: number, y: number) {
    console.log(`點擊格子座標: x=${x}, y=${y}, 地形類型=${this.blockManager.getBlock(x, y)?.terrainType}`);
  }
}