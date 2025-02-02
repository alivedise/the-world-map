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
    }

    .truck {
      background-color: #4a90e2;
    }

    .van {
      background-color: #50e3c2;
    }

    .vehicle.has-product {
      border: 2px solid #f5a623;
    }
  `;

  render() {
    const x = this.vehicle.location.x * this.gridSize;
    const y = this.vehicle.location.y * this.gridSize;
    
    return html`
      <div
        class="vehicle ${this.vehicle.type} ${this.vehicle.currentProduct ? 'has-product' : ''}"
        style="transform: translate(${x}px, ${y}px)"
      >
        ${this.vehicle.type === 'truck' ? '🚛' : '🚐'}
      </div>
    `;
  }
} 