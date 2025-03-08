import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import Citizen from '../models/Citizen';

@customElement('citizen-info-panel')
export class CitizenInfoPanel extends LitElement {
  @property({ type: Object })
  citizen: Citizen | null = null;

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
      border-left: 5px solid #3498db;
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
    
    .gender-male {
      color: #3498db;
    }
    
    .gender-female {
      color: #e74c3c;
    }
    
    .mood {
      padding: 3px 8px;
      border-radius: 12px;
      display: inline-block;
      font-size: 12px;
      color: white;
    }
    
    .mood-Happy {
      background-color: #2ecc71;
    }
    
    .mood-Neutral {
      background-color: #f39c12;
    }
    
    .mood-Sad {
      background-color: #e74c3c;
    }
    
    .action-info {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px solid #eee;
    }
    
    .stats-container {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
    }
    
    .stat {
      flex: 1;
      text-align: center;
      padding: 5px;
    }
    
    .stat-label {
      font-size: 12px;
      color: #7f8c8d;
    }
    
    .stat-value {
      font-size: 16px;
      font-weight: bold;
      color: #2c3e50;
    }
    
    /* Progress bars for stats */
    .progress-bar {
      height: 6px;
      background-color: #ecf0f1;
      border-radius: 3px;
      margin-top: 5px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      border-radius: 3px;
    }
    
    .progress-energy {
      background-color: #f1c40f;
    }
    
    .progress-hunger {
      background-color: #e67e22;
    }
    
    .progress-happiness {
      background-color: #2ecc71;
    }
    
    .progress-money {
      background-color: #9b59b6;
    }
  `;

  closePanel() {
    this.visible = false;
  }

  formatLocation(location: { x: number; y: number }) {
    return `(${location.x.toFixed(1)}, ${location.y.toFixed(1)})`;
  }

  // Calculate percentage for progress bars
  calculatePercentage(value?: number) {
    if (value === undefined) return 0;
    return Math.min(100, Math.max(0, value));
  }

  render() {
    if (!this.citizen) return html``;

    const genderClass = this.citizen.gender === 'Male' ? 'gender-male' : 'gender-female';
    const moodClass = `mood-${this.citizen.mood}`;

    return html`
      <div class="info-panel ${this.visible ? 'visible' : ''}">
        <div class="header">
          <h2>${this.citizen.name}</h2>
          <button class="close-btn" @click="${this.closePanel}">×</button>
        </div>
        
        <div class="info-row">
          <div class="info-label">性別</div>
          <div class="info-value ${genderClass}">
            ${this.citizen.gender === 'Male' ? '👨 男' : '👩 女'}
          </div>
        </div>
        
        <div class="info-row">
          <div class="info-label">年齡</div>
          <div class="info-value">${this.citizen.age} 歲</div>
        </div>
        
        <div class="info-row">
          <div class="info-label">職業</div>
          <div class="info-value">
            ${this.citizen.occupation || '無業'}
          </div>
        </div>
        
        <div class="info-row">
          <div class="info-label">住址</div>
          <div class="info-value">
            ${this.citizen.homeAt || '無'}
          </div>
        </div>
        
        <div class="info-row">
          <div class="info-label">工作地點</div>
          <div class="info-value">
            ${this.citizen.workAt || '無'}
          </div>
        </div>
        
        <div class="info-row">
          <div class="info-label">心情</div>
          <div class="info-value">
            <span class="mood ${moodClass}">${this.citizen.mood}</span>
          </div>
        </div>
        
        <div class="info-row">
          <div class="info-label">目前位置</div>
          <div class="info-value">
            ${this.formatLocation(this.citizen.location)}
          </div>
        </div>
        
        <div class="stats-container">
          <div class="stat">
            <div class="stat-label">飢餓度</div>
            <div class="stat-value">${this.citizen.hunger || 0}</div>
            <div class="progress-bar">
              <div class="progress-fill progress-hunger" 
                   style="width: ${this.calculatePercentage(this.citizen.hunger)}%"></div>
            </div>
          </div>
          
          <div class="stat">
            <div class="stat-label">精力</div>
            <div class="stat-value">${this.citizen.energy || 0}</div>
            <div class="progress-bar">
              <div class="progress-fill progress-energy" 
                   style="width: ${this.calculatePercentage(this.citizen.energy)}%"></div>
            </div>
          </div>
        </div>
        
        <div class="stats-container">
          <div class="stat">
            <div class="stat-label">幸福感</div>
            <div class="stat-value">${this.citizen.happiness || 0}</div>
            <div class="progress-bar">
              <div class="progress-fill progress-happiness" 
                   style="width: ${this.calculatePercentage(this.citizen.happiness)}%"></div>
            </div>
          </div>
          
          <div class="stat">
            <div class="stat-label">金錢</div>
            <div class="stat-value">${this.citizen.money || 0}</div>
            <div class="progress-bar">
              <div class="progress-fill progress-money" 
                   style="width: ${this.calculatePercentage(this.citizen.money)}%"></div>
            </div>
          </div>
        </div>
        
        <div class="action-info">
          ${this.citizen.currentAction 
            ? html`
                <div class="info-row">
                  <div class="info-label">目前行動</div>
                  <div class="info-value">${this.citizen.currentAction.type}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">目標</div>
                  <div class="info-value">${this.citizen.currentAction.targetBuilding || '無'}</div>
                </div>
              `
            : html`<div class="info-value">目前閒置中</div>`
          }
        </div>
      </div>
    `;
  }
}
