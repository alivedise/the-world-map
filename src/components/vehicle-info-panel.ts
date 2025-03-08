import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Vehicle } from '../models/Vehicle';

@customElement('vehicle-info-panel')
export class VehicleInfoPanel extends LitElement {
  @property({ type: Object })
  vehicle: Vehicle | null = null;

  @property({ type: Boolean })
  visible: boolean = false;

  static styles = css`
    .info-panel {
      position: fixed;
      top: 50px;
      right: 10px;
      background-color: rgba(255, 255, 255, 0.95);
      padding: 15px;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      width: 300px;
      font-family: Arial, sans-serif;
      color: #333;
      border-left: 5px solid #f39c12;
      max-height: calc(100vh - 100px);
      overflow-y: auto;
      transition: all 0.3s ease;
      transform: translateX(320px);
      opacity: 0;
    }
    
    .info-panel.visible {
      transform: translateX(0);
      opacity: 1;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    
    .header h2 {
      margin: 0;
      font-size: 18px;
      color: #2c3e50;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #7f8c8d;
    }
    
    .info-row {
      margin-bottom: 10px;
      display: flex;
    }
    
    .info-label {
      font-weight: bold;
      width: 100px;
      flex-shrink: 0;
      color: #7f8c8d;
    }
    
    .info-value {
      color: #2c3e50;
    }
    
    .status {
      padding: 3px 8px;
      border-radius: 12px;
      display: inline-block;
      font-size: 12px;
      color: white;
    }
    
    .status-idle {
      background-color: #7f8c8d;
    }
    
    .status-loading {
      background-color: #f39c12;
    }
    
    .status-delivering {
      background-color: #2ecc71;
    }
    
    .status-unloading {
      background-color: #e67e22;
    }
    
    .status-returning {
      background-color: #3498db;
    }
    
    .delivery-info {
      margin-top: 15px;
      padding: 10px;
      background-color: #f8f9fa;
      border-radius: 5px;
      border-left: 3px solid #f39c12;
    }
    
    .progress-container {
      margin-top: 10px;
    }
    
    .progress-bar {
      height: 10px;
      background-color: #ecf0f1;
      border-radius: 5px;
      overflow: hidden;
      margin-top: 5px;
    }
    
    .progress-fill {
      height: 100%;
      background-color: #f39c12;
      border-radius: 5px;
    }
  `;

  closePanel() {
    this.visible = false;
    this.dispatchEvent(new CustomEvent('close'));
  }

  formatLocation(location: { x: number; y: number }) {
    return `(${location.x.toFixed(1)}, ${location.y.toFixed(1)})`;
  }

  render() {
    if (!this.vehicle) return html``;

    const status = this.vehicle.getStatus();
    const statusClass = `status-${status}`;
    const deliveryInfo = this.vehicle.getDeliveryInfo();
    
    return html`
      <div class="info-panel ${this.visible ? 'visible' : ''}">
        <div class="header">
          <h2>${this.vehicle.type === 'truck' ? '🚛 卡車' : '🚐 貨車'} ID: ${this.vehicle.id.split('-')[1]}</h2>
          <button class="close-btn" @click="${this.closePanel}">×</button>
        </div>
        
        <div class="info-row">
          <div class="info-label">狀態</div>
          <div class="info-value">
            <span class="status ${statusClass}">
              ${status === 'idle' ? '空閒中' : 
                status === 'loading' ? '裝載中' : 
                status === 'delivering' ? '運送中' : 
                status === 'unloading' ? '卸貨中' : '返回中'}
            </span>
          </div>
        </div>
        
        <div class="info-row">
          <div class="info-label">所屬公司</div>
          <div class="info-value">
            公司 ID: ${this.vehicle.companyId}
          </div>
        </div>
        
        <div class="info-row">
          <div class="info-label">載重能力</div>
          <div class="info-value">${this.vehicle.capacity} 單位</div>
        </div>
        
        <div class="info-row">
          <div class="info-label">目前位置</div>
          <div class="info-value">
            ${this.formatLocation(this.vehicle.location)}
          </div>
        </div>
        
        <div class="info-row">
          <div class="info-label">速度</div>
          <div class="info-value">${this.vehicle.speed} 格/秒</div>
        </div>
        
        ${deliveryInfo ? html`
          <div class="delivery-info">
            <div class="info-row">
              <div class="info-label">運送產品</div>
              <div class="info-value">${deliveryInfo.productName}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">數量</div>
              <div class="info-value">${deliveryInfo.quantity} 單位</div>
            </div>
            
            ${this.vehicle.currentProduct?.sourceCompanyId ? html`
              <div class="info-row">
                <div class="info-label">起點公司</div>
                <div class="info-value">${this.vehicle.currentProduct.sourceCompanyId}</div>
              </div>
            ` : ''}
            
            ${this.vehicle.currentProduct?.destinationCompanyId ? html`
              <div class="info-row">
                <div class="info-label">目的公司</div>
                <div class="info-value">${this.vehicle.currentProduct.destinationCompanyId}</div>
              </div>
            ` : ''}
            
            ${this.vehicle.currentProduct?.destination ? html`
              <div class="info-row">
                <div class="info-label">目的地</div>
                <div class="info-value">${this.formatLocation(this.vehicle.currentProduct.destination)}</div>
              </div>
            ` : ''}
            
            <div class="progress-container">
              <div class="info-label">進度: ${Math.floor(deliveryInfo.progress)}%</div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${deliveryInfo.progress}%"></div>
              </div>
            </div>
          </div>
        ` : html`
          <div class="info-row">
            <div class="info-label">貨物狀態</div>
            <div class="info-value">空載狀態</div>
          </div>
        `}
      </div>
    `;
  }
}
