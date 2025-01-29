import { faker } from '@faker-js/faker';

export default class Citizen {
  id: string; // 新增 id 屬性
  name: string;
  gender: string;
  liveAt: string; // 關聯到特定住宅區的 building id
  workAt: string; // 關聯到非住宅區的 building id
  targetAt: string = ''; // moving destination building id
  transportation: string;
  occupation: string;
  mood: string;
  age: number;
  location: { x: number; y: number }; // 新增位置属性
  accumulatedTime: number = 0; // 新增累積時間屬性
  speed: number = 1; // 新增速度屬性
  color: string; // 新增顏色屬性

  constructor(
    gender: string,
    liveAt: string,
    workAt: string,
    transportation: string,
    occupation: string,
    mood: string,
    age: number,
    location: { x: number; y: number } // 確保這裡是正確的對象
  ) {
    this.id = this.generateId(); // 生成唯一的 id
    this.name = faker.person.fullName(); // 使用 faker 生成名字
    this.gender = gender;
    this.liveAt = liveAt;
    this.workAt = workAt;
    this.transportation = transportation;
    this.occupation = occupation;
    this.mood = mood;
    this.age = age;
    this.location = { x: location.x, y: location.y }; // 確保這裡是正確的對象
    this.color = this.generateColor(this.id); // 根據 id 生成顏色
  }

  private generateId(): string {
    return `citizen-${Math.random().toString(36).substr(2, 9)}`; // 生成唯一 id
  }

  private generateColor(id: string): string {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = hash & 0x0000FF;
    return `rgb(${r % 256}, ${g % 256}, ${b % 256})`; // 生成 RGB 顏色
  }

  continueMoving() {
    
  }

  update(buildings: Building[]) {
    // 如果已經有目標建築，則直接繼續移動
    if (this.targetAt) {
        const destinationBuilding = buildings.find(building => building.id === this.targetAt);
        if (destinationBuilding) {
            const destinationPosition = destinationBuilding.getPosition();
            const path = this.calculatePath(destinationPosition);

            // 更新位置
            if (path.length > 0) {
                // 每次只移動一個像素
                this.location.x = Math.min(this.location.x + (this.location.x < destinationPosition.x ? 2/32 : -2/32), destinationPosition.x);
                this.location.y = Math.min(this.location.y + (this.location.y < destinationPosition.y ? 2/32 : -2/32), destinationPosition.y);

                // 檢查是否到達目的地
                if (this.location.x === destinationPosition.x && this.location.y === destinationPosition.y) {
                    this.targetAt = ''; // 清除目標
                }
            }
        }
    } else {
        // 隨機決定是否移動
        const shouldMove = Math.random() > 0.5; // 50% 機率決定是否移動
        if (shouldMove) {
            // 隨機選擇一個建築作為目的地
            const destinationBuilding = buildings[Math.floor(Math.random() * buildings.length)];
            this.targetAt = destinationBuilding.id;
            console.log(destinationBuilding);
        }
    }
  }

  private calculatePath(destination: { x: number; y: number }): { x: number; y: number }[] {
    const path = [];
    const stepSize = 1; // 每次移動的步長改為1像素
    let startX = this.location.x;
    let startY = this.location.y;
    const maxIterations = 100; // 最大迭代次數
    let iterations = 0;

    // 確保起始位置和目標位置都是有效的
    if (destination.x < 0 || destination.y < 0) {
        return path; // 返回空路徑
    }

    // 簡單的邊緣移動邏輯
    while ((startX !== destination.x || startY !== destination.y) && iterations < maxIterations) {
        if (startX < destination.x) {
            startX += stepSize;
        } else if (startX > destination.x) {
            startX -= stepSize;
        }

        if (startY < destination.y) {
            startY += stepSize;
        } else if (startY > destination.y) {
            startY -= stepSize;
        }

        path.push({ x: startX, y: startY });
        iterations++;
    }

    return path;
  }
}