import Citizen from "../models/Citizen";
import BuildingManager from "../services/building-manager";
import JobManager from '../services/job-manager';
import RoadManager from '../services/road-manager';
import CompanyManager from './company-manager';
import { HistoryLogger } from './history-logger';

export default class PopulationManager {
  private citizens: Citizen[] = [];

  private population: number;
  private currentTime: number;
  constructor() {
    this.population = 0;
    this.currentTime = 0;
  }


  addCitizen(citizen: Citizen) {
    this.citizens.push(citizen);
  }

  removeCitizen(name: string) {
    this.citizens = this.citizens.filter(citizen => citizen.name !== name);
  }

  getCitizens(): Citizen[] {
    return this.citizens;
  }

  getCitizenByName(name: string): Citizen | undefined {
    return this.citizens.find(citizen => citizen.name === name);
  }

  update(context: { buildingManager: BuildingManager; roadManager: RoadManager; companyManager: CompanyManager; deltaTime?: number }) {
    const buildings = context.buildingManager.buildings;
    this.currentTime += context.deltaTime || 1;
    
    // 控制人口生成 - 只有當時間累積超過10秒，且人口少於60時才生成新市民
    const populationCap = 60; // 人口上限
    const generationInterval = 10; // 生成間隔（秒）
    
    // 如果已達到人口上限，不再生成
    if (this.citizens.length >= populationCap) {
      // 記錄達到人口上限
      if (this.currentTime > generationInterval) {
        this.currentTime = 0;
        const historyLogger = HistoryLogger.getInstance();
        historyLogger.addLog('system', 'population', 'cap', 
          `已達到人口上限 (${this.citizens.length}/${populationCap})，不生成新市民`);
      }
      
      // 直接更新現有市民
      this.updateExistingCitizens(context);
      this.assignNewJobs(context);
      return;
    }
    
    // 生成新市民的邏輯
    if (this.currentTime > generationInterval) {
      this.population += 1;
      this.currentTime = 0;

      // 獲取隨機住宅區建築
      const randomResidentialBuilding = context.buildingManager.getRandomResidentialBuilding();

      // 如果沒有住宅建築物可用，則延遲生成新公民
      if (!randomResidentialBuilding) {
        const historyLogger = HistoryLogger.getInstance();
        historyLogger.addLog('system', 'population', 'warning', '無法生成新市民：找不到住宅建築');
        this.updateExistingCitizens(context);
        this.assignNewJobs(context);
        return;
      }

      try {
        // 创建新的 Citizen 实例并添加到 citizens 数组中
        const newCitizen = new Citizen(
          Math.random() > 0.5 ? 'Male' : 'Female', // 随机性别
          randomResidentialBuilding.id, // 住宅区 ID
          '', // workAt 需要根据实际情况设置
          'Car', // 假设交通工具为 Car
          'Unemployed', // 假设初始职业为 Unemployed
          'Happy', // 假设初始心情为 Happy
          Math.floor(Math.random() * 70) + 15, // 15-85岁
          // 使用住宅建築物的位置，而不是完全隨機位置
          { x: randomResidentialBuilding.getPosition().x, y: randomResidentialBuilding.getPosition().y }
        );

        // 记录市民创建
        const historyLogger = HistoryLogger.getInstance();
        historyLogger.addLog(
          'system', 
          'population', 
          'create', 
          `新市民 ${newCitizen.name} (${newCitizen.gender}, ${newCitizen.age}歲) 被創建在住宅 ${randomResidentialBuilding.id}`
        );

        this.addCitizen(newCitizen);
      } catch (error) {
        const historyLogger = HistoryLogger.getInstance();
        historyLogger.addLog('system', 'population', 'error', `創建市民失敗: ${error}`);
      }
    }
    
    // 確保每個公民更新時接收到 deltaTime 參數
    this.updateExistingCitizens(context);
    this.assignNewJobs(context);
  }
  
  // 將更新市民的邏輯分離到一個單獨的方法
  private updateExistingCitizens(context: { buildingManager: BuildingManager; roadManager: RoadManager; companyManager: CompanyManager; deltaTime?: number }) {
    // 確保每個公民更新時接收到 deltaTime 參數
    this.citizens.forEach((citizen) => {
      try {
        citizen.update({
          buildingManager: context.buildingManager,
          roadManager: context.roadManager,
          companyManager: context.companyManager,
          deltaTime: context.deltaTime
        });
      } catch (error) {
        const historyLogger = HistoryLogger.getInstance();
        historyLogger.addLog('system', 'population', 'error', `更新市民 ${citizen.id} 失敗: ${error}`);
      }
    });
  }

  // Try to assign jobs to unemployed citizens
  private assignNewJobs(context: { buildingManager: BuildingManager; roadManager: RoadManager; companyManager: CompanyManager; deltaTime?: number }) {
    // Process a portion of citizens each time to avoid performance issues
    const unemployedCitizens = this.citizens.filter(citizen => !citizen.job && citizen.occupation === "Unemployed");
    
    // Early return if no unemployed citizens
    if (unemployedCitizens.length === 0) return;
    
    // Get jobs from the job manager
    const jobManager = context.buildingManager.gameState?.jobManager;
    if (!jobManager) return;
    
    for (const citizen of unemployedCitizens) {
      // Try to find an available job
      const job = jobManager.getAvailableJob(citizen);
      if (job) {
        // Assign the job to the citizen
        citizen.startWorkAt(job, context);
        
        // Log the job assignment
        const historyLogger = HistoryLogger.getInstance();
        historyLogger.addLog('citizen', citizen.id, 'job-assigned', 
          `${citizen.name} 開始工作為 ${job.title} 在位置 ${job.location}`);
      }
    }
  }

  getPopulation() {
    return this.population;
  }
}