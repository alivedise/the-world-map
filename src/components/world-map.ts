import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { WorldSimulation } from '../services/world-simulation';
import './map-building'; // 引入建築元件
import './map-citizen'; // 引入公民元件
import './map-vehicle';

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

    this.addEventListener('block-click', (event) => {
      const { x, y, type } = event.detail;
      console.log(`Block clicked at: x=${x}, y=${y}, type=${type}`);
    });

    this.addEventListener('citizen-click', (event) => {
      const { x, y, name } = event.detail;
      console.log(`Citizen clicked: ${name} at x=${x}, y=${y}`);
    });

    this.addEventListener('vehicle-click', (event) => {
      const { x, y, id } = event.detail;
      console.log(`Vehicle clicked: ${id} at x=${x}, y=${y}`);
    });
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
    const blocks = this.simulation.getBlocks();
    const buildings = this.simulation.getBuildings(); // 獲取建築物列表
    const citizens = this.simulation.getCitizens(); // 獲取公民列表
    const vehicles = this.simulation.getVehicles();

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
        ${vehicles.map(vehicle => html`
          <map-vehicle
            .vehicle=${vehicle}
            .gridSize=${32}>
          </map-vehicle>
        `)}
      </div>
    `;
  }
}