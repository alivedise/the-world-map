import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { WorldSimulation } from '../services/world-simulation';

@customElement('world-map')
export class WorldMap extends LitElement {
  @property({ type: Object })
  simulation!: WorldSimulation;
  
  private unsubscribe?: () => void;

  static styles = css`
    :host {
      display: block;
      background-color: #2c2c2c;
    }

    .map-container {
      display: grid;
      grid-template-columns: repeat(30, 32px);
      grid-template-rows: repeat(20, 32px);
      gap: 1px;
      background-color: rgba(0, 0, 0, 0.1);
      padding: 1px;
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

  private handleTileClick(x: number, y: number) {
    this.simulation.handleTileClick(x, y);
  }

  render() {
    const mapData = this.simulation.mapData;
    return html`
      <div class="map-container">
        ${mapData.map((row, y) => 
          row.map((tile, x) => html`
            <map-tile
              .type=${tile}
              .x=${x}
              .y=${y}
              @tile-click=${(e: CustomEvent) => this.handleTileClick(e.detail.x, e.detail.y)}
            ></map-tile>
          `)
        )}
      </div>
    `;
  }
} 