import { faker } from '@faker-js/faker';
import Job from './Job';
import { Action, ActionType } from './Action'; 
import RoadManager from '../services/road-manager';
import BuildingManager from '../services/building-manager';
import { HistoryLogger } from '../services/history-logger';
import CompanyManager from '../services/company-manager';

export default class Citizen {
  id: string; // 新增 id 屬性
  name: string;
  gender: 'Male' | 'Female';
  homeAt: string; // 關聯到特定住宅區的 building id
  workAt: string; // 關聯到非住宅區的 building id
  targetAt: string = ''; // moving destination building id
  vehicleType: string;
  occupation: string;
  mood: string;
  age: number;
  experience: number;
  location: { x: number; y: number }; // 新增位置属性
  accumulatedTime: number = 0; // 新增累積時間屬性
  speed: number = 0.05; // 減慢公民移動速度
  color: string; // 新增顏色屬性
  companyId: string | null = null; // 工作的公司ID
  job: Job | null;
  path: { x: number; y: number }[] | null;
  destination: { x: number, y: number };
  currentAction: {
    type: ActionType,
    targetBuilding: string,
    startTime: Date,
    duration: number,
    completed: boolean
  } | null = null;
  private actionTicks: number = 0; // 記錄行動的執行時間
  private currentStep: number = 0; // 新增當前步驟屬性
  private shouldRegeneratePath: boolean = false; // 新增路徑重生旗標
  private idleUntil: number = 0; // 市民休息直到這個時間（毫秒）
  hunger: number;
  energy: number;
  happiness: number;
  money: number;

  constructor(
    gender: 'Male' | 'Female',
    homeAt: string,
    workAt: string,
    vehicleType: string,
    occupation: string,
    mood: string,
    age: number,
    location: { x: number; y: number }, // 確保這裡是正確的對象
  ) {
    this.id = `citizen-${Math.random().toString(36).substring(2, 11)}`;
    this.name = `${faker.person.firstName()} ${faker.person.lastName()}`;
    this.gender = gender;
    this.homeAt = homeAt;
    this.workAt = workAt;
    this.vehicleType = vehicleType;
    this.occupation = occupation; // 設置職業
    this.mood = mood;
    this.age = age;
    this.experience = 0;
    
    // Ensure valid initial position with integer coordinates
    const x = Math.floor(location.x);
    const y = Math.floor(location.y);
    this.location = { x, y };
    
    // Validate initial position
    if (isNaN(x) || isNaN(y)) {
      const historyLogger = HistoryLogger.getInstance();
      historyLogger.addLog('citizen', this.id, 'position-error', 
        `${this.name} 位置含有NaN，重置到(10,10)`);
      this.location = { x: 10, y: 10 }; // Fallback to a safe position
    }
    
    this.hunger = 100;
    this.energy = 100;
    this.happiness = 100;
    this.money = 1000;
    // Use consistent colors based on gender
    this.color = gender === 'Male' ? '#3498db' : '#e74c3c';
  }

  update(context: {
    buildingManager: BuildingManager,
    roadManager: RoadManager,
    companyManager: CompanyManager,
    deltaTime: number
  }) {
    const historyLogger = HistoryLogger.getInstance();
    
    // Check if citizen is still in idle state
    const currentTime = Date.now();
    if (currentTime < this.idleUntil) {
      // We're still in rest period, but we don't need to log every update
      return;
    } else if (this.idleUntil > 0 && currentTime >= this.idleUntil && this.idleUntil != Number.MAX_SAFE_INTEGER) {
      // Just finished resting - log the end of rest period
      historyLogger.addLog('citizen', this.id, 'idle-complete', 
        `${this.name} 休息結束，準備繼續活動`);
      this.idleUntil = 0; // Reset the idle timer to avoid repeated end messages
    }
    
    // Check if we need to regenerate the path
    if (this.shouldRegeneratePath) {
      this.shouldRegeneratePath = false;
      historyLogger.addLog('citizen', this.id, 'regenerate-path', 
        `${this.name} 重新生成路徑`);
      this.decideNextAction(context);
    }

    // 更新行動
    if (this.currentAction) {
      this.executeCurrentAction();
    } else {
      // 初始化市民的第一個行動
      this.decideNextAction(context);
    }

    // 移動公民 - 使用路網系統
    if (this.path && this.currentStep < this.path.length) {
      try {
        // Get target position for current step
        const targetPosition = this.path[this.currentStep];
        
        // Validate target position
        if (isNaN(targetPosition.x) || isNaN(targetPosition.y)) {
          throw new Error(`目標點無效: (${targetPosition.x}, ${targetPosition.y})`);
        }
        
        // Calculate direction to move (positive or negative)
        const moveX = targetPosition.x > this.location.x ? 1 : 
                      targetPosition.x < this.location.x ? -1 : 0;
        const moveY = targetPosition.y > this.location.y ? 1 : 
                      targetPosition.y < this.location.y ? -1 : 0;
        
        // Calculate new position
        const newX = this.location.x + moveX * this.speed;
        const newY = this.location.y + moveY * this.speed;
        
        // Check if we've reached or passed the target
        const reachedX = (moveX > 0 && newX >= targetPosition.x) || 
                        (moveX < 0 && newX <= targetPosition.x) ||
                        moveX === 0;
        const reachedY = (moveY > 0 && newY >= targetPosition.y) || 
                        (moveY < 0 && newY <= targetPosition.y) ||
                        moveY === 0;
        
        if (reachedX && reachedY) {
          // Reached the target position, move to next path segment
          this.location = { 
            x: targetPosition.x, 
            y: targetPosition.y 
          };
          // Only log waypoints for important points (first, middle, last) to reduce log volume
          if (this.currentStep === 1 || this.currentStep === Math.floor(this.path.length / 2) || this.currentStep === this.path.length - 1) {
            historyLogger.addLog('citizen', this.id, 'reached-waypoint', 
              `${this.name} 到達途徑點 ${this.currentStep}/${this.path.length}: (${targetPosition.x.toFixed(2)}, ${targetPosition.y.toFixed(2)})`);
          }
          this.currentStep++;
          
          // Check if we've completed the full path
          if (this.currentStep >= this.path.length) {
            historyLogger.addLog('citizen', this.id, 'path-complete', 
              `${this.name} 完成路徑移動，到達目的地 (${this.location.x.toFixed(2)},${this.location.y.toFixed(2)})`);
            
            // Complete the current action
            if (this.currentAction) {
              this.currentAction.completed = true;
            }
            
            // Only idle if we reached an actual building
            if (this.currentAction && this.currentAction.targetBuilding) {
              // Try to find the exact building location from the building manager
              const building = context.buildingManager.getBuildings().find(
                b => b.id === this.currentAction?.targetBuilding
              );
              
              if (!building) {
                // Look for any building very close to our current position
                const nearbyBuilding = context.buildingManager.getBuildings().find(b => {
                  const bPos = b.getPosition();
                  const size = b.getSize();
                  
                  // Check if citizen is within the building's area (+ small margin)
                  return (
                    this.location.x >= bPos.x - 0.5 && 
                    this.location.x <= bPos.x + size.width + 0.5 &&
                    this.location.y >= bPos.y - 0.5 && 
                    this.location.y <= bPos.y + size.height + 0.5
                  );
                });
                
                if (nearbyBuilding) {
                  historyLogger.addLog('citizen', this.id, 'found-nearby-building', 
                    `${this.name} 找到附近的建築 ${nearbyBuilding.name || nearbyBuilding.id}`);
                  
                  // Update citizen position to be exactly at the building
                  const buildingPos = nearbyBuilding.getPosition();
                  this.location = {
                    x: buildingPos.x + 0.5,
                    y: buildingPos.y + 0.5
                  };
                  
                  // Take a rest
                  const idleTime = Math.floor(5000 + Math.random() * 10000);
                  this.idleUntil = Date.now() + idleTime;
                  historyLogger.addLog('citizen', this.id, 'idle-at-nearby-building', 
                    `${this.name} 在建築 ${nearbyBuilding.name || nearbyBuilding.id} 休息 ${(idleTime/1000).toFixed(1)}秒`);
                  return;
                }
              } else {
                // We're at a building, so take a rest
                const idleTime = Math.floor(5000 + Math.random() * 10000);
                this.idleUntil = Date.now() + idleTime;
                historyLogger.addLog('citizen', this.id, 'idle-at-building', 
                  `${this.name} 到達建築 ${building.name || building.id} 並休息 ${(idleTime/1000).toFixed(1)}秒`);
              }
            } else {
              // Not at a building, immediately look for a new destination
              historyLogger.addLog('citizen', this.id, 'no-building', 
                `${this.name} 沒有到達有效建築物，立即尋找新目標`);
                
              // Get a random building as a fallback
              const fallbackBuilding = context.buildingManager.getRandomBuilding();
              if (fallbackBuilding) {
                historyLogger.addLog('citizen', this.id, 'redirect-to-building', 
                  `${this.name} 正在導向到隨機建築 ${fallbackBuilding.name || fallbackBuilding.id}`);
                
                // Create a direct path to the fallback building
                const buildingPos = fallbackBuilding.getPosition();
                const newPath = context.roadManager.findPath(this.location, buildingPos);
                
                if (newPath && newPath.length > 0) {
                  this.moveTo(newPath); // 使用路径
                  
                  // 創建一個移動行動
                  this.currentAction = { 
                    type: ActionType.MOVE, 
                    targetBuilding: fallbackBuilding.id,
                    startTime: new Date(),
                    duration: 20000,
                    completed: false
                  };
                  return; // Successfully started moving
                }
              }
              
              // If all else fails, reset the action
              this.currentAction = null;
              this.decideNextAction(context);
            }
            
            this.path = null;
            this.currentStep = 0;
            
            // Create a new action once we reach the destination
            this.decideNextAction(context);
          }
        } else {
          // Still moving toward target
          this.location = { x: newX, y: newY };
        }
      } catch (error) {
        historyLogger.addLog('citizen', this.id, 'movement-error', 
          `${this.name} 移動失敗: ${error}，重置路徑`);
        
        // Reset path and generate a new one
        this.path = null;
        this.currentStep = 0;
        this.shouldRegeneratePath = true; // Set flag to generate new path on next update
      }
    } else {
      // No path, so let's decide our next action if we don't already have one
      if (!this.currentAction && Math.random() < 0.1) { // 10% chance to create a new action when idle
        this.decideNextAction(context);
      }
    }
  }

  private executeCurrentAction() {
    if (!this.currentAction) return;

    const historyLogger = HistoryLogger.getInstance();
    
    // Check if we're moving but don't have a path
    if (this.currentAction.type === ActionType.MOVE && !this.path) {
      historyLogger.addLog('citizen', this.id, 'path-missing', 
        `${this.name} 目前正在移動但沒有路徑，嘗試重新生成路徑`);
      
      // Set a flag to regenerate path on next update
      this.shouldRegeneratePath = true;
    }
    
    // Check if current action is completed
    const now = new Date();
    const elapsedTime = now.getTime() - this.currentAction.startTime.getTime();
    
    if (elapsedTime >= this.currentAction.duration) {
      // Action is completed
      historyLogger.addLog('citizen', this.id, 'action-complete', 
        `${this.name} 完成了 ${this.currentAction.type} 行動`);
      this.currentAction.completed = true;
      this.currentAction = null;
      this.path = null; // Clear the path when action completes
      this.currentStep = 0;
    }
  }

  private updateMood(moodChange: number) {
    // 將心情值轉換為描述性文字
    const moodLevels = ['很不開心', '不開心', '普通', '開心', '很開心'];
    const currentIndex = moodLevels.indexOf(this.mood);
    const newIndex = Math.max(0, Math.min(4, currentIndex + Math.sign(moodChange)));
    this.mood = moodLevels[newIndex];
  }

  private decideNextAction(context: {
    buildingManager: BuildingManager,
    roadManager: RoadManager,
    companyManager: CompanyManager,
    deltaTime: number
  }) {
    // First check if we're supposed to be idle
    if (Date.now() < this.idleUntil) {
      return; // Still in idle period, don't start a new action
    }
    
    // 70% 的機率移動到另一個隨機建築物
    const randomValue = Math.random();
    const historyLogger = HistoryLogger.getInstance();
    
    try {
      // Always try to move if we don't have a current action or path
      if (!this.currentAction || !this.path) {
        const targetBuilding = context.buildingManager.getRandomBuilding();
        
        if (targetBuilding) {
          try {
            // 取得目標位置
            const targetPosition = targetBuilding.getPosition();
            const buildingName = targetBuilding.name || targetBuilding.id || "Unknown Building";
            
            // Validate target position
            if (isNaN(targetPosition.x) || isNaN(targetPosition.y)) {
              throw new Error(`Building ${buildingName} has invalid position (${targetPosition.x}, ${targetPosition.y})`);
            }
            
            // 確保我們不會移動到相同的位置 - 但只添加很小的偏移，確保市民停在建築物附近
            const targetWithOffset = {
              x: targetPosition.x + (Math.random() * 0.2 - 0.1), // -0.1 to 0.1 random offset (smaller)
              y: targetPosition.y + (Math.random() * 0.2 - 0.1)  // Smaller offset to stay within building
            };
            
            historyLogger.addLog('citizen', this.id, 'move-decision', 
              `${this.name} 決定移動到 ${buildingName} (${targetWithOffset.x.toFixed(2)}, ${targetWithOffset.y.toFixed(2)})`);
            
            // 尋找從當前位置到目標的路徑
            const path = context.roadManager.findPath(this.location, targetWithOffset);
            
            // 如果找到路徑，則開始移動
            if (path && path.length > 0) {
              // Don't log duplicate information - the moveTo method will log movement start
              this.moveTo(path); // 使用路径
              
              // 創建一個移動行動
              this.currentAction = { 
                type: ActionType.MOVE, 
                targetBuilding: targetBuilding.id,
                startTime: new Date(),
                duration: 20000,
                completed: false
              };
              return; // Successfully started moving
            } else {
              historyLogger.addLog('citizen', this.id, 'move-error', 
                `${this.name} 無法找到前往 ${buildingName} 的路徑`);
            }
          } catch (error) {
            historyLogger.addLog('citizen', this.id, 'error', `取得目標位置失敗: ${error}`);
          }
        } else {
          historyLogger.addLog('citizen', this.id, 'move-error', `${this.name} 找不到可移動的建築物`);
        }
      }
    } catch (error) {
      historyLogger.addLog('citizen', this.id, 'error', `決定行動失敗: ${error}`);
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

  quitJob(context?: {
    buildingManager: BuildingManager,
    roadManager: RoadManager,
    companyManager: CompanyManager,
    deltaTime: number
  }) {
    // Update company employee count
    if (this.companyId && context?.companyManager) {
      const company = context.companyManager.getCompany(this.companyId);
      if (company) {
        company.setEmployees(Math.max(0, company.getEmployees() - 1));
        const historyLogger = HistoryLogger.getInstance();
        historyLogger.addLog('citizen', this.id, 'left-company', 
          `${this.name} 離開公司 ${company.getName()}`);
      }
    }
    
    this.workAt = '';
    this.job = null;
    this.companyId = null;
    this.occupation = "Unemployed"; // Reset occupation when they quit
  }

  public startWorkAt(job: Job, context: {
    buildingManager: BuildingManager,
    roadManager: RoadManager,
    companyManager: CompanyManager,
    deltaTime: number
  }) {
    this.job = job;
    this.job.apply(this);
    this.companyId = job.companyId;
    
    // Set the occupation based on the job
    this.occupation = job.title;
    
    // Update company employee count
    if (this.companyId && context?.companyManager) {
      const company = context.companyManager.getCompany(this.companyId);
      if (company) {
        company.setEmployees(company.getEmployees() + 1);
        const historyLogger = HistoryLogger.getInstance();
        historyLogger.addLog('citizen', this.id, 'joined-company', 
          `${this.name} 加入公司 ${company.getName()} 作為 ${job.title}`);
      }
    }
  }

  public moveTo(path: { x: number; y: number }[]) {
    // Log the path details for debugging - only log start and destination to reduce log volume
    const historyLogger = HistoryLogger.getInstance();
    historyLogger.addLog('citizen', this.id, 'movement-start', 
      `${this.name} 開始移動，從 (${this.location.x.toFixed(2)},${this.location.y.toFixed(2)}) 到 (${path[path.length-1].x.toFixed(2)},${path[path.length-1].y.toFixed(2)}), 路徑長度: ${path.length}`);
    
    // Make a deep copy of the path to avoid reference issues
    this.path = [...path];
    this.currentStep = 0;
    this.destination = { ...path[path.length - 1] };
    
    // Don't log detailed path points to reduce log volume
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
}