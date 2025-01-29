import { faker } from '@faker-js/faker';
import Citizen from './Citizen';

export default class Job {
  id: string;
  title: string; // 工作職稱
  description: string; // 工作內容
  location: string; // 工作地點（對應建築 ID）
  type: string;
  area: string;
  occupied: boolean; // 新增屬性，表示工作是否被佔用
  citizen?: Citizen; // 新增屬性，存儲對應的 Citizen

  constructor(title: string, description: string, location: string) {
    this.id = this.generateId();
    this.title = faker.person.jobTitle();
    this.description = faker.person.jobDescriptor();
    this.type = faker.person.jobType();
    this.area = faker.person.jobArea();
    this.location = location;
    this.occupied = false; // 初始化為未佔用
  }

  private generateId(): string {
    return `job-${Math.random().toString(36).substr(2, 9)}`; // 生成唯一 id
  }

  public apply(citizen: Citizen) {
    if (this.occupied) {
      throw new Error('job already occupied');
    }
    this.citizen = citizen;
    this.occupied = true;
  }

  public release() {
    this.citizen?.quitJob();
    this.citizen = undefined;
    this.occupied = false;
  }
} 