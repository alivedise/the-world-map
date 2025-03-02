import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CompanyType, companyTypeDefinitions } from '../../models/CompanyType';
import { Company } from '../../models/Company';
import { WorldSimulation } from '../../services/world-simulation';
import { CompanyController } from '../../controllers/company-controller';

@customElement('company-list')
export class CompanyList extends LitElement {
  @property({ type: Object })
  simulation!: WorldSimulation;

  private companyController?: CompanyController;

  // 確保在 simulation 更新後再創建 controller
  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('simulation') && this.simulation) {
      console.log('Creating CompanyController with simulation:', this.simulation);
      this.companyController = new CompanyController(this, this.simulation);
    }
  }

  protected firstUpdated() {
    if (this.simulation && !this.companyController) {
      console.log('First updated: Creating CompanyController with simulation:', this.simulation);
      this.companyController = new CompanyController(this, this.simulation);
    }
  }

  static styles = css`
    :host {
      display: block;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      max-height: 80vh;
      overflow-y: auto;
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
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: #f0f8ff;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .product-icon {
      font-size: 1.2rem;
      color: #4169E1;
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
  `;

  private renderCompanyCard(company: Company) {
    // 使用更簡單的方式獲取數據，不依賴于可能不存在的方法
    // const address = company.getAddress();
    // const activeRecipes = [...company.getActiveProductions()];
    
    // 直接使用建築物 ID 列表
    const buildings = company.getBuildings();
    const address = buildings.length > 0 ? `Building ${buildings[0]}` : null;
    
    // 由於沒有getActiveProductions方法，我們暫時禁用生產狀態顯示
    const activeRecipes: any[] = []; // 空數組
    
    const producibleProducts = company.getProducibleProducts();

    // 根據英文產品名稱選擇適當的圖標
    const getProductIcon = (productName: string) => {
      if (productName.includes('personal_computer') || productName.includes('pc')) return '💻';
      if (productName.includes('smartphone')) return '📱';
      if (productName.includes('software_app') || productName.includes('saas_solution') || 
          productName.includes('ai_service') || productName.includes('cloud_service')) return '☁️';
      if (productName.includes('meal') || productName.includes('food') || 
          productName.includes('dessert')) return '🍽️';
      if (productName.includes('vegetables')) return '🥬';
      if (productName.includes('fruits')) return '🍎';
      if (productName.includes('grains')) return '🌾';
      if (productName.includes('electronic')) return '🔌';
      if (productName.includes('logistics') || productName.includes('express_delivery') || 
          productName.includes('warehousing')) return '🚚';
      if (productName.includes('furniture')) return '🪑';
      return '🔄'; // 默認圖標
    };

    // 為不同公司類型選擇顏色
    const getCompanyColor = (type: CompanyType | string) => {
      // 確保 type 是 CompanyType 類型
      const companyType = typeof type === 'string' ? type as CompanyType : type;

      switch(companyType) {
        case CompanyType.FARM: return '#8BC34A';
        case CompanyType.RESTAURANT: return '#FF9800';
        case CompanyType.FACTORY: return '#607D8B';
        case CompanyType.RETAIL: return '#E91E63';
        case CompanyType.TECH: return '#2196F3';
        case CompanyType.LOGISTICS: return '#9C27B0';
        default: return '#9E9E9E';
      }
    };

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
        
        <div class="section">
          <h3>可生產產品</h3>
          ${producibleProducts.length > 0 
            ? producibleProducts.map(product => html`
                <div class="product-item">
                  <span class="product-icon">${getProductIcon(product.productName)}</span>
                  <span class="product-name">${product.productName}</span>
                </div>
              `)
            : html`<div class="item no-production">無可生產產品</div>`
          }
        </div>

        <!-- 暫時隱藏生產狀態部分 -->
        <!-- <div class="section">
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
        </div> -->
        
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

  render() {
    if (!this.companyController) {
      console.error('CompanyController is not initialized');
      return html`<div>載入中...CompanyController未初始化</div>`;
    }

    if (!this.companyController.companies || !Array.isArray(this.companyController.companies)) {
      console.error('Companies is not an array:', this.companyController.companies);
      return html`<div>載入中...無法獲取公司列表</div>`;
    }

    console.log('Rendering company list with companies:', this.companyController.companies);

    return html`
      <h2 class="title">公司列表 (${this.companyController.companies.length}間)</h2>
      <div class="list">
        ${this.companyController.companies.map(company => {
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
