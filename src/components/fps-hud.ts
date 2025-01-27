import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('fps-hud')
export class FpsHud extends LitElement {
  @property({ type: Number })
  private fps: number = 0;

  private lastTime: number = performance.now();
  private frameCount: number = 0;

  static styles = css`
    :host {
      display: block;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-family: monospace;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.updateFPS();
  }

  private updateFPS() {
    const currentTime = performance.now();
    this.frameCount++;

    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    requestAnimationFrame(() => this.updateFPS());
  }

  render() {
    return html`FPS: ${this.fps}`;
  }
} 