import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { WorldSimulation } from '../services/world-simulation';
import './action-history/action-history';
import './company-list/company-list';
import './world-map';

@customElement('game-app')
export class GameApp extends LitElement {
  private simulation = WorldSimulation.getInstance();

  constructor() {
    super();
    this.simulation.subscribe(() => {
      this.requestUpdate();
    });
    
    // 啟動世界模擬
    this.simulation.start();
    // window.addEventListener('click', (evt) => { console.log(evt); }, true)
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    #game-container {
      flex-grow: 1;
      position: relative;
      overflow: auto;
      border: 1px solid #ccc;
      margin: 10px;
      padding: 10px;
    }

    .bottom-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      margin-top: 10px;
    }

    company-list {
      width: 100%;
      margin-bottom: 10px;
    }

    action-history {
      width: 100%;
    }

    world-map {
      display: block;
      width: 100%;
      height: 100%;
    }
  `;

  render() {
    return html`
      <div id="game-container">
        <world-map .simulation=${this.simulation}></world-map>
      </div>
      <div class="bottom-container">
        ${this.simulation?.gameState ? 
          html`<company-list .gameState=${this.simulation.gameState}></company-list>` : 
          html`<div>Loading game state...</div>`
        }
        <action-history></action-history>
      </div>
    `;
  }
} 