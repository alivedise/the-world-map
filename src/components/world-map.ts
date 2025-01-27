import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { GameState } from '../services/game-state';
import { GameLoop } from '../services/game-loop';
import { MapTile } from './map-tile';

@customElement('world-map')
export class WorldMap extends LitElement {
  private gameState: GameState;
  private gameLoop: GameLoop;
  private unsubscribe?: () => void;

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
  `;

  constructor() {
    super();
    this.gameState = new GameState({ width: 30, height: 20 });
    this.gameLoop = new GameLoop(this.updateGameState.bind(this));
    
    this.addEventListener('game-pause', ((e: CustomEvent) => {
      this.gameState.setPaused(e.detail.isPaused);
    }) as EventListener);
    
    this.addEventListener('game-speed', ((e: CustomEvent) => {
      this.gameState.setGameSpeed(e.detail.speed);
    }) as EventListener);
  }

  connectedCallback() {
    super.connectedCallback();
    this.gameState.initialize();
    this.unsubscribe = this.gameState.subscribe(() => {
      this.mapData = this.gameState.mapData;
      this.requestUpdate();
    });
    this.gameLoop.start();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.gameLoop.stop();
    this.unsubscribe?.();
  }

  private updateGameState(deltaTime: number) {
    this.gameState.updateGameTime(deltaTime);
  }

  private handleTileClick(x: number, y: number) {
    this.gameState.handleTileClick(x, y);
  }

  render() {
    return html`
      <div class="map-container">
        ${this.mapData.map((row, y) => 
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