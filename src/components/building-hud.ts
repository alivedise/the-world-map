import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { WorldSimulation } from '../services/world-simulation';
import { BuildingController } from '../controllers/building-controller';

@customElement('building-hud')
export class BuildingHud extends LitElement {
  @property({ type: Object })
  simulation!: WorldSimulation;

  private buildingController?: BuildingController;

  protected firstUpdated() {
    this.buildingController = new BuildingController(this, this.simulation);
  }

  static styles = css`
    :host {
      display: block;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      padding: 10px;
      border-radius: 4px;
      font-family: monospace;
    }
  `;

  render() {
    if (!this.buildingController) {
      return html`<div>載入中...</div>`;
    }

    const buildings = this.buildingController.buildings;

    return html`
      <div>建築物數量: ${buildings}</div>
    `;
  }
} 