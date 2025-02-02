import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { companyTypeDefinitions } from '../../models/CompanyType';
import { Company } from '../../models/Company';
import { WorldSimulation } from '../../services/world-simulation';
import { CompanyController } from '../../controllers/company-controller';

@customElement('company-list')
export class CompanyList extends LitElement {
  @property({ type: Object })
  simulation!: WorldSimulation;

  private companyController?: CompanyController;

  protected firstUpdated() {
    this.companyController = new CompanyController(this, this.simulation);
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
  `;

  private renderCompanyCard(company: Company) {
    const type = company.getType();
    const typeDefinition = companyTypeDefinitions[type];

    return html`
      <div class="company-card">
        <div class="header">
          <span class="emoji">${typeDefinition.emoji}</span>
          <span class="name">${company.getName()}</span>
          <span class="type">${typeDefinition.name}</span>
        </div>
        
        <div class="section">
          <h3>地址</h3>
          <div class="item">${company.getBuildings()[0]}</div>
        </div>

        <div class="section">
          <h3>生產狀態</h3>
          ${Array.from(company['activeRecipes'].entries()).map(([recipeId, production]) => html`
            <div class="item">
              ${production.recipe.output.productName}
              <div class="progress-bar">
                <div class="progress" style="width: ${(production.progress / production.recipe.productionTime) * 100}%"></div>
              </div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  render() {
    if (!this.companyController) {
      return html`<div>載入中...</div>`;
    }

    return html`
      <h2 class="title">公司列表</h2>
      <div class="list">
        ${this.companyController.companies.map(company => this.renderCompanyCard(company))}
      </div>
    `;
  }
}
