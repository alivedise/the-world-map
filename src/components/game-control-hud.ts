import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { WorldSimulation } from '../services/world-simulation';

@customElement('game-control-hud')
export class GameControlHud extends LitElement {
  @property({ type: Object })
  simulation!: WorldSimulation;

  private unsubscribe?: () => void;

  static styles = css`
    :host {
      display: block;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      padding: 10px;
      border-radius: 4px;
      font-family: monospace;
    }

    .controls {
      display: flex;
      gap: 10px;
      margin-bottom: 8px;
    }

    button {
      background: #4a4a4a;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
    }

    button:hover {
      background: #5a5a5a;
    }

    button.active {
      background: #6a6a6a;
    }

    .time-display {
      margin-top: 5px;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = this.simulation.subscribe(() => {
      this.requestUpdate();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  private togglePause() {
    this.simulation.setPaused(!this.simulation.isPaused);
  }

  private setSpeed(speed: number) {
    this.simulation.setGameSpeed(speed);
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  render() {
    return html`
      <div class="controls">
        <button
          @click=${this.togglePause}
          class=${this.simulation.isPaused ? 'active' : ''}
        >
          ${this.simulation.isPaused ? '繼續' : '暫停'}
        </button>
        <button
          @click=${() => this.setSpeed(1)}
          class=${this.simulation.gameSpeed === 1 ? 'active' : ''}
        >
          x1
        </button>
        <button
          @click=${() => this.setSpeed(2)}
          class=${this.simulation.gameSpeed === 2 ? 'active' : ''}
        >
          x2
        </button>
        <button
          @click=${() => this.setSpeed(3)}
          class=${this.simulation.gameSpeed === 3 ? 'active' : ''}
        >
          x3
        </button>
      </div>
      <div class="time-display">
        遊戲時間: ${this.formatTime(this.simulation.gameTime)}
      </div>
    `;
  }
} 