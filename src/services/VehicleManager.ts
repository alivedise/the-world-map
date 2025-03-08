import { Vehicle } from '../models/Vehicle';
import RoadManager from './RoadManager';
import { Product } from '../models/Product';
import BuildingManager from './building-manager';
import { HistoryLogger } from './history-logger';

export default class VehicleManager {
  protected vehicles: Map<string, Vehicle[]> = new Map(); // companyId -> vehicles
  private allVehicles: Vehicle[] = [];
  private lastVehicleStatus: Map<string, string> = new Map(); // vehicleId -> status

  constructor() {}

  addCompanyVehicles(companyId: string, location: { x: number; y: number }): Vehicle[] {
    const vehicles = [
      new Vehicle('truck', companyId, location),
      new Vehicle('van', companyId, location),
      new Vehicle('van', companyId, location)
    ];
    
    // Set vehicles for this company
    this.vehicles.set(companyId, vehicles);
    this.allVehicles.push(...vehicles);
    
    // Log the vehicle creation
    const historyLogger = HistoryLogger.getInstance();
    historyLogger.addLog(
      'system',
      'vehicle-manager',
      'add-vehicles',
      `為公司 ID: ${companyId} 添加了 ${vehicles.length} 台車輛，位置: (${location.x}, ${location.y})`
    );
    
    // Return the created vehicles
    return vehicles;
  }

  getAvailableVehicle(companyId: string, requiredCapacity: number): Vehicle | undefined {
    const companyVehicles = this.vehicles.get(companyId) || [];
    return companyVehicles.find(v => 
      v.isAvailable() && v.capacity >= requiredCapacity
    );
  }

  update(context: { roadManager: RoadManager, deltaTime: number }) {
    for (const vehicle of this.allVehicles) {
      const currentStatus = vehicle.getStatus();
      const lastStatus = this.lastVehicleStatus.get(vehicle.id);
      
      // 如果狀態有變化，可以記錄下來用於數據統計或調試
      if (currentStatus !== lastStatus) {
        this.lastVehicleStatus.set(vehicle.id, currentStatus);
        if (vehicle.currentProduct) {
          // console.log(`車輛 ${vehicle.id} 狀態變更: ${lastStatus} -> ${currentStatus}, 運送: ${vehicle.currentProduct.name}`);
        }
      }
      
      // 如果是運送中但沒有路徑，嘗試尋找路徑
      if (vehicle.currentProduct && !vehicle.path && vehicle.getStatus() === 'delivering') {
        const path = context.roadManager.findPath(
          vehicle.location,
          vehicle.currentProduct.destination
        );
        if (path) {
          vehicle.setPath(this.expandPath(path, 32));
        }
      }
      
      // 更新車輛狀態
      vehicle.update(context.deltaTime);
    }
  }

  /**
   * 為產品分配合適的車輛並設計路線
   */
  assignVehicleForProduct(product: Product, sourceLocation: { x: number; y: number }, destinationLocation: { x: number; y: number }, context: { roadManager: RoadManager }): boolean {
    if (product.type !== 'physical' || !product.producerId) {
      return false;
    }
    
    const vehicle = this.getAvailableVehicle(product.producerId, product.quantity);
    if (!vehicle) {
      return false;
    }
    
    // 分配運送任務
    const assigned = vehicle.assignDelivery({
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      sourceCompanyId: product.producerId,
      destinationCompanyId: product.consumerId
    }, destinationLocation);
    
    if (!assigned) {
      return false;
    }
    
    // 尋找從來源到目的地的路徑
    const deliveryPath = context.roadManager.findPath(sourceLocation, destinationLocation);
    if (!deliveryPath) {
      console.log(`無法找到從 (${sourceLocation.x}, ${sourceLocation.y}) 到 (${destinationLocation.x}, ${destinationLocation.y}) 的路徑`);
      return false;
    }
    
    // 設置送貨路徑
    vehicle.setPath(this.expandPath(deliveryPath, 32));
    
    // 尋找從目的地返回來源的路徑
    const returnPath = context.roadManager.findPath(destinationLocation, sourceLocation);
    if (returnPath) {
      vehicle.setReturnPath(this.expandPath(returnPath, 32));
    }
    
    return true;
  }

  /**
   * 獲取所有正在移動中的車輛
   * @returns 正在移動中的車輛陣列
   */
  getMovingVehicles(): Vehicle[] {
    return this.allVehicles.filter(v => v.getStatus() !== 'idle');
  }

  /**
   * 獲取所有車輛
   * @returns 所有車輛陣列
   */
  getAllVehicles(): Vehicle[] {
    return this.allVehicles;
  }

  getCompanyVehicles(companyId: string): Vehicle[] {
    return this.vehicles.get(companyId) || [];
  }

  getActiveDeliveries(): { vehicle: Vehicle, info: any }[] {
    return this.allVehicles
      .filter(v => v.currentProduct)
      .map(v => ({
        vehicle: v,
        info: v.getDeliveryInfo()
      }));
  }

  /**
   * Getter for vehicles map 
   */
  getVehiclesMap(): Map<string, Vehicle[]> {
    return this.vehicles;
  }

  /**
   * 擴展路徑，使車輛移動更平滑
   */
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

  /**
   * 確保所有公司都有分配車輛
   * @param companies 所有公司的列表
   */
  ensureCompaniesHaveVehicles(companies: Array<any>) {
    const historyLogger = HistoryLogger.getInstance();
    let companiesFixed = 0;
    
    for (const company of companies) {
      const companyId = company.getId();
      
      // Check if this company already has vehicles
      const vehiclesMap = this.getVehiclesMap();
      if (!vehiclesMap.has(companyId) || (vehiclesMap.get(companyId)?.length || 0) === 0) {
        // Get company location
        const location = company.getLocation();
        
        if (location && typeof location.x === 'number' && typeof location.y === 'number') {
          // Add vehicles to the company
          this.addCompanyVehicles(companyId, location);
          companiesFixed++;
          
          historyLogger.addLog(
            'system',
            'vehicle-manager',
            'fix-company-vehicles',
            `為公司 ${company.getName()} (ID: ${companyId}) 分配了新的車輛，位置: (${location.x}, ${location.y})`
          );
        } else {
          historyLogger.addLog(
            'system',
            'vehicle-manager',
            'fix-error',
            `無法為公司 ${company.getName()} (ID: ${companyId}) 分配車輛，位置無效: ${JSON.stringify(location)}`
          );
        }
      }
    }
    
    historyLogger.addLog(
      'system',
      'vehicle-manager',
      'fix-summary',
      `已修復 ${companiesFixed} 家公司的車輛分配`
    );
    
    return companiesFixed;
  }
}