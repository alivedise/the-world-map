import { faker } from '@faker-js/faker';
import Job from './Job';
import { Action } from './Action';

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
  job: Job | null;
  private currentAction: Action | null = null;
  private actionTicks: number = 0; // 記錄行動的執行時間

  constructor(
    gender: string,
    liveAt: string,
    workAt: string,
    transportation: string,
    occupation: string,
    mood: string,
    age: number,
    location: { x: number; y: number }, // 確保這裡是正確的對象
  ) {
    this.id = this.generateId(); // 生成唯一的 id
    this.name = faker.person.fullName(); // 使用 faker 生成名字
    this.gender = gender;
    this.liveAt = liveAt;
    this.workAt = workAt;
    this.transportation = transportation;
    this.occupation = occupation; // 設置職業
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
    // 如果有當前行動，則執行行動邏輯
    if (this.currentAction) {
      this.executeCurrentAction();
    } else {
      // 如果沒有當前行動，則決定下一個行動
      this.decideNextAction(buildings);
    }
  }

  private executeCurrentAction() {
    this.actionTicks++;

    // 檢查行動是否完成
    if (this.actionTicks >= this.currentAction.duration) {
      this.currentAction = null; // 行動完成
      this.actionTicks = 0; // 重置計數器
    }
  }

  private decideNextAction(buildings: Building[]) {
    // 這裡可以根據不同的邏輯決定下一個行動
    const actionType = this.randomActionType(); // 隨機選擇行動類型
    let duration = this.calculateActionDuration(actionType); // 計算行動所需的時長

    // 根據行動類型創建行動實例
    this.currentAction = new Action(actionType, duration);
  }

  private randomActionType(): ActionType {
    const actionTypes: ActionType[] = ['rest', 'move', 'work'];
    return actionTypes[Math.floor(Math.random() * actionTypes.length)];
  }

  private calculateActionDuration(actionType: ActionType): number {
    // 根據行動類型計算所需的時長
    switch (actionType) {
      case 'rest':
        return Math.floor(Math.random() * 5) + 1; // 隨機休息1到5個tick
      case 'move':
        return 0; // 移動行動不需要固定時長
      case 'work':
        return Math.floor(Math.random() * 10) + 1; // 隨機工作1到10個tick
      default:
        return 1; // 默認時長
    }
  }

  quitJob() {
    this.workAt = '';
    this.job = null;
  }

  public startWorkAt(job: Job) {
    this.job = job;
    this.job.apply(this);
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