import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('game-control-hud')
export class GameControlHud extends LitElement {
  @property({ type: Boolean })
  private isPaused: boolean = false;

  @property({ type: Number })
  private gameSpeed: number = 1;

  @property({ type: Number })
  private gameTime: number = 0;

  private intervalId?: number;

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
    this.startTimer();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
  }

  private startTimer() {
    this.intervalId = window.setInterval(() => {
      if (!this.isPaused) {
        this.gameTime += 1 * this.gameSpeed;
      }
    }, 1000);
  }

  private togglePause() {
    this.isPaused = !this.isPaused;
    this.dispatchEvent(new CustomEvent('game-pause', {
      detail: { isPaused: this.isPaused },
      bubbles: true,
      composed: true
    }));
  }

  private setSpeed(speed: number) {
    this.gameSpeed = speed;
    this.dispatchEvent(new CustomEvent('game-speed', {
      detail: { speed },
      bubbles: true,
      composed: true
    }));
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  render() {
    return html`
      <div class="controls">
        <button
          @click=${this.togglePause}
          class=${this.isPaused ? 'active' : ''}
        >
          ${this.isPaused ? '繼續' : '暫停'}
        </button>
        <button
          @click=${() => this.setSpeed(1)}
          class=${this.gameSpeed === 1 ? 'active' : ''}
        >
          x1
        </button>
        <button
          @click=${() => this.setSpeed(2)}
          class=${this.gameSpeed === 2 ? 'active' : ''}
        >
          x2
        </button>
        <button
          @click=${() => this.setSpeed(3)}
          class=${this.gameSpeed === 3 ? 'active' : ''}
        >
          x3
        </button>
      </div>
      <div class="time-display">
        遊戲時間: ${this.formatTime(this.gameTime)}
      </div>
    `;
  }
} 