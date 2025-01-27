import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('game-app')
export class GameApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: relative;
    }
    
    world-map {
      display: block;
    }
    
    fps-hud {
      position: absolute;
      top: 10px;
      right: 10px;
    }
    
    game-control-hud {
      position: absolute;
      top: 10px;
      left: 10px;
    }
  `;

  private handleGamePause(e: CustomEvent) {
    const worldMap = this.shadowRoot?.querySelector('world-map');
    if (worldMap) {
      worldMap.dispatchEvent(new CustomEvent('game-pause', {
        detail: e.detail
      }));
    }
  }

  private handleGameSpeed(e: CustomEvent) {
    const worldMap = this.shadowRoot?.querySelector('world-map');
    if (worldMap) {
      worldMap.dispatchEvent(new CustomEvent('game-speed', {
        detail: e.detail
      }));
    }
  }

  render() {
    return html`
      <world-map></world-map>
      <fps-hud></fps-hud>
      <game-control-hud
        @game-pause=${this.handleGamePause}
        @game-speed=${this.handleGameSpeed}
      ></game-control-hud>
    `;
  }
} 