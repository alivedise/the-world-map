import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CompanyType, companyTypeDefinitions } from '../../models/CompanyType';
import { Company } from '../../models/Company';
import { WorldSimulation } from '../../services/world-simulation';
import { CompanyController } from '../../controllers/company-controller';
import { getProductIcon } from '../../utils/product-icons';
import { getCompanyColor } from '../../utils/company-colors';

@customElement('company-list')
export class CompanyList extends LitElement {
  @property({ type: Object })
  gameState: any;

  private companyController?: CompanyController;

  // 確保在 gameState 更新後處理資料
  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('gameState') && this.gameState) {
      console.log('CompanyList receiving gameState:', this.gameState);
      
      // 檢查 gameState 是否初始化
      if (!this.gameState.companyManager) {
        console.error('CompanyManager not initialized in gameState:', this.gameState);
      }
      
      this.requestUpdate();
    }
  }

  protected firstUpdated() {
    if (this.gameState && !this.companyController) {
      console.log('First updated: Creating CompanyController with gameState:', this.gameState);
      this.companyController = new CompanyController(this, this.gameState);
    }
  }

  static styles = css`
    :host {
      display: block;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      max-height: 200px;
      overflow-y: auto;
      font-family: 'Noto Sans TC', sans-serif;
      width: 100%;
      position: relative;
      margin-top: 10px;
    }

    :host::-webkit-scrollbar {
      width: 8px;
    }

    :host::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
    }

    :host::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }

    :host::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.3);
    }

    .title {
      margin-bottom: 1rem;
      font-size: 1.5rem;
      color: #333;
      position: sticky;
      top: 0;
      background: rgba(255, 255, 255, 0.9);
      padding: 0.5rem 0;
      z-index: 1;
    }

    .list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .company-card {
      padding: 1rem;
      background: white;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .emoji {
      font-size: 1.5rem;
    }

    .name {
      font-weight: bold;
      flex-grow: 1;
    }

    .type {
      color: #666;
      font-size: 0.9rem;
    }

    .section {
      margin-top: 1rem;
    }

    .section h3 {
      font-size: 1rem;
      color: #666;
      margin-bottom: 0.5rem;
    }

    .item {
      padding: 0.5rem;
      background: #f5f5f5;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .inventory-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .progress-bar {
      margin-top: 0.5rem;
      height: 4px;
      background: #eee;
      border-radius: 2px;
    }

    .progress {
      height: 100%;
      background: #4CAF50;
      border-radius: 2px;
      transition: width 0.3s ease;
    }
    
    .no-production {
      color: #888;
      font-style: italic;
      padding: 0.5rem;
    }

    .product-section {
      margin-top: 1rem;
    }

    .product-item {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 6px 10px;
      background-color: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      margin-bottom: 5px;
    }
    
    .product-info {
      display: flex;
      align-items: center;
      width: 100%;
      margin-bottom: 5px;
    }
    
    .product-icon {
      font-size: 1.2em;
      margin-right: 8px;
    }
    
    .product-icon.small {
      font-size: 1em;
    }
    
    .product-name {
      font-weight: 500;
      flex: 1;
    }
    
    .production-status {
      font-size: 0.8em;
      margin-left: auto;
      padding: 2px 6px;
      border-radius: 10px;
      background-color: #e3f2fd;
      color: #2196F3;
    }
    
    .production-status.active {
      background-color: #e8f5e9;
      color: #4CAF50;
    }
    
    .production-item {
      display: flex;
      flex-direction: column;
    }
    
    .card {
      border-left: 4px solid #9E9E9E;
    }

    .product-item {
      display: flex;
      align-items: center;
      padding: 6px 10px;
      background-color: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      margin-bottom: 5px;
    }
    
    .product-icon {
      font-size: 1.2em;
      margin-right: 8px;
    }
    
    .product-icon.small {
      font-size: 1em;
    }
    
    .product-name {
      font-weight: 500;
    }
    
    .production-item {
      display: flex;
      flex-direction: column;
    }
    
    .product-info {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
    }
    
    .inventory-item {
      display: flex;
      align-items: center;
    }
    
    .inventory-name {
      flex: 1;
    }
    
    .inventory-quantity {
      font-weight: 500;
      background-color: rgba(0, 0, 0, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }
    
    .company-type {
      font-size: 0.7em;
      padding: 2px 8px;
      border-radius: 4px;
      color: white;
      text-transform: uppercase;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .company-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      padding: 4px 8px;
      background-color: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      font-size: 0.85em;
    }
    
    .info-label {
      font-weight: 500;
      color: #666;
    }
    
    .info-value {
      color: #333;
    }
    
    .employee-count {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .speed-multiplier {
      margin-left: auto;
      padding: 2px 6px;
      background-color: #e3f2fd;
      color: #2196F3;
      border-radius: 4px;
      font-size: 0.8em;
    }
    
    .add-employee-btn, .remove-employee-btn {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      cursor: pointer;
      margin-left: 5px;
    }
    
    .add-employee-btn {
      background-color: #4CAF50;
      color: white;
    }
    
    .remove-employee-btn {
      background-color: #F44336;
      color: white;
    }

    .loading-message {
      padding: 1rem;
      text-align: center;
      color: #666;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      margin: 0.5rem 0;
      font-style: italic;
    }
  `;

  private renderCompanyCard(company: Company) {
    // 使用更簡單的方式獲取數據
    const address = company.getAddress();
    const activeRecipes = [...company.getActiveProductions()];

    const producibleProducts = company.getProducibleProducts();

    return html`
      <div class="card" style="border-left: 4px solid ${getCompanyColor(company.getType())};">
        <div class="header">
          <h3>${company.getName()}</h3>
          <div class="company-type" style="background-color: ${getCompanyColor(company.getType())}">
            ${company.getType()}
          </div>
        </div>
        
        <div class="info">
          ${address ? html`<div class="address">📍 ${address}</div>` : ''}
        </div>
        
        <div class="company-info">
          <div class="employee-count">
            <span class="info-label">員工:</span>
            <span class="info-value">${company.getEmployees()}</span>
          </div>
          <div class="speed-multiplier">
            速度: ${company.getSpeedMultiplier().toFixed(1)}x
          </div>
          <button class="add-employee-btn" @click="${() => this.addEmployee(company)}">+</button>
          ${company.getEmployees() > 0 ? html`<button class="remove-employee-btn" @click="${() => this.removeEmployee(company)}">-</button>` : ''}
        </div>
        
        <div class="section">
          <h3>可生產產品</h3>
          ${producibleProducts.length > 0
            ? producibleProducts.map(product => {
                return html`
                  <div class="product-item">
                    <div class="product-info">
                      <span class="product-icon">${getProductIcon(product.productName)}</span>
                      <span class="product-name">${product.productName}</span>
                      ${product.isProducing 
                        ? html`<span class="production-status active">生產中</span>` 
                        : html`<span class="production-status">未生產</span>`
                      }
                    </div>
                    ${product.isProducing ? html`
                      <div class="progress-bar">
                        <div class="progress" style="width: ${product.productionProgress}%"></div>
                      </div>
                    ` : ''}
                  </div>
                `;
              })
            : html`<div class="item no-production">無可生產產品</div>`
          }
        </div>

        <div class="section">
          <h3>生產狀態</h3>
          ${activeRecipes.length > 0 
            ? activeRecipes.map(([recipeId, production]) => html`
                <div class="item production-item">
                  <div class="product-info">
                    <span class="product-icon">${getProductIcon(production.recipe.output.productName)}</span>
                    <span>${production.recipe.output.productName}</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress" style="width: ${(production.progress / production.recipe.productionTime) * 100}%"></div>
                  </div>
                </div>
              `)
            : html`<div class="item no-production">目前沒有進行中的生產</div>`
          }
        </div>
        
        <div class="section">
          <h3>庫存</h3>
          ${company.getInventoryStatus().length > 0
            ? company.getInventoryStatus().map(item => html`
                <div class="item inventory-item">
                  <span class="product-icon small">${getProductIcon(item.productName)}</span>
                  <span class="inventory-name">${item.productName}</span>
                  <span class="inventory-quantity">${item.quantity}</span>
                </div>
              `)
            : html`<div class="item no-production">沒有庫存</div>`
          }
        </div>
      </div>
    `;
  }

  addEmployee(company: Company) {
    const currentEmployees = company.getEmployees();
    company.setEmployees(currentEmployees + 1);
    this.requestUpdate();
  }

  removeEmployee(company: Company) {
    const currentEmployees = company.getEmployees();
    company.setEmployees(Math.max(0, currentEmployees - 1));
    this.requestUpdate();
  }

  render() {
    // 檢查 gameState 是否已連接和 CompanyController 是否已初始化
    if (!this.gameState) {
      return html`<div class="loading-message">等待 gameState 連接...</div>`;
    }
    
    if (!this.companyController) {
      // 如果 gameState 已連接但控制器尚未初始化，我們嘗試再次初始化它
      console.log('CompanyController 尚未初始化，嘗試重新初始化...');
      setTimeout(() => {
        if (!this.companyController && this.gameState) {
          this.companyController = new CompanyController(this, this.gameState);
        }
      }, 100);
      return html`<div class="loading-message">初始化公司控制器中...</div>`;
    }

    // 安全地獲取公司列表
    let companies = [];
    try {
      companies = this.companyController.companies || [];
      if (!Array.isArray(companies)) {
        console.error('Companies is not an array:', companies);
        companies = [];
      }
    } catch (e) {
      console.error('Error getting companies:', e);
    }

    console.log('Rendering company list with companies:', companies);

    return html`
      <h2 class="title">公司列表 (${companies.length}間)</h2>
      <div class="list">
        ${companies.map(company => {
          // 添加額外的防錯檢查
          if (!company || typeof company !== 'object') {
            console.error('Invalid company object:', company);
            return html`<div>錯誤的公司數據</div>`;
          }
          
          try {
            // 確保 company 有所需的方法
            if (typeof company.getBuildings !== 'function') {
              console.error('Company missing getBuildings method:', company);
              return html`<div>公司數據缺少必要方法</div>`;
            }
            if (typeof company.getName !== 'function') {
              console.error('Company missing getName method:', company);
              return html`<div>公司數據缺少必要方法</div>`;
            }
            if (typeof company.getType !== 'function') {
              console.error('Company missing getType method:', company);
              return html`<div>公司數據缺少必要方法</div>`;
            }
            if (typeof company.getProducibleProducts !== 'function') {
              console.error('Company missing getProducibleProducts method:', company);
              return html`<div>公司數據缺少必要方法</div>`;
            }
            if (typeof company.getInventoryStatus !== 'function') {
              console.error('Company missing getInventoryStatus method:', company);
              return html`<div>公司數據缺少必要方法</div>`;
            }
            if (typeof company.getActiveProductions !== 'function') {
              console.error('Company missing getActiveProductions method:', company);
              return html`<div>公司數據缺少必要方法</div>`;
            }
            if (typeof company.getEmployees !== 'function') {
              console.error('Company missing getEmployees method:', company);
              return html`<div>公司數據缺少必要方法</div>`;
            }
            if (typeof company.getSpeedMultiplier !== 'function') {
              console.error('Company missing getSpeedMultiplier method:', company);
              return html`<div>公司數據缺少必要方法</div>`;
            }
            if (typeof company.setEmployees !== 'function') {
              console.error('Company missing setEmployees method:', company);
              return html`<div>公司數據缺少必要方法</div>`;
            }
            
            return this.renderCompanyCard(company);
          } catch (error) {
            console.error('Error rendering company card:', error, company);
            return html`<div>渲染公司卡片時出錯</div>`;
          }
        })}
      </div>
    `;
  }
}
