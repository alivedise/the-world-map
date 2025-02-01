import Citizen from "../models/Citizen";
import BuildingManager from "../services/building-manager";
import JobManager from '../services/job-manager';

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

  update(deltaTime: number, context: { buildingManager: BuildingManager; jobManager: JobManager }) {
    const buildings = context.buildingManager.buildings;
    this.currentTime += deltaTime;
    if (this.currentTime > 1) {
      this.population += 1;
      this.currentTime = 0;

      // 獲取隨機住宅區建築
      const randomResidentialBuilding = context.buildingManager.getRandomResidentialBuilding();

      // 创建新的 Citizen 实例并添加到 citizens 数组中
      const newCitizen = new Citizen(
        Math.random() > 0.5 ? 'Male' : 'Female', // 随机性别
        randomResidentialBuilding ? randomResidentialBuilding.id : '', // 随机选择的住宅区 ID
        '', // workAt 需要根据实际情况设置
        'Car', // 假设交通工具为 Car
        'Unemployed', // 假设初始职业为 Unemployed
        'Happy', // 假设初始心情为 Happy
        Math.floor(Math.random() * 100), // 随机年龄
        { x: Math.floor(Math.random() * 30), y: Math.floor(Math.random() * 20) } // 随机位置
      );

      // 請求工作
      const job = context.jobManager.getAvailableJob(newCitizen);
      if (job) {
        newCitizen.startWorkAt(job);
      }

      this.addCitizen(newCitizen);
    }
    this.citizens.forEach((citizen) => citizen.update(context));
  }

  getPopulation() {
    return this.population;
  }
}