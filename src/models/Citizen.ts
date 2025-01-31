import { faker } from '@faker-js/faker';
import Job from './Job';
import { Action } from './Action';
import RoadManager from '../services/RoadManager';
import BuildingManager from '../services/building-manager';

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
  path: { x: number; y: number }[] | null;
  destination: { x: number, y: number };
  private currentAction: Action | null = null;
  private actionTicks: number = 0; // 記錄行動的執行時間
  private currentStep: number = 0; // 新增當前步驟屬性

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

  update(context: {
    buildingManager: BuildingManager,
    roadManager: RoadManager,
  }) {
    if (this.currentAction) {
      this.executeCurrentAction();
    } else {
      // 如果沒有當前行動，則決定下一個行動
      this.decideNextAction(context);
    }

    // 更新市民位置
    this.updatePosition();
  }

  private executeCurrentAction() {
    this.actionTicks++;

    // 檢查行動是否完成
    if (this.actionTicks >= this.currentAction.duration) {
      this.currentAction = null; // 行動完成
      this.actionTicks = 0; // 重置計數器
    }
  }

  private decideNextAction(context: {
    buildingManager: BuildingManager,
    roadManager: RoadManager,
  }) {
    const buildings = context.buildingManager.getBuildings()
    const actionType = this.randomActionType(); // 隨機選擇行動類型
    let duration = this.calculateActionDuration(actionType); // 計算行動所需的時長

    // 根據行動類型創建行動實例
    this.currentAction = new Action(actionType, duration);
    console.log(`${this.name} next action: ${actionType}`);
    if (actionType === 'move') {
      // 確保有工作地點
      if (this.workAt) {
        const destination = { x: 0, y: 0 }; // 假設這裡是目標建築的座標
        const building = buildings.find(b => b.id === this.workAt);
        if (building) {
          destination.x = building.getPosition().x;
          destination.y = building.getPosition().y;
          
          // 使用 roadManager 找出移動路徑
          // XXX: workaround float x,y issue after moving
          const path = context.roadManager.findPath({
            x: Math.round(this.location.x),
            y: Math.round(this.location.y),
          }, destination);
          if (path) {
            this.targetAt = this.workAt
            this.moveTo(path); // 移動到隨機選擇的建築
          } else {
            console.log("無法找到路徑:", this.location, destination);
          }
        }
      } else {
        // 隨機選擇一個建築物作為目的地
        const randomBuilding = buildings[Math.floor(Math.random() * buildings.length)];
        const destination = randomBuilding.getPosition();

        // 使用 roadManager 找出移動路徑
        const path = context.roadManager.findPath({
          x: Math.round(this.location.x),
          y: Math.round(this.location.y),
        }, destination);
        if (path) {
          this.targetAt = randomBuilding.id;
          this.moveTo(path); // 移動到隨機選擇的建築
        } else {
          console.log("無法找到路徑:", this.location, destination);
        }
      }
    }
  }

  private randomActionType(): ActionType {
    const actionTypes: ActionType[] = ['rest', 'move', 'work'];
    return actionTypes[Math.floor(Math.random() * actionTypes.length)];
  }

  private calculateActionDuration(actionType: ActionType): number {
    // 根據行動類型計算所需的時長
    switch (actionType) {
      case 'rest':
        return Math.floor(Math.random() * 5) + 20; // 隨機休息2到6個tick
      case 'move':
        return 0; // 移動行動不需要固定時長
      case 'work':
        return Math.floor(Math.random() * 10) + 20; // 隨機工作2到11個tick
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

  public moveTo(path: { x: number, y: number }[]) {
    if (!path || path.length === 0) {
        console.log("無法找到路徑");
        return;
    }
    
    // 將路徑展開為 32 個步驟
    this.path = this.expandPath(path, 32);
    this.currentStep = 0; // 初始化當前步驟
  }

  private expandPath(path: { x: number, y: number }[], steps: number): { x: number, y: number }[] {
    const expandedPath: { x: number, y: number }[] = [];
    
    for (let i = 0; i < path.length - 1; i++) {
        const start = path[i];
        const end = path[i + 1];
        
        for (let j = 0; j < steps; j++) {
            const x = start.x + (end.x - start.x) * (j / steps);
            const y = start.y + (end.y - start.y) * (j / steps);
            expandedPath.push({ x, y });
        }
    }
    
    return expandedPath;
  }

  private updatePosition() {
    if (this.path && this.currentStep < this.path.length) {
      // 更新市民位置
      this.location = {
        x: (this.path[this.currentStep].x),
        y: (this.path[this.currentStep].y)
      };
      //console.log(`市民${this.name}移動到: (${this.location.x}, ${this.location.y})`); // 直接使用格子座標
      this.currentStep++; // 增加步驟
    } else {
      this.path = null; // 移動完成，清空路徑
    }
  }
}