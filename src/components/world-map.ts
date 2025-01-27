import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MapGenerator } from '../services/map-generator';
import { GameLoop } from '../services/game-loop';

@customElement('world-map')
export class WorldMap extends LitElement {
  private mapGenerator = new MapGenerator(30, 20);
  private gameLoop: GameLoop;
  private gameSpeed: number = 1;
  private isPaused: boolean = false;

  @property({ type: Array })
  private mapData: number[][] = [];

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

    .tile {
      width: 32px;
      height: 32px;
      transition: background-color 0.3s ease;
    }

    .tile-0 { /* 草地 */
      background-color: #7ec850;
    }

    .tile-1 { /* 沙地 */
      background-color: #e6c587;
    }

    .tile-2 { /* 水域 */
      background-color: #6b8cce;
    }

    .tile-3 { /* 山地 */
      background-color: #8b7355;
    }

    .tile:hover {
      filter: brightness(1.2);
      cursor: pointer;
    }
  `;

  constructor() {
    super();
    this.gameLoop = new GameLoop(this.update.bind(this));
    
    this.addEventListener('game-pause', ((e: CustomEvent) => {
      this.isPaused = e.detail.isPaused;
    }) as EventListener);
    
    this.addEventListener('game-speed', ((e: CustomEvent) => {
      this.gameSpeed = e.detail.speed;
    }) as EventListener);
  }

  firstUpdated() {
    this.mapData = this.mapGenerator.generate();
    this.gameLoop.start();
  }

  private handleTileClick(x: number, y: number) {
    console.log(`點擊格子座標: x=${x}, y=${y}, 地形類型=${this.mapData[y][x]}`);
  }

  render() {
    return html`
      <div class="map-container">
        ${this.mapData.map((row, y) => 
          row.map((tile, x) => html`
            <div 
              class="tile tile-${tile}"
              @click=${() => this.handleTileClick(x, y)}
              title="座標: ${x},${y}"
            ></div>
          `)
        )}
      </div>
    `;
  }
} 