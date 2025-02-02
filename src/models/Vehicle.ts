export class Vehicle {
  id: string;
  type: 'truck' | 'van';
  capacity: number;
  location: { x: number; y: number };
  companyId: string;
  currentProduct?: {
    name: string;
    quantity: number;
    destination: { x: number; y: number };
  };
  path: { x: number; y: number }[] | null = null;
  private currentStep: number = 0;

  constructor(type: 'truck' | 'van', companyId: string, location: { x: number; y: number }) {
    this.id = `vehicle-${Math.random().toString(36).substr(2, 9)}`;
    this.type = type;
    this.capacity = type === 'truck' ? 10 : 5;
    this.companyId = companyId;
    this.location = location;
  }

  assignDelivery(product: { name: string; quantity: number }, destination: { x: number; y: number }) {
    if (product.quantity > this.capacity) {
      return false;
    }
    this.currentProduct = {
      name: product.name,
      quantity: product.quantity,
      destination
    };
    return true;
  }

  setPath(path: { x: number; y: number }[]) {
    this.path = path;
    this.currentStep = 0;
  }

  update() {
    if (this.path && this.currentStep < this.path.length) {
      this.location = this.path[this.currentStep];
      this.currentStep++;
      
      if (this.currentStep >= this.path.length) {
        // 到達目的地
        this.completeDelivery();
      }
    }
  }

  private completeDelivery() {
    this.currentProduct = undefined;
    this.path = null;
  }
} 