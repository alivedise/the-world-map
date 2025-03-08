import Job from '../models/Job';
import Citizen from '../models/Citizen';
import Building from '../services/building';
import { BuildingType } from './building-type';
import CompanyManager from './company-manager';

export default class JobManager {
  private jobs: Job[] = [];
  private companyManager: CompanyManager | null = null;

  constructor() {
    this.jobs = [];
  }

  setCompanyManager(companyManager: CompanyManager) {
    this.companyManager = companyManager;
  }

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
    // Find unoccupied jobs first
    const unoccupiedJobs = this.jobs.filter(job => 
      job.location === location && !job.occupied);
    
    if (unoccupiedJobs.length > 0) {
      return unoccupiedJobs[0];
    }
    
    // If no unoccupied jobs, return any job at this location
    return this.jobs.find(job => job.location === location);
  }

  getAvailableJobsCount(): number {
    return this.jobs.filter(job => !job.occupied).length;
  }

  getOccupiedJobsCount(): number {
    return this.jobs.filter(job => job.occupied).length;
  }

  getRandomJob(): Job | undefined {
    if (this.jobs.length === 0) return undefined;
    return this.jobs[Math.floor(Math.random() * this.jobs.length)];
  }

  generateJobs(building: Building): Job[] {
    const jobs: Job[] = [];
    const buildingType = building.getType();
    const jobCount = Math.floor(Math.random() * 5) + 1; // 隨機生成 1 到 5 個工作

    // Find company associated with this building
    let companyId: string | null = null;
    if (this.companyManager) {
      const companies = this.companyManager.getCompanies();
      for (const company of companies) {
        if (company.getBuildings().includes(building.id)) {
          companyId = company.getId();
          break;
        }
      }
    }

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
                title = '一般工作';
                description = '一般工作描述';
                break;
        }

        const job = new Job(title, description, building.id, companyId);
        this.addJob(job);
        jobs.push(job);
    }

    return jobs;
  }
}