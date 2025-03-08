import { HistoryLogger } from '../services/history-logger';

export class Vehicle {
  id: string;
  type: 'truck' | 'van';
  capacity: number;
  location: { x: number; y: number };
  companyId: string;
  speed: number;
  status: 'idle' | 'loading' | 'delivering' | 'unloading' | 'returning' | 'patrolling';
  color: string;
  currentProduct?: {
    id: string;
    name: string;
    quantity: number;
    sourceCompanyId: string;
    destinationCompanyId?: string;
    destination: { x: number; y: number };
  };
  path: { x: number; y: number }[] | null = null;
  private currentPathIndex: number = 0;
  private returnPath: { x: number; y: number }[] | null = null;
  private sourceLocation: { x: number; y: number };
  private loadingTime: number = 0;
  private loadingDuration: number = 5; // 裝載和卸載的時間 (改為5, 以加快測試)
  private unloadingTime: number = 0;

  constructor(type: 'truck' | 'van', companyId: string, location: { x: number; y: number }) {
    this.id = `vehicle-${Math.random().toString(36).substr(2, 9)}`;
    this.type = type;
    this.capacity = type === 'truck' ? 10 : 5;
    this.companyId = companyId;
    this.location = { ...location };
    this.sourceLocation = { ...location };
    this.speed = type === 'truck' ? 0.8 : 1.2; // 卡車慢但容量大，貨車快但容量小
    this.status = 'idle';
    const getRandomComponent = () => Math.floor(Math.random() * 155) + 50; // 50-205範圍
    this.color = `rgb(${getRandomComponent()}, ${getRandomComponent()}, ${getRandomComponent()})`;
  }

  private generateColor(): string {
    // 根據車輛類型生成顏色
    if (this.type === 'truck') {
      return `rgb(${Math.floor(Math.random() * 50) + 100}, ${Math.floor(Math.random() * 50) + 100}, ${Math.floor(Math.random() * 50) + 150})`;
    } else {
      return `rgb(${Math.floor(Math.random() * 50) + 150}, ${Math.floor(Math.random() * 50) + 100}, ${Math.floor(Math.random() * 50) + 100})`;
    }
  }
  
  /**
   * Get the vehicle's unique ID
   * @returns The vehicle's ID
   */
  getId(): string {
    return this.id;
  }

  assignDelivery(product: { id: string, name: string; quantity: number, sourceCompanyId: string, destinationCompanyId?: string }, destination: { x: number; y: number }) {
    const historyLogger = HistoryLogger.getInstance();
    
    // 檢查這個車輛是否正在執行其他任務
    if (this.status !== 'idle') {
      historyLogger.addLog(
        'vehicle', 
        this.id, 
        'assignment-failed', 
        `車輛 ${this.id} 無法接受新任務，目前狀態: ${this.status}`
      );
      return false;
    }
    
    // 檢查產品數量是否超過車輛容量
    if (product.quantity > this.capacity) {
      historyLogger.addLog(
        'vehicle', 
        this.id, 
        'assignment-failed', 
        `車輛 ${this.id} 無法運送 ${product.name}，數量 ${product.quantity} 超過車輛容量 ${this.capacity}`
      );
      return false;
    }
    
    // 檢查目的地是否有效
    if (!destination || typeof destination.x !== 'number' || typeof destination.y !== 'number') {
      historyLogger.addLog(
        'vehicle', 
        this.id, 
        'assignment-failed', 
        `車輛 ${this.id} 無法接受任務，目的地座標無效: ${JSON.stringify(destination)}`
      );
      return false;
    }
    
    // 任務分配成功，更新車輛狀態
    this.currentProduct = {
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      sourceCompanyId: product.sourceCompanyId,
      destinationCompanyId: product.destinationCompanyId,
      destination
    };
    
    this.status = 'loading';
    this.loadingTime = 0; // Reset loading time
    
    // 記錄配送任務分配
    historyLogger.addLog(
      'vehicle', 
      this.id, 
      'assigned', 
      `車輛 ${this.id} 被分配運送 ${product.name} (${product.quantity} 單位) 從公司 ${product.sourceCompanyId} 到 ${product.destinationCompanyId || '未指定目的地'}, 目標位置: (${destination.x.toFixed(2)}, ${destination.y.toFixed(2)})`
    );
    
    return true;
  }

  setPath(path: { x: number; y: number }[]) {
    const historyLogger = HistoryLogger.getInstance();
    if (!path || path.length === 0) {
      historyLogger.addLog('vehicle', this.id, 'path-error', 
        `車輛 ${this.id} 嘗試設置空路徑，無法繼續移動`);
      return;
    }
    
    this.path = path;
    this.currentPathIndex = 0;
    
    // 記錄路徑信息
    const startPoint = path[0];
    const endPoint = path[path.length - 1];
    historyLogger.addLog('vehicle', this.id, 'path-set', 
      `車輛 ${this.id} 設置了新路徑，長度: ${path.length}, 從 (${startPoint.x.toFixed(2)}, ${startPoint.y.toFixed(2)}) 到 (${endPoint.x.toFixed(2)}, ${endPoint.y.toFixed(2)})`);
  }

  setReturnPath(path: { x: number; y: number }[]) {
    const historyLogger = HistoryLogger.getInstance();
    if (!path || path.length === 0) {
      historyLogger.addLog('vehicle', this.id, 'return-path-error', 
        `車輛 ${this.id} 嘗試設置空返回路徑，這可能導致無法返回`);
      return;
    }
    
    this.returnPath = path;
    
    // 記錄返回路徑信息
    const startPoint = path[0];
    const endPoint = path[path.length - 1];
    historyLogger.addLog('vehicle', this.id, 'return-path-set', 
      `車輛 ${this.id} 設置了返回路徑，長度: ${path.length}, 從 (${startPoint.x.toFixed(2)}, ${startPoint.y.toFixed(2)}) 到 (${endPoint.x.toFixed(2)}, ${endPoint.y.toFixed(2)})`);
  }

  update(deltaTime: number) {
    // 記錄當前狀態
    const historyLogger = HistoryLogger.getInstance();
    
    // 添加詳細的狀態日誌
    historyLogger.addLog('vehicle', this.id, 'status-debug', 
      `車輛 ${this.id} 狀態: ${this.status}, 位置: (${this.location.x.toFixed(2)}, ${this.location.y.toFixed(2)}), 
      貨物: ${this.currentProduct ? this.currentProduct.name : '無'}, 
      路徑點: ${this.path ? this.currentPathIndex + '/' + this.path.length : '無路徑'}`);
    
    switch (this.status) {
      case 'loading':
        this.updateLoading(deltaTime);
        break;
      case 'delivering':
        this.updateDelivering(deltaTime);
        break;
      case 'unloading':
        this.updateUnloading(deltaTime);
        break;
      case 'returning':
        this.updateReturning(deltaTime);
        break;
      case 'patrolling':
        this.updatePatrolling(deltaTime);
        break;
      case 'idle':
        // Log idle state
        historyLogger.addLog('vehicle', this.id, 'idle-debug', 
          `車輛 ${this.id} 處於閒置狀態，等待任務分配`);
        break;
    }
  }

  private updateLoading(deltaTime: number) {
    this.loadingTime += deltaTime;
    
    // Log loading progress every second
    if (Math.floor(this.loadingTime) % 10 === 0) {
      const historyLogger = HistoryLogger.getInstance();
      historyLogger.addLog(
        'vehicle', 
        this.id, 
        'loading-progress', 
        `車輛 ${this.id} 裝載進度: ${Math.min(100, Math.floor((this.loadingTime / this.loadingDuration) * 100))}%`
      );
    }
    
    if (this.loadingTime >= this.loadingDuration) {
      this.status = 'delivering';
      
      // 記錄產品裝載
      const historyLogger = HistoryLogger.getInstance();
      historyLogger.addLog(
        'vehicle', 
        this.id, 
        'pickup', 
        `車輛 ${this.id} 裝載了 ${this.currentProduct.name}`
      );
    }
  }

  private updateDelivering(deltaTime: number) {
    // Update movement along path
    this.updateMovement(deltaTime);
    
    // If we've reached the destination
    if (!this.path || this.currentPathIndex >= this.path.length) {
      if (this.returnPath && this.returnPath.length > 0) {
        // Set the current path to the return path
        this.status = 'returning';
        this.path = this.returnPath;
        this.currentPathIndex = 0;
        
        const historyLogger = HistoryLogger.getInstance();
        historyLogger.addLog(
          'vehicle', 
          this.id, 
          'delivered', 
          `車輛 ${this.id} 已到達目的地 (${this.location.x.toFixed(2)}, ${this.location.y.toFixed(2)})，準備返回公司`
        );
      } else {
        // No return path, just mark as complete
        this.status = 'idle';
        this.currentProduct = null;
        
        const historyLogger = HistoryLogger.getInstance();
        historyLogger.addLog(
          'vehicle', 
          this.id, 
          'error-no-return', 
          `車輛 ${this.id} 已到達目的地但沒有返回路徑，設為閒置狀態`
        );
      }
    }
  }

  private updateUnloading(deltaTime: number) {
    this.unloadingTime += deltaTime;
    if (this.unloadingTime >= this.loadingDuration) {
      // 記錄配送完成
      const historyLogger = HistoryLogger.getInstance();
      historyLogger.addLog(
        'vehicle', 
        this.id, 
        'delivery-complete', 
        `車輛 ${this.id} 完成了從 ${this.currentProduct.sourceCompanyId} 到 ${this.currentProduct.destinationCompanyId} 的 ${this.currentProduct.name} 配送`
      );
      
      // 卸貨完成，準備返回
      this.status = 'returning';
      
      if (this.returnPath) {
        this.path = this.returnPath;
        this.currentPathIndex = 0;
      } else {
        // 如果沒有返回路徑，直接完成
        this.completeDelivery();
      }
    }
  }

  private updateReturning(deltaTime: number) {
    // Update movement along path
    this.updateMovement(deltaTime);
    
    // If we've reached the company
    if (!this.path || this.currentPathIndex >= this.path.length) {
      this.status = 'idle';
      this.currentProduct = null;
      this.path = null;
      this.returnPath = null;
      this.currentPathIndex = 0;
      
      const historyLogger = HistoryLogger.getInstance();
      historyLogger.addLog(
        'vehicle', 
        this.id, 
        'returned', 
        `車輛 ${this.id} 已返回公司位置 (${this.location.x.toFixed(2)}, ${this.location.y.toFixed(2)})，任務完成`
      );
    }
  }

  private updatePatrolling(deltaTime: number) {
    // Update movement along path
    this.updateMovement(deltaTime);
    
    // If we've reached the end of the patrol path
    if (!this.path || this.currentPathIndex >= this.path.length) {
      // Log completion of this patrol route
      const historyLogger = HistoryLogger.getInstance();
      historyLogger.addLog(
        'vehicle',
        this.id,
        'patrol-complete',
        `車輛 ${this.id} 完成一次巡邏路線`
      );
      
      // Reset to idle state so we can be assigned a new patrol
      this.status = 'idle';
      this.path = null;
      this.currentPathIndex = 0;
    }
  }

  private updateMovement(deltaTime: number) {
    if (!this.path || this.currentPathIndex >= this.path.length) {
      return;
    }
    
    try {
      const targetPoint = this.path[this.currentPathIndex];
      if (!targetPoint || typeof targetPoint.x !== 'number' || typeof targetPoint.y !== 'number') {
        const historyLogger = HistoryLogger.getInstance();
        historyLogger.addLog(
          'vehicle', 
          this.id, 
          'path-error', 
          `車輛 ${this.id} 路徑點無效 [${this.currentPathIndex}/${this.path.length}]: ${JSON.stringify(targetPoint)}`
        );
        this.currentPathIndex++;
        return;
      }
      
      const oldPosition = { ...this.location };
      
      const dx = targetPoint.x - this.location.x;
      const dy = targetPoint.y - this.location.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 如果距離很近，直接前往下一個點
      if (distance < this.speed * deltaTime * 0.1) {
        this.location = { x: targetPoint.x, y: targetPoint.y };
        this.currentPathIndex++;
        
        // 每5個點記錄一次位置，避免日誌過多
        if (this.currentPathIndex % 5 === 0 || this.currentPathIndex >= this.path.length) {
          const historyLogger = HistoryLogger.getInstance();
          historyLogger.addLog(
            'vehicle', 
            this.id, 
            'path-progress', 
            `車輛 ${this.id} 移動進度 [${this.currentPathIndex}/${this.path.length}]: 位置 (${this.location.x.toFixed(2)}, ${this.location.y.toFixed(2)})`
          );
        }
      }
      // 否則朝目標點移動
      else {
        // 計算移動方向
        const directionX = dx / distance;
        const directionY = dy / distance;
        
        // 計算移動距離
        const moveDistance = Math.min(this.speed * deltaTime, distance * 0.9);
        
        // 更新位置
        this.location.x += directionX * moveDistance;
        this.location.y += directionY * moveDistance;
      }
    } catch (error) {
      const historyLogger = HistoryLogger.getInstance();
      historyLogger.addLog(
        'vehicle', 
        this.id, 
        'movement-error', 
        `車輛 ${this.id} 移動時出錯: ${error.message}`
      );
      
      // Skip this point if there's an error
      this.currentPathIndex++;
    }
  }

  private completeDelivery() {
    // 記錄配送完成
    const historyLogger = HistoryLogger.getInstance();
    historyLogger.addLog(
      'vehicle', 
      this.id, 
      'delivery-complete', 
      `車輛 ${this.id} 完成了從 ${this.currentProduct.sourceCompanyId} 到 ${this.currentProduct.destinationCompanyId} 的 ${this.currentProduct.name} 配送`
    );
    
    this.currentProduct = undefined;
    this.path = null;
    this.returnPath = null;
    this.status = 'idle';
    this.location = { ...this.sourceLocation };
  }

  /**
   * Check if the vehicle is available for a new task
   * @returns true if vehicle is idle and can accept a new task
   */
  isAvailable(): boolean {
    const available = this.status === 'idle';
    
    // Add debug log every 50 game ticks for vehicle availability
    if (Math.random() < 0.02) { // ~2% chance each update
      const historyLogger = HistoryLogger.getInstance();
      historyLogger.addLog(
        'vehicle', 
        this.id, 
        'availability-check', 
        `車輛 ${this.id} 可用狀態: ${available ? '可用' : '忙碌中'}, 當前狀態: ${this.status}`
      );
    }
    
    return available;
  }
  
  /**
   * Cancel the current delivery and reset vehicle state
   * Useful for unstucking vehicles that are in a problematic state
   */
  cancelDelivery() {
    if (this.status === 'idle') return;
    
    const oldStatus = this.status;
    this.status = 'idle';
    this.path = [];
    this.currentProduct = null;
    this.loadingTime = 0;
    
    const historyLogger = HistoryLogger.getInstance();
    historyLogger.addLog(
      'vehicle',
      this.id,
      'delivery-cancelled',
      `車輛 ${this.id} 取消了配送任務，狀態從 ${oldStatus} 重置為 idle`
    );
  }

  // 取得目前車輛的運送資訊，包括產品、目的地、運送進度等
  getDeliveryInfo() {
    if (!this.currentProduct) {
      return null;
    }

    let progress = 0;
    let distanceToDestination = 0;
    let totalDistance = 0;

    if (this.path && this.path.length > 0) {
      // 計算總路程
      totalDistance = this.calculatePathDistance();

      if (this.status === 'delivering') {
        // 計算已行走的距離比例
        const remainingDistance = this.calculateRemainingDistance();
        distanceToDestination = remainingDistance;
        progress = Math.max(0, Math.min(100, ((totalDistance - remainingDistance) / totalDistance) * 100));
      } else if (this.status === 'unloading') {
        progress = Math.min(100, (this.unloadingTime / this.loadingDuration) * 100);
      } else if (this.status === 'loading') {
        progress = Math.min(100, (this.loadingTime / this.loadingDuration) * 100);
      } else if (this.status === 'returning') {
        // 計算返回進度
        const remainingDistance = this.calculateRemainingDistance();
        distanceToDestination = remainingDistance;
        const initialDistance = this.calculateReturnPathDistance();
        progress = Math.max(0, Math.min(100, ((initialDistance - remainingDistance) / initialDistance) * 100));
      }
    }

    return {
      productName: this.currentProduct.name,
      quantity: this.currentProduct.quantity,
      sourceCompanyId: this.currentProduct.sourceCompanyId,
      destinationCompanyId: this.currentProduct.destinationCompanyId,
      destination: this.currentProduct.destination,
      progress: progress,
      distanceToDestination: distanceToDestination
    };
  }

  // 返回車輛當前狀態
  getStatus(): string {
    return this.status;
  }
  
  // 返回車輛當前裝載時間
  getLoadingTime(): number {
    return this.loadingTime;
  }
  
  // 返回車輛容量
  getCapacity(): number {
    return this.capacity;
  }

  // 計算路徑總距離
  private calculatePathDistance() {
    if (!this.path || this.path.length < 2) {
      return 0;
    }

    let totalDistance = 0;
    for (let i = 1; i < this.path.length; i++) {
      const dx = this.path[i].x - this.path[i-1].x;
      const dy = this.path[i].y - this.path[i-1].y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
    }
    return totalDistance;
  }

  // 計算返回路徑總距離
  private calculateReturnPathDistance() {
    if (!this.returnPath || this.returnPath.length < 2) {
      return 0;
    }

    let totalDistance = 0;
    for (let i = 1; i < this.returnPath.length; i++) {
      const dx = this.returnPath[i].x - this.returnPath[i-1].x;
      const dy = this.returnPath[i].y - this.returnPath[i-1].y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
    }
    return totalDistance;
  }

  // 計算到達目的地的剩餘距離
  private calculateRemainingDistance() {
    if (!this.path || this.currentPathIndex >= this.path.length) {
      return 0;
    }

    let remainingDistance = 0;
    // 計算當前位置到下一路徑點的距離
    const dx = this.path[this.currentPathIndex].x - this.location.x;
    const dy = this.path[this.currentPathIndex].y - this.location.y;
    remainingDistance += Math.sqrt(dx * dx + dy * dy);

    // 加上後續路徑點之間的距離
    for (let i = this.currentPathIndex + 1; i < this.path.length; i++) {
      const pdx = this.path[i].x - this.path[i-1].x;
      const pdy = this.path[i].y - this.path[i-1].y;
      remainingDistance += Math.sqrt(pdx * pdx + pdy * pdy);
    }

    return remainingDistance;
  }

  /**
   * Send the vehicle on patrol to a specific point
   * @param path The path to follow for patrolling
   */
  patrol(path: any[]) {
    if (!path || path.length === 0) return;
    
    this.status = 'patrolling';
    this.path = path;
    this.currentPathIndex = 0;
    this.currentProduct = null;
    
    const targetPoint = path[path.length - 1];
    const historyLogger = HistoryLogger.getInstance();
    historyLogger.addLog(
      'vehicle',
      this.id,
      'start-patrol',
      `車輛 ${this.id} 開始巡邏，目標點: (${targetPoint.x}, ${targetPoint.y})`
    );
  }
}