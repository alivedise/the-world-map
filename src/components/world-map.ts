import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { WorldSimulation } from '../services/world-simulation';
import './map-building'; // 引入建築元件
import './map-citizen'; // 引入公民元件

@customElement('world-map')
export class WorldMap extends LitElement {
  @property({ type: Object })
  simulation!: WorldSimulation;

  private unsubscribe?: () => void;

  static styles = css`
    :host {
      display: block;
      position: relative;
    }
    .block {
      width: 32px;
      height: 32px;
      display: inline-block;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.simulation.initialize();
    this.unsubscribe = this.simulation.subscribe(() => {
      this.requestUpdate();
    });
    this.simulation.start();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.simulation.stop();
    this.unsubscribe?.();
  }

  private handleBlockClick(x: number, y: number) {
    this.simulation.handleBlockClick(x, y);
  }

  render() {
    const blocks = this.simulation.gameState.blockManager.getAllBlocks();
    const buildings = this.simulation.gameState.buildingManager.buildings; // 獲取建築物列表
    const citizens = this.simulation.gameState.populationManager.getCitizens(); // 獲取公民列表

    return html`
      <div>
        ${blocks.map(row => html`
          <div style="display: flex;">
            ${row.map(block => {
              const terrainColor = block.getTerrainColor();
              return html`<div class="block" style="background-color: ${terrainColor};"></div>`;
            })}
          </div>
        `)}
        ${buildings.map(building => html`
          <map-building 
            .x=${building.getPosition().x} 
            .y=${building.getPosition().y} 
            .name=${building.name}
            .width=${building.getSize().width} 
            .height=${building.getSize().height} 
            .color=${building.getColor()}>
          </map-building>
        `)}
        ${citizens.map(citizen => html`
          <map-citizen 
            .x=${citizen.location.x} 
            .y=${citizen.location.y} 
            .name=${citizen.name}
            .color=${citizen.color}>
          </map-citizen>
        `)}
      </div>
    `;
  }
} 