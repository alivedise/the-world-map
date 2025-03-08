import { GameState } from "./game-state";
import { WorldState } from '../models/WorldState';
import { HistoryLogger } from './history-logger';
import { GameLoop } from './game-loop';

export class WorldSimulation {
  private static instance: WorldSimulation;
  private gameState: GameState;
  private gameLoop: GameLoop;
  private updateInterval: number;
  private lastFrameTimestamp: number;
  private secondsPerDay: number;
  private worldTime: number;
  private subscribers: any[];
  private isRunning: boolean;

  private constructor() {
    this.gameState = new GameState({ width: 30, height: 20 });
    this.updateInterval = 500; // 每 500 毫秒更新一次，減慢更新頻率
    this.lastFrameTimestamp = 0;
    this.secondsPerDay = 60; // 真實的一天時間壓縮到 1 分鐘
    this.worldTime = 0; // 從 0 開始計時，單位為"天"
    this.subscribers = [];
    this.isRunning = false;
    this.gameLoop = new GameLoop((deltaTime) => {
      this.gameUpdate(deltaTime);
    });
    
    // 記錄系統啟動
    const historyLogger = HistoryLogger.getInstance();
    historyLogger.addLog('system', 'simulation', 'start', '世界模擬開始運行');
    
    // 創建 GameLoop 並將 update 方法綁定到當前實例
  }

  static getInstance(): WorldSimulation {
    if (!WorldSimulation.instance) {
      WorldSimulation.instance = new WorldSimulation();
      window.wsi = WorldSimulation.instance;
    }
    return WorldSimulation.instance;
  }

  // 代理所有需要的 GameState 屬性
  get population() { return this.gameState.population; }
  get building() { return this.getBuildings().length; }
  get gameSpeed() { return this.gameState.gameSpeed; }
  get isPaused() { return this.gameState.isPaused; }
  get gameTime() { return this.gameState.gameTime; }

  // 新增公開方法獲取必要的管理器數據
  get blockManager() { return this.gameState.getBlockManager(); }
  get buildingManager() { return this.gameState.getBuildingManager(); }
  get populationManager() { return this.gameState.getPopulationManager(); }
  get vehicleManager() { return this.gameState.getVehicleManager(); }
  get companyManager() { return this.gameState.getCompanyManager(); }

  // 新增更具體的方法用於組件使用
  getBlocks() { return this.gameState.getBlockManager().getAllBlocks(); }
  getBuildings() { return this.gameState.getBuildingManager().getBuildings(); }
  getCitizens() { return this.gameState.getPopulationManager().getCitizens(); }
  getVehicles() { return this.gameState.getVehicleManager().getAllVehicles(); }
  getCompanies() { return this.gameState.getCompanyManager().getCompanies(); }

  // 代理訂閱機制
  subscribe(callback: () => void) {
    return this.gameState.subscribe(callback);
  }

  initialize() {
    this.gameState.initialize();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTimestamp = performance.now();
    // 啟動 GameLoop
    this.gameLoop.start();
  }

  stop() {
    this.gameLoop.stop();
  }

  setGameSpeed(speed: number) {
    this.gameState.setGameSpeed(speed);
  }

  setPaused(isPaused: boolean) {
    this.gameState.setPaused(isPaused);
  }

  handleBlockClick(x: number, y: number) {
    this.gameState.handleBlockClick(x, y);
  }

  // 原本的 update 方法，接收 currentTime 參數
  private updateWithTimestamp(currentTime: number) {
    const deltaTime = currentTime - this.lastFrameTimestamp;
    
    // 每隔 5 秒記錄系統狀態
    if (Math.floor(currentTime / 5000) > Math.floor(this.lastFrameTimestamp / 5000)) {
      const historyLogger = HistoryLogger.getInstance();
      
      // 記錄 FPS
      const fps = deltaTime > 0 ? Math.round(1000 / deltaTime) : 0;
      historyLogger.addLog(
        'system', 
        'performance', 
        'stats', 
        `FPS: ${fps}, deltaTime: ${deltaTime.toFixed(2)}ms, 市民數量: ${this.gameState.populationManager.citizens.length}`
      );
      
      // 檢查市民移動狀態
      const movingCitizens = this.gameState.populationManager.citizens.filter(c => c.path !== null).length;
      historyLogger.addLog(
        'system', 
        'citizens', 
        'movement-stats', 
        `移動中的市民數量: ${movingCitizens}/${this.gameState.populationManager.citizens.length}`
      );
      
      // 檢查車輛移動狀態
      const movingVehicles = this.gameState.vehicleManager.getMovingVehicles().length;
      historyLogger.addLog(
        'system', 
        'vehicles', 
        'movement-stats', 
        `移動中的車輛數量: ${movingVehicles}/${this.gameState.vehicleManager.getAllVehicles().length}`
      );
    }
    
    this.gameState.update({
      deltaTime,
      currentTime,
      worldTime: this.worldTime,
      secondsPerDay: this.secondsPerDay
    });
    
    // 真實時間轉換為遊戲時間（天）
    const secondsElapsed = deltaTime / 1000; // 轉換為秒
    const daysElapsed = secondsElapsed / this.secondsPerDay;
    this.worldTime += daysElapsed;
    
    this.lastFrameTimestamp = currentTime;
    
    this.notifySubscribers();
  }
  
  // GameLoop 使用的 update 方法，接收 deltaTime 參數
  gameUpdate(deltaTime: number) {
    const currentTime = performance.now();
    
    // 使用 currentTime 和固定的 deltaTime 調用主要更新方法
    this.gameState.populationManager.update({
      buildingManager: this.gameState.buildingManager,
      roadManager: this.gameState.roadManager,
      companyManager: this.gameState.companyManager,
      deltaTime: deltaTime
    });
    
    this.gameState.update({
      deltaTime,
      currentTime,
      worldTime: this.worldTime,
      secondsPerDay: this.secondsPerDay
    });
    
    // 每隔 5 秒記錄系統狀態
    const fiveSecondInterval = 5000;
    if (Math.floor(currentTime / fiveSecondInterval) > Math.floor(this.lastFrameTimestamp / fiveSecondInterval)) {
      const historyLogger = HistoryLogger.getInstance();
      
      // 記錄 FPS
      const fps = Math.round(1000 / deltaTime);
      historyLogger.addLog(
        'system', 
        'performance', 
        'stats', 
        `FPS: ${fps}, deltaTime: ${deltaTime.toFixed(2)}ms, 市民數量: ${this.gameState.populationManager.citizens.length}`
      );
      
      // 檢查市民移動狀態
      const movingCitizens = this.gameState.populationManager.citizens.filter(c => c.path !== null).length;
      historyLogger.addLog(
        'system', 
        'citizens', 
        'movement-stats', 
        `移動中的市民數量: ${movingCitizens}/${this.gameState.populationManager.citizens.length}`
      );
      
      // 檢查車輛移動狀態
      const movingVehicles = this.gameState.vehicleManager.getMovingVehicles().length;
      historyLogger.addLog(
        'system', 
        'vehicles', 
        'movement-stats', 
        `移動中的車輛數量: ${movingVehicles}/${this.gameState.vehicleManager.getAllVehicles().length}`
      );
    }
    
    // 真實時間轉換為遊戲時間（天）
    const secondsElapsed = deltaTime / 1000; // 轉換為秒
    const daysElapsed = secondsElapsed / this.secondsPerDay;
    this.worldTime += daysElapsed;
    
    this.lastFrameTimestamp = currentTime;
  }
  
  // 原始的簡單 update 方法，保留與舊代碼的兼容性
  update(deltaTime: number) {
    this.gameState.update({
      deltaTime,
      currentTime: performance.now(),
      worldTime: this.worldTime,
      secondsPerDay: this.secondsPerDay
    });
  }
  
  /**
   * 通知所有訂閱者世界狀態已更新
   * @private
   */
  private notifySubscribers() {
    const worldState: WorldState = {
      time: this.worldTime,
      population: this.gameState.getPopulationManager().getPopulation(),
      buildings: this.gameState.getBuildingManager().getBuildings()
    };
    
    // 通知所有訂閱者
    this.subscribers.forEach(callback => {
      try {
        callback(worldState);
      } catch (error) {
        console.error('訂閱者回調執行出錯:', error);
      }
    });
  }
}