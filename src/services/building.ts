import { BuildingType, buildingTypeParams } from './building-type';
import { faker } from '@faker-js/faker';
import Job from '../models/Job';

export interface BuildingConfig {
  type: BuildingType;
  x: number;
  y: number;
  size: Size;
}

export interface Size {
  width: number;
  height: number;
}

export default class Building {
  private type: BuildingType;
  private position: { x: number; y: number };
  private size: Size;
  private lifecycle: 'under_construction' | 'normal' | 'abandoned';
  public id: string;
  public name: string;
  public address: string;

  constructor(config: BuildingConfig) {
    this.id = this.generateId(); // 生成唯一的 id
    this.type = config.type;
    if (config.type !== BuildingType.RESIDENTIAL) {
      this.name = faker.company.name();
      this.address = this.generateBusinessAddress();
    } else {
      this.name = `${faker.person.lastName()} House`;
      this.address = this.generateResidentialAddress();
    }
    this.position = { x: config.x, y: config.y };
    this.size = config.size;
    this.lifecycle = 'under_construction';
  }

  private generateId(): string {
    return `building-${Math.random().toString(36).substr(2, 9)}`; // 生成唯一 id
  }

  private generateBusinessAddress(): string {
    const streetNumber = faker.location.buildingNumber();
    const streetName = faker.location.street();
    const district = faker.location.county();
    return `${streetNumber}號 ${streetName}, ${district}區`;
  }

  private generateResidentialAddress(): string {
    const streetNumber = faker.location.buildingNumber();
    const streetName = faker.location.street();
    const district = faker.location.county();
    const floor = Math.floor(Math.random() * 20) + 1;
    return `${streetNumber}號 ${streetName}, ${district}區 ${floor}樓`;
  }

  getColor(): string {
    return buildingTypeParams[this.type].color;
  }

  update() {
    // 更新建築物的狀態
    if (this.lifecycle === 'under_construction') {
      // 假設施工時間為5秒
      this.lifecycle = 'normal'; // 假設施工完成
    }
  }

  getType(): BuildingType {
    return this.type;
  }

  getPosition(): { x: number; y: number } {
    return this.position;
  }

  getSize(): Size {
    return this.size;
  }

  getLifecycle(): string {
    return this.lifecycle;
  }

  getEmoji(): string {
    return buildingTypeParams[this.type].emoji;
  }

  getAddress(): string {
    return this.address;
  }
} 