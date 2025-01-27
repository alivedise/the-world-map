import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { WorldSimulation } from '../services/world-simulation';

@customElement('game-app')
export class GameApp extends LitElement {
  private simulation = WorldSimulation.getInstance();

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

  render() {
    return html`
      <world-map .simulation=${this.simulation}></world-map>
      <fps-hud></fps-hud>
      <game-control-hud
        .simulation=${this.simulation}
      ></game-control-hud>
    `;
  }
} 