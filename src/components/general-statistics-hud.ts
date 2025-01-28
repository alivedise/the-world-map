import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { WorldSimulation } from '../services/world-simulation';
import { PopulationController } from '../controllers/population-controller';

@customElement('general-statistics-hud')
export class GeneralStatisticsHud extends LitElement {
  @property({ type: Object })
  simulation!: WorldSimulation;

  private populationController?: PopulationController;

  protected firstUpdated() {
    this.populationController = new PopulationController(this, this.simulation);
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
    if (!this.populationController) {
      return html`<div>載入中...</div>`;
    }
    return html`<div>人口: ${this.populationController.population}</div>`;
  }
}