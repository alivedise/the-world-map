import Job from '../models/Job';
import Citizen from '../models/Citizen';
import Building from '../services/building';
import { BuildingType } from './building-type';

export default class JobManager {
  private jobs: Job[] = [];

  addJob(job: Job) {
    this.jobs.push(job);
  }

  public getAvailableJob(citizen: Citizen) {
    // 尋找未被佔用的工作
    const availableJobs = this.jobs.filter(job => !job.occupied);
    if (availableJobs.length === 0) return undefined;
    return availableJobs[Math.floor(Math.random() * availableJobs.length)];
  }

  getJobs(): Job[] {
    return this.jobs;
  }

  getJobByLocation(location: string): Job | undefined {
    return this.jobs.find(job => job.location === location);
  }

  getRandomJob(): Job | undefined {
    if (this.jobs.length === 0) return undefined;
    return this.jobs[Math.floor(Math.random() * this.jobs.length)];
  }

  generateJobs(building: Building): Job[] {
    const jobs: Job[] = [];
    const buildingType = building.getType();
    const jobCount = Math.floor(Math.random() * 5) + 1; // 隨機生成 1 到 5 個工作

    for (let i = 0; i < jobCount; i++) {
        let title: string;
        let description: string;

        switch (buildingType) {
            case BuildingType.RESIDENTIAL:
                title = '居民';
                description = '居住在此住宅區';
                break;
            case BuildingType.COMMERCIAL:
                title = '商業工作';
                description = '在商業區工作';
                break;
            case BuildingType.INDUSTRIAL:
                title = '工廠工人';
                description = '在工廠工作';
                break;
            case BuildingType.OFFICE:
                title = '辦公室職員';
                description = '在辦公室工作';
                break;
            default:
                title = '未知工作';
                description = '這是一個未知的工作';
                break;
        }

        const job = new Job(title, description, building.id);
        jobs.push(job);
    }

    this.jobs.push(...jobs); // 將生成的工作添加到 JobManager 的工作列表中
    return jobs;
  }
} 