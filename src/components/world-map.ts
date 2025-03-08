import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { WorldSimulation } from '../services/world-simulation';
import './map-building'; // 引入建築元件
import './map-citizen'; // 引入公民元件
import './map-vehicle';
import './citizen-info-panel'; // 引入市民資訊面板
import './vehicle-info-panel'; // 引入車輛資訊面板

@customElement('world-map')
export class WorldMap extends LitElement {
  @property({ type: Object })
  simulation!: WorldSimulation;

  @property({ type: Object })
  private selectedCitizen: any = null;

  @property({ type: Boolean })
  private showCitizenPanel: boolean = false;

  @property({ type: Object })
  private selectedVehicle: any = null;

  @property({ type: Boolean })
  private showVehiclePanel: boolean = false;

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
    .hud {
      position: fixed;
      top: 10px;
      right: 10px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: Arial, sans-serif;
      z-index: 1000;
    }
    .citizen-counter {
      font-size: 16px;
      font-weight: bold;
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
      const { x, y, name, id } = event.detail;
      console.log(`Citizen clicked: ${name} (ID: ${id}) at x=${x}, y=${y}`);
      
      // Find the clicked citizen in our citizens array
      const citizen = this.simulation.getCitizens().find(c => c.id === id);
      
      if (citizen) {
        this.selectedCitizen = citizen;
        this.showCitizenPanel = true;
        this.requestUpdate();
      }
    });

    this.addEventListener('vehicle-click', (event) => {
      const { x, y, id } = event.detail;
      console.log(`Vehicle clicked: ${id} at x=${x}, y=${y}`);
      
      // Find the clicked vehicle in our vehicles array
      const vehicle = this.simulation.getVehicles().find(v => v.id === id);
      
      if (vehicle) {
        this.selectedVehicle = vehicle;
        this.showVehiclePanel = true;
        this.requestUpdate();
      }
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
    const gridSize = 32;

    console.log(`Rendering ${citizens.length} citizens`);
    
    return html`
      <div>
        <!-- HUD for showing citizen count -->
        <div class="hud">
          <div class="citizen-counter">市民數量: ${citizens.length}</div>
        </div>
        
        <!-- Citizen Info Panel -->
        <citizen-info-panel 
          .citizen="${this.selectedCitizen}"
          .visible="${this.showCitizenPanel}"
          @close="${() => { this.showCitizenPanel = false; this.requestUpdate(); }}">
        </citizen-info-panel>
        
        <!-- Vehicle Info Panel -->
        <vehicle-info-panel 
          .vehicle="${this.selectedVehicle}"
          .visible="${this.showVehiclePanel}"
          @close="${() => { this.showVehiclePanel = false; this.requestUpdate(); }}">
        </vehicle-info-panel>
        
        ${blocks.map((row, rowIndex) => html`
          <div style="display: flex;" key="row-${rowIndex}">
            ${row.map((block, blockIndex) => {
              const terrainColor = block.getTerrainColor();
              return html`<div class="block" style="background-color: ${terrainColor};" key="block-${rowIndex}-${blockIndex}"></div>`;
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
            .color=${building.getColor()}
            .gridSize=${gridSize}>
          </map-building>
        `)}
        ${citizens.map(citizen => html`
          <map-citizen 
            .x=${citizen.location.x} 
            .y=${citizen.location.y} 
            .name=${citizen.name}
            .id=${citizen.id}
            .color=${citizen.color}
            .gridSize=${gridSize}
            key="citizen-${citizen.id}">
          </map-citizen>
        `)}
        ${vehicles.map(vehicle => html`
          <map-vehicle
            .vehicle=${vehicle}
            .gridSize=${gridSize}>
          </map-vehicle>
        `)}
      </div>
    `;
  }
}