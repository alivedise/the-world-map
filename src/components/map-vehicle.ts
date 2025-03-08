import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Vehicle } from '../models/Vehicle';

@customElement('map-vehicle')
export class MapVehicle extends LitElement {
  @property({ type: Object })
  vehicle!: Vehicle;

  @property({ type: Number })
  gridSize = 32;

  static styles = css`
    .vehicle {
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 0;
      left: 0;
      transition: transform 0.2s ease-in-out;
      width: 20px;
      height: 20px;
      font-size: 14px;
      z-index: 10;
      cursor: pointer;
    }

    .vehicle:hover {
      filter: brightness(1.2);
      transform: scale(1.1);
      z-index: 100;
    }

    .vehicle .label {
      position: absolute;
      top: -18px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 2px 4px;
      border-radius: 4px;
      font-size: 9px;
      white-space: nowrap;
      display: none;
    }

    .vehicle:hover .label {
      display: block;
    }

    .status-icon {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .status-icon.idle {
      background-color: #aaa;
    }

    .status-icon.loading {
      background-color: #fff566;
    }

    .status-icon.delivering {
      background-color: #52c41a;
    }

    .status-icon.unloading {
      background-color: #faad14;
    }

    .status-icon.returning {
      background-color: #1890ff;
    }
  `;

  private handleClick() {
    this.dispatchEvent(new CustomEvent('vehicle-click', {
      detail: { 
        x: this.vehicle.location.x, 
        y: this.vehicle.location.y, 
        id: this.vehicle.id,
        companyId: this.vehicle.companyId
      },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    const x = this.vehicle.location.x * this.gridSize;
    const y = this.vehicle.location.y * this.gridSize;
    
    // 產品信息
    const deliveryInfo = this.vehicle.getDeliveryInfo();
    let productLabel = '';
    
    if (deliveryInfo) {
      productLabel = `${deliveryInfo.productName} x${deliveryInfo.quantity} (${Math.floor(deliveryInfo.progress)}%)`;
    }
    
    return html`
      <div
        class="vehicle ${this.vehicle.type}"
        style="transform: translate(${x}px, ${y}px); background-color: ${this.vehicle.color}"
        @click="${this.handleClick}"
      >
        ${this.vehicle.type === 'truck' ? '🚛' : '🚐'}
        <div class="status-icon ${this.vehicle.getStatus()}"></div>
        <div class="label">
          ${this.vehicle.type === 'truck' ? '卡車' : '貨車'} ID: ${this.vehicle.id.split('-')[1]}
          ${deliveryInfo ? html`<br>${productLabel}` : ''}
        </div>
      </div>
    `;
  }
}