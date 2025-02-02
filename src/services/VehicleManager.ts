import { Vehicle } from '../models/Vehicle';

export default class VehicleManager {
  private vehicles: Map<string, Vehicle[]> = new Map(); // companyId -> vehicles

  addCompanyVehicles(companyId: string, location: { x: number; y: number }) {
    const vehicles = [
      new Vehicle('truck', companyId, location),
      new Vehicle('van', companyId, location),
      new Vehicle('van', companyId, location)
    ];
    this.vehicles.set(companyId, vehicles);
  }

  getAvailableVehicle(companyId: string, requiredCapacity: number): Vehicle | undefined {
    const companyVehicles = this.vehicles.get(companyId) || [];
    return companyVehicles.find(v => 
      !v.currentProduct && v.capacity >= requiredCapacity
    );
  }

  update(context: { roadManager: RoadManager }) {
    for (const vehicles of this.vehicles.values()) {
      vehicles.forEach(vehicle => {
        if (vehicle.currentProduct && !vehicle.path) {
          const path = context.roadManager.findPath(
            vehicle.location,
            vehicle.currentProduct.destination
          );
          if (path) {
            vehicle.setPath(path);
          }
        }
        vehicle.update();
      });
    }
  }

  getAllVehicles(): Vehicle[] {
    const allVehicles: Vehicle[] = [];
    for (const vehicles of this.vehicles.values()) {
      allVehicles.push(...vehicles);
    }
    return allVehicles;
  }
} 