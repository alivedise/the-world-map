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

  private handleTileClick(x: number, y: number) {
    this.simulation.handleTileClick(x, y);
  }

  render() {
    const blocks = this.simulation.gameState.blockManager.getAllBlocks();
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
      </div>
    `;
  }
} 